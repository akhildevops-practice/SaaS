import os
import json
import base64
import traceback
import anthropic
import requests
from pymilvus import Collection
from openai import OpenAI as org_opeani
from dotenv import load_dotenv
from pymongo import MongoClient
import time
import docx
import re
import openpyxl

from io import BytesIO
from PyPDF2 import PdfReader
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from services.docx_utils import convert_docx_to_html
from ai_models import ClaudeModel
from services.conversion_utls import convert_html_content_to_docx, docx_to_html, generate_html_template
import argparse
from datetime import datetime
from pymongo import MongoClient
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from dateutil import parser as date_parser
import numpy as np
from services.utils import (
    preprocess_docx, 
    get_entities_for_bulk_upload, 
    get_embedding_for_text, 
    get_feature_config, 
    calculate_gpt4_turbo_cost, 
    get_ai_model_config, 
    setup_model, 
    file_to_text, 
    get_org_details_by_id,
    get_all_risk_categories,
    download_file_from_oci,
    )
from utils.license_token_tracker import track_token_usage_in_license
from prompt_templates.templates import main_template, audit_checklist_prompt
from database.connection import connect_to_milvus, use_database
from database.settings import DEFAULT_DB_NAME

# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
print("api key in doc.py", api_key)
anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
server_url = os.getenv("SERVER_URL")
rabbitmq_url = os.getenv("RABBITMQ_URL")
nlp = spacy.load("en_core_web_sm")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")

# Define the path to the prompts.json file
PROMPTS_FILE_PATH = '../py_prompts/prompts.json'
openai_client = org_opeani(api_key=api_key)

# Create a MongoClient
mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))


db = mongo_client["prodle_db"]
documents_collection = db["documents"]
doctypes_collection = db["doctypes"]
system_collection = db["systems"]
users_collection = db["User"]
ROLE_PROMPTS = {
    "reviewers": "This person reviewed the document",
    "approvers": "This person approved the document",
    "creators": "This person created the document"
}
ROLE_THRESHOLDS = {
    "reviewers": 0.75,
    "approvers": 0.75,
    "creators": 0.75
}




def getFirstDocTypeInOrg(org_id, authToken):
    nestjs_url = f"{server_url}/api/doctype/getFirstDocType/{org_id}"
    headers = {
        'Content-Type': 'application/json',
        # Forward the Authorization header
        'Authorization': authToken,
    }
    response = requests.get(nestjs_url, headers=headers)
    return response.json()


def insert_into_ai_meta_data_collection(record):
    ai_meta_data_collection = mongo_db["aimetadatas"]
    print("record in insert_into_ai_meta_data_collection", ai_meta_data_collection)
    ai_meta_data_collection.insert_one(record)



def update_prompts(new_prompts):
    # print("new prompts", new_prompts)
    
    # Load the current prompts
    with open(PROMPTS_FILE_PATH, 'r') as file:
        prompts = json.load(file)

    # Update or add the new prompts
    for key, value in new_prompts.items():
        if key in prompts and 'system' in prompts[key]:
            prompts[key]['system'] = value
        else:
            # If the key does not exist, add it as a new entry
            prompts[key] = {'system': value}

    # Save the updated prompts back to the JSON file
    with open(PROMPTS_FILE_PATH, 'w') as file:
        json.dump(prompts, file, indent=2)


def load_prompts(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)


def query(body):
    """
    Handles an LLM-powered query with Milvus vector search integration.
    """
    try:
        # Get organization details
        org_id = body["orgId"]
        org_record = get_org_details_by_id(org_id)
        feature_config = get_feature_config(org_record, "Chat")
        
        api_keys = org_record["aiConfig"]['apiKeys']
        model_name = feature_config['model']

        # Generate query embedding
        embedding_for_input_query = get_embedding_for_text(body["query"])

        # Connect to Milvus collection
        collection_name = "document_collection"
        collection = Collection(name=collection_name)

        # Check if the collection has an index; if not, create one
        if not collection.has_index():
            # Define the index parameters
            index_params = {
                "index_type": "IVF_FLAT",  # Choose an appropriate index type
                "metric_type": "IP",       # Inner Product for cosine similarity
                "params": {"nlist": 128}   # Adjust 'nlist' based on your data size
            }
            collection.create_index(field_name="doc_embedding", index_params=index_params)

        # Load the collection into memory
        collection.load()

        # Search parameters for Milvus
        top_k = 5  # Only retrieve the top result
        search_params = {
            "metric_type": "IP",  # Inner Product for cosine similarity
            "params": {"nprobe": 10}
        }

        # Build dynamic filters using metadata
        filters = []
        metadata_keys = ["locationName", "entityName", "organizationId"]  # Metadata fields to filter
        for key in metadata_keys:
            if key in body:
                filters.append(f"metadata['{key}'] == '{body[key]}'")

        filter_expr = " and ".join(filters) if filters else ""

        # Perform Milvus search
        results = collection.search(
            data=[embedding_for_input_query],
            anns_field="doc_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["doc_id", "doc_chunk", "metadata"],  # Include metadata in output
            expr=filter_expr
        )
        # print("results", results)

        # Get the top result
        if not results or not results[0]:
            return json.dumps({
                "generatedResponse": "No Results Found",
                "sources": []
            })


        top_results = results[0]
        
        # print("Type of top_results[0]:", type(top_results[0]))
        # print("Sample top_results[0]:", top_results[0])


        # Gather top-k source chunks
        sources = []
        for res in top_results:
            sources.append({
                "chunkText": res.entity.get("doc_chunk"),
                "documentName": res.entity.get("metadata").get("documentName"),
                "similarity": res.distance
            })

        # Construct context using all chunks with similarity >= 0.82
        context_chunks = []
        for res in top_results:
            if res.distance >= 0.82:
                chunk_text = res.entity.get("doc_chunk")
                metadata = res.entity.get("metadata")
                document_name = metadata.get("documentName")
                unit = metadata.get("locationName")
                department = metadata.get("entityName")

                context_chunks.append(
                    f"[Document: {document_name} | Unit: {unit} | Department: {department}]\n{chunk_text.strip()}"
                )

        # Final context string for LLM prompt
        combined_context = "\n\n---\n\n".join(context_chunks)
        chat_prompt = repr(main_template).format(
            context_str=combined_context,
            query_str=body["query"],
            metadata={}  # Optional: can leave empty or pass first metadata if needed
        )

        # Generate LLM response
        if feature_config["client"].lower() == "anthropic":
            print("calling anthropic Claude")
            messages = [body["query"], combined_context]
            api_key = api_keys["Anthropic"]

            model = ClaudeModel(
                config={
                    "api_key": api_key,
                    "model": model_name,
                    "max_tokens": 7000,
                    "temperature": 0
                }
            )

            response = model.generate_response(
                system_message=chat_prompt,
                messages=messages
            )
            # print("response anthropic", response)

        else:
            llm_client = feature_config["client"]
            # print("calling openai to format rag response")

            open_api_key, model_class = get_ai_model_config(org_record, llm_client)

            model = setup_model(
                api_key=open_api_key,
                model_class=model_class,
                model_name=model_name
            )

            response = model.generate_response(
                system_message=chat_prompt,
                messages=[body["query"], combined_context]
            )
            # print("response openai", response)
            
        
        # print("input tokens doc query", response["input_tokens"])
        # print("output tokens doc query", response["output_tokens"])
        # print("model provider doc query", model.provider)

        track_token_usage_in_license(
            org_id=org_id,
            provider=model.provider,
            feature="DocChat",
            input_tokens=response["input_tokens"],
            output_tokens=response["output_tokens"]
        )

        # Serialize final response
        result = {
        "generatedResponse": response["output"],
        "sources": sources
        }

        # print("result doc query", result)
        return json.dumps(result)


    except Exception as e:
        # print tracheback
        traceback.print_exc()
        raise Exception(f"Error in query: {e}")


def semantic_search(body):
    """
    Perform semantic similarity search using Milvus and OpenAI embeddings.
    """
    try:
        connect_to_milvus()
        use_database(DEFAULT_DB_NAME)
        # Connect to Milvus collection
        collection_name = "document_collection"
        collection = Collection(name=collection_name)

        if not collection.has_index():
        # Define the index parameters
            index_params = {
                "index_type": "IVF_FLAT",  
                "metric_type": "IP",      
                "params": {
                    "nlist": 128,  
                    "radius": 0.75,
                    "range_filter": 1.0 
                    }
            }
            collection.create_index(field_name="doc_embedding", index_params=index_params)

        # Load the collection into memory
        collection.load()

        # Generate query embedding
        embedding_for_input_query = get_embedding_for_text(body["query"])

        # Build search parameters and filters
        top_k = body.get('top_k', 3)  # Default to top 3 results
        search_params = {
            "metric_type": "IP",  # Inner Product (cosine similarity)
            "params": {"nprobe": 10}
        }

        # Build optional filters
        filters = []
        if "organizationId" in body:
            filters.append(f"organizationId == '{body['organizationId']}'")
        filter_expr = " and ".join(filters) if filters else ""

        # Perform Milvus search
        results = collection.search(
            data=[embedding_for_input_query],
            anns_field="doc_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["doc_id", "doc_chunk", "metadata"]
        )

        # Process and prepare response
        processed_results = []
        for result in results[0]:  # Iterate over top_k results
            print("result in pyapii search", result)
            processed_results.append({
                "docId": result.entity.get("doc_id"),
                "chunkText": result.entity.get("doc_chunk"),
                "similarity": result.distance,
                "metadata" : result.entity.get("metadata")
            })

        return json.dumps(processed_results)

    except Exception as e:
        raise Exception(f"Error in semantic search: {e}")


# Refactored function
def get_docs_by_ids(body):
    """
    Retrieve documents from Milvus by their IDs.
    """
    try:
        # Extract document IDs from the body
        doc_ids = body.get("docIds", [])
        if not doc_ids:
            raise ValueError("No docIds provided in the request body.")

        # Connect to Milvus collection
        collection_name = "document_collection"
        collection = Collection(name=collection_name)

        # Query documents by IDs
        filter_expr = f"doc_id in [{', '.join(map(str, doc_ids))}]"

        # Search parameters
        top_k = body.get("top_k", 3)
        search_params = {
            "metric_type": "IP",  # Inner Product (cosine similarity)
            "params": {"nprobe": 10}
        }

        # Query Milvus
        results = collection.query(
            expr=filter_expr,
            output_fields=["doc_id", "doc_chunk", "documentName", "documentUrl"],
            limit=top_k
        )

        # Prepare JSON response
        response = []
        for result in results:
            response.append({
                "docId": result.get("doc_id"),
                "docName": result.get("documentName", ""),
                "docUrl": result.get("documentUrl", ""),
                "text": result.get("doc_chunk", "")
            })

        return json.dumps(response)

    except Exception as e:
        raise Exception(f"Error in get_docs_by_ids: {e}")
    


def generate_summary_from_doc(document_path, org_id):
    """Generates a summary from the document using the appropriate AI model."""
    # openai_client = org_opeani(api_key=os.getenv("OPENAI_API_KEY"))
    text = file_to_text(document_path)

    org_record = get_org_details_by_id(org_id)
    summary_config = get_feature_config(org_record, "Summary")
    client = summary_config['client']
    summary_model = summary_config['model']
    summary_prompt = summary_config['prompt']
    
    print(f"Using {client} for generating summary")

    api_key, model_class = get_ai_model_config(org_record, client)
    model = setup_model(api_key, model_class, summary_model)

    response = model.generate_response(system_message=summary_prompt, messages=[text])
    
    # print("input tokens ", response["input_tokens"])
    # print("output tokens ", response["output_tokens"])
    # print("model provider ", model.provider)
    
    # Track token usage
    track_token_usage_in_license(
        org_id=org_id,
        provider=model.provider,
        feature="DocSummary",
        input_tokens=response["input_tokens"],
        output_tokens=response["output_tokens"]
    )

    return response["output"]


def generate_risk_analysis_from_doc(document_path, org_id):
    """
    Generates a plain text risk analysis from the document using the appropriate AI model.
    The categories to analyze are provided dynamically.
    """

    risk_categories = get_all_risk_categories(org_id)
    # Step 1: Extract document text
    text = file_to_text(document_path)

    # Step 2: Get model details
    org_record = get_org_details_by_id(org_id)
    summary_config = get_feature_config(org_record, "Summary")
    client = summary_config['client']
    summary_model = summary_config['model']

    print(f"Using {client} for generating risk analysis")

    # Step 3: Construct prompt using dynamic categories
    categories_list = "\n".join([f"- {cat}" for cat in risk_categories])

    format_section = "\n\nFormat your response as follows:\n"
    for cat in risk_categories:
        format_section += f"\n{cat}:\n- [Specific risk identified]\n- [Potential impact]\n"

    format_section += (
        '\nNote: Please be specific and contextual to the provided text. '
        'If certain risk categories are not applicable, indicate '
        '"No significant risks identified in this category."'
    )

    # Final prompt
    prompt = f"""
        Please conduct a thorough risk analysis of the following input text, identifying risks for each of the provided categories. Use only information from the text and be specific in your findings.

        Input Text to Analyze:
        {text}

        Risk Categories to Analyze:
        {categories_list}
        {format_section}
    """

    # Step 4: Run through AI model
    system_message = "You are a highly skilled assistant for identifying contextual risks from text based on dynamic risk categories."
    api_key, model_class = get_ai_model_config(org_record, client)
    model = setup_model(api_key, model_class, summary_model)

    response = model.generate_response(system_message=system_message, messages=[prompt])
    # print("input tokens generate_risk_analysis_from_doc", response["input_tokens"])
    # print("output tokens generate_risk_analysis_from_doc", response["output_tokens"])
    # print("model provider generate_risk_analysis_from_doc", model.provider)
    # Track token usage
    track_token_usage_in_license(
        org_id=org_id,
        provider=model.provider,
        feature="DocRiskAnalysis",
        input_tokens=response["input_tokens"],
        output_tokens=response["output_tokens"]
    )
    return response["output"]




def generate_tags_from_doc(document_path, org_id):
    text = file_to_text(document_path)
    org_record = get_org_details_by_id(org_id)
    tags_ai_config = get_feature_config(org_record, "Extractions")
    client = tags_ai_config['client']
    tags_model = tags_ai_config['model']
    tags_prompt = tags_ai_config['prompt']

    print(f"Using {client} for generating Extractions")

    api_key, model_class = get_ai_model_config(org_record, client)
    model = setup_model(api_key, model_class, tags_model)

    response = model.generate_response(system_message=tags_prompt, messages=[text])
    # print("response in generate tags from doc", response)
    # print("input tokens generate_tags_from_doc", response["input_tokens"])
    # print("output tokens generate_tags_from_doc", response["output_tokens"])
    # print("model provider generate_tags_from_doc", model.provider)
    json_output = {}
    response_text = response["output"]
    
    track_token_usage_in_license(
        org_id=org_id,
        provider=model.provider,
        feature="Extractions",
        input_tokens=response["input_tokens"],
        output_tokens=response["output_tokens"]
    )

    if isinstance (response_text, str) and "```json" in response_text:
        json_output = response_text.strip('```json').rstrip('```')
        json_ouptut = json.loads(json_output)

    else:
        json_ouptut = json.loads(response_text)
    return json_ouptut

    # Define a function to get the media type based on the file extension

def get_media_type(file_path):
    # Get the file extension
    ext = os.path.splitext(file_path)[1].lower()

    # Map of file extensions to media types
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".bmp": "image/bmp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".tiff": "image/tiff",
        ".webp": "image/webp",
        # Add more media types as needed
    }

    # Return the appropriate media type or a default one
    return media_types.get(ext, "image/jpeg")

def generate_tags_from_drawing(file_path, org_id):
    try:
        # print("file_path in generate_tags_from_drawing", file_path)
        # Get the media type from the file path
        media_type = get_media_type(file_path)
        # print("media_type ---->", media_type)

        org_record = get_org_details_by_id(org_id)
        # print("org_record", org_record)

        drawing_tags_config = get_feature_config(org_record, "DrawingMetadata")
        # print("drawing_tags_config", drawing_tags_config)

        drawing_client = drawing_tags_config['client']
        drawing_tags_prompt = drawing_tags_config['prompt']
        # print("client and prompt", drawing_client, drawing_tags_prompt)

        with open(file_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        # print(f"Using {drawing_client} for generating tags for image drawing")

        client = anthropic.Anthropic(api_key=anthropic_api_key)

        # Ensure the media type is correct for the image
        # If the file is a PNG but the media type is incorrect, try to detect it
        if file_path.lower().endswith('.png') and media_type != 'image/png':
            media_type = 'image/png'
        elif file_path.lower().endswith('.jpg') or file_path.lower().endswith('.jpeg') and media_type != 'image/jpeg':
            media_type = 'image/jpeg'
        
        # print(f"Using media type: {media_type} for file: {file_path}")

        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4000,
            system=drawing_tags_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            }
                        }
                    ],
                }
            ],
        )

        output = message.content[0].text

        input_tokens = message.usage.input_tokens if message.usage else 0
        output_tokens = message.usage.output_tokens if message.usage else 0
        
        # print("input tokens generate_tags_from_drawing", input_tokens)
        # print("output tokens generate_tags_from_drawing", output_tokens)

        track_token_usage_in_license(
            org_id=org_id,
            provider="anthropic",
            feature="DrawingMetadata",
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )

        return output

    except Exception as e:
        traceback.print_exc()
        return None
 
def generate_summary_for_drawing(file_path, org_id):
    try:
        media_type = get_media_type(file_path)
        org_record = get_org_details_by_id(org_id)
        drawing_tags_config = get_feature_config(org_record, "DrawingSummary")
        drawing_client = drawing_tags_config['client']
        drawing_summary_prompt = drawing_tags_config['prompt']

        with open(file_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")

        print(f"Using {drawing_client} for generating Sumamry for image drawing")

        client = anthropic.Anthropic(api_key=anthropic_api_key)

        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4000,
            system=drawing_summary_prompt,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            }
                        }
                    ],
                }
            ],
        )

        output = message.content[0].text

        input_tokens = message.usage.input_tokens if message.usage else 0
        output_tokens = message.usage.output_tokens if message.usage else 0
        
        # print("input tokens generate_summary_for_drawing", input_tokens)
        # print("output tokens generate_summary_for_drawing", output_tokens)

        track_token_usage_in_license(
            org_id=org_id,
            provider="anthropic",
            feature="DrawingSummary",
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )

        return output

    except Exception as e:
        traceback.print_exc()
        return None

def generate_mcq(document_path, org_id):
    text = file_to_text(document_path)
    # print("text in generate_mcq", text)
    org_record = get_org_details_by_id(org_id)
    # print("org_record in generate_mcq", org_record)
    mcq_config = get_feature_config(org_record,'MCQ')
    # print("mcq_congifi in generate_mcq", mcq_config)
    client = mcq_config['client']
    mcq_model = mcq_config['model']
    mcq_prompt = mcq_config['prompt']
    print(f"Using {client} for generating MCQs")
    api_key, model_class = get_ai_model_config(org_record, client)
    model = setup_model(api_key, model_class, mcq_model)

    response = model.generate_response(system_message=mcq_prompt, messages=[text])
    # print("response in generate_mcq", response)
    # print("input tokens generate_mcq", response["input_tokens"])
    # print("output tokens generate_/mcq", response["output_tokens"])
    # print("model provider generate_mcq", model.provider)
    
    # Track token usage
    track_token_usage_in_license(
        org_id=org_id,
        provider=model.provider,
        feature="MCQ",
        input_tokens=response["input_tokens"],
        output_tokens=response["output_tokens"]
    )
    
    return response["output"]


def generate_new_html_content(html_content):
    openai_client = org_opeani(api_key=os.getenv("OPENAI_API_KEY"))
    """Use AI to generate a clean template based on the HTML."""
    # print("Original HTML Content:", html_content)

    # System prompt for LLM
    systemString = """
    You are a world-class HTML developer. Your task is to extract a clean HTML template from the provided HTML content. 
    The template should retain:
    - Headings (e.g., <h1>, <h2>, <h3>, etc.)
    - Subheadings
    - Titles
    - Table structures, including headings and the number of rows (but not the cell content).
    - Lists (<ul>, <ol>) with only one sample item.
    - Formattings and inline styling.
    
    Remove:
    - Main content, such as paragraphs, table data, and body text, and replace them with placeholders.
    - Irrelevant or redundant data.

    Example:
    Input HTML:
    <html>
      <head>
        <title>Student Info</title>
      </head>
      <body>
        <h1>Welcome to the Course</h1>
        <p>This is a detailed course introduction.</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subject</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>John</td>
              <td>Math</td>
            </tr>
            <tr>
              <td>Jane</td>
              <td>Physics</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>

    Output Template:
    <html>
      <head>
        <title>Sample Title</title>
      </head>
      <body>
        <h1>Sample Heading</h1>
        <p>Placeholder for paragraph text</p>
        <table>
          <thead>
            <tr>
              <th>Sample Header 1</th>
              <th>Sample Header 2</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sample Data</td>
              <td>Sample Data</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
    """

    # print("Calling OpenAI LLM for template generation...")
    chat_completion = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": systemString},
            {"role": "user", "content": html_content},
        ],
        temperature=0,
        max_tokens=4000,  # Adjust token limit as necessary
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )

    # Extract the generated template
    generated_html = chat_completion.choices[0].message.content.strip()

    # print("Generated HTML Template:", generated_html)

    return generated_html



# def generat_topic_html_content(html_content, topic, org_id):
#     # Fetch AI configuration details
#     org_record = get_org_details_by_id(org_id)
#     topic_config = get_feature_config(org_record, "Template")
#     client = topic_config['client']
#     topic_model = topic_config['model']
#     topic_prompt = topic_config['prompt']
    
#     print(f"Using {client} for generating template topic content")
#     api_key, model_class = get_ai_model_config(org_record, client)
#     model = setup_model(api_key, model_class, topic_model, max_tokens=4091)
    
#     # Create a detailed prompt
#     final_prompt = f"""
#     The provided HTML document is a template. Rewrite it for the topic {topic}.
#     Requirements:
#     1. Retain all headings, subheadings, table structures, and list formatting from the original HTML.
#     2. Populate empty sections with meaningful content relevant to the topic.
#     3. For lists and tables, ensure all headers are preserved and add rows/items if the topic demands it.
#     4. Keep the original layout and styling intact.
#     Output a complete and structured HTML document for the given topic.
#     """
#     formatted_html_content = "\n".join(html_content) if isinstance(html_content, list) else html_content
#     print("formatted html template content", formatted_html_content)
#     print("Calling AI to generate topic-specific content...")
#     response = openai_client.chat.completions.create(
#         model="gpt-4-turbo",
#         messages=[
#             {
#                 "role": "system",
#                 "content": topic_prompt
#             },
#             {"role": "user", "content": formatted_html_content}
           
#         ],
#         temperature=0,
#         max_tokens=4091,
#         top_p=1,
#         frequency_penalty=0,
#         presence_penalty=0
#     )
#     # response = model.generate_response(
#     #     system_message=topic_prompt,
#     #     messages=[formatted_html_content]
#     # )
    
#     print("Generated HTML Content:", response)
#     print("total cost of the response", calculate_gpt4_turbo_cost(response.usage))
#     return response.choices[0].message.content

def generate_topic_html_content(html_content, topic, org_id):
    # Fetch AI configuration details
    org_record = get_org_details_by_id(org_id)
    topic_config = get_feature_config(org_record, "Template")
    client = topic_config['client']
    topic_model = topic_config['model']
    topic_prompt = topic_config['prompt']
    final_topic_prompt = topic_prompt.format(topic=topic)

    api_key, model_class = get_ai_model_config(org_record, client)
    model = setup_model(api_key, model_class, topic_model, max_tokens=9000)

    # Perform semantic search in Milvus
    search_body = {
        "query": topic,
        "organizationId": org_id,
        "top_k": 10
    }

    try:
        search_results = json.loads(semantic_search(search_body))
    except Exception as e:
        search_results = []

    if search_results:
        relevant_data = "\n\n".join([result["chunkText"] for result in search_results])
    else:
        relevant_data = ""

    # Final prompt assembly
    final_prompt = f"""
    The provided HTML document is a template. Rewrite it for the topic: {topic}.
    
    Relevant information:
    {relevant_data}
    
    Requirements:
    1. Retain all headings, subheadings, table structures, and list formatting from the original HTML.
    2. Populate empty sections with meaningful content relevant to the topic.
    3. For lists and tables, ensure all headers are preserved and add rows/items if the topic demands it.
    4. Keep the original layout and styling intact.
    Output a complete and structured HTML document for the given topic.
    """

    formatted_html_content = "\n".join(html_content) if isinstance(html_content, list) else html_content

    response = model.generate_response(
        system_message=final_topic_prompt,
        messages=[final_prompt, formatted_html_content]
    )


    # print("input tokens generate_topic_html_content", response["input_tokens"])
    # print("output tokens generate_topic_html_content", response["output_tokens"])
    # print("model provider generate_topic_html_content", model.provider)
    
    track_token_usage_in_license(
        org_id=org_id,
        provider=model.provider,
        feature="Template",
        input_tokens=response["input_tokens"],
        output_tokens=response["output_tokens"]
    )

    return response["output"]

def generate_template_and_topic_content(input_docx_file, final_docx_file, topic, org_id):
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    # Convert DOCX to HTML
    original_html_file = "original.html"
    
    # Check if the original.html file exists, and create it if it doesn't
    if not os.path.exists(original_html_file):
        with open(original_html_file, "w") as file:
            file.write("")  # Create an empty file if it doesn't exist
    
    if is_object_store:
        # For object store, we need to download the file first
        # print(f"Using object store for template generation. Downloading file: {input_docx_file}")
        
        # Extract org_id from the file path if it contains a path
        file_org_id = org_id
        if '/' in input_docx_file:
            file_org_id = input_docx_file.split('/')[0]
        
        # print("input_docx_file", input_docx_file)
        # print("file_org_id", file_org_id)
        # Download the file to a temporary location
        local_path = download_file_from_oci(input_docx_file, file_org_id)
        # print(f"Downloaded file from OCI to {local_path}")
        
        # Convert the downloaded file to HTML
        html_content = convert_docx_to_html(local_path, original_html_file)
        
        # Generate topic-specific content
        topic_html_content = generate_topic_html_content(html_content, topic, org_id)
        
        # Convert HTML back to DOCX
        docx_file_path = convert_html_content_to_docx(topic_html_content, final_docx_file)
        
        # Clean up the temporary file
        try:
            os.remove(local_path)
            print(f"Temporary file {local_path} removed")
        except Exception as e:
            print(f"Error removing temporary file {local_path}: {str(e)}")
    else:
        # Original local file storage logic
        print(f"Using local file storage for template generation: {input_docx_file}")
        html_content = convert_docx_to_html(input_docx_file, original_html_file)
        topic_html_content = generate_topic_html_content(html_content, topic, org_id)
        docx_file_path = convert_html_content_to_docx(topic_html_content, final_docx_file)
    
    return docx_file_path


# aggreement summary vs sop
def get_type_of_doc(file_path):
    try:

        print(f"Using Claude to get the type of doc")
        text = file_to_text(file_path)
        prompt = """
        You are a world class document expert. Your task is to identify the type of document from the given text.
        The document can be either an agreement or a standard operating procedure (SOP).
        If it's a contract, agreement, or set of general terms and conditions, respond with ONLY the word "Agreement".
        For any other document type, including SOPs, respond with ONLY the word "SOP".
        Your entire response must be a single word: either "Agreement" or "SOP".
        Do not provide any explanation or additional text whatsoever.
        """
        # api_key, model_class = get_ai_model_config(org_record, drawing_client)
        # model = setup_model(api_key, model_class, drawing_tags_config)

        client = anthropic.Anthropic(api_key='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')

        message = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            system=prompt,
            messages=[
                {
                    "role": "user",
                    "content": text
                }
            ],
        )
        
        output = message.content[0].text
        return output
    except Exception as e:
        traceback.print_exc()
        return None
    
def convert_clauses_to_text(clauses):
    text_representation = ""
    for clause in clauses:
        clause_number = clause.get("clauseNumber", "")
        clause_text = clause.get("clauseText", "")
        clause_description = clause.get("clauseDescription", "")
        # Combine the values into a single string
        text_representation += f"{clause_number} - {clause_text} - {clause_description}\n\n"
    return text_representation.strip()


def identify_clauses(document_path, clauses):

    # Load the prompts
    prompts = load_prompts('../py_prompts/prompts.json')
    text = file_to_text(document_path)
    # print("text", text)
    text_clauses = convert_clauses_to_text(clauses)
    claude_api_key = os.getenv("ANTHROPIC_API_KEY")
    model = ClaudeModel(
    config={
        "api_key": claude_api_key,
        "model": "claude-3-5-sonnet-20240620",  # Added comma
        "max_tokens": 7000,  # Added comma
        "temperature": 0  # Corrected spelling of temperature
    }
)
    claude_prompt = prompts['claude_model_prompt']['system']
    formatted_prompt = claude_prompt.replace("{{DOCUMENT_TEXT}}", text).replace("{{AGREEMENT_CLAUSES}}", text_clauses)
    print("using claude to generate repsonse of agreement summary")
    response = model.generate_response(system_message=formatted_prompt, messages=["Do the above"])
    print("response in identify_clauses_v2_using_claude", response)


    try:
        response_dict = json.loads(response)  # Parse response as JSON
    except json.JSONDecodeError:
        raise Exception("Failed to parse Claude's response as JSON")

    # Extract relevant information
    final_response = {
        "added_clauses": response_dict.get('added_clauses', []),  # Ensure it defaults to an empty list if not found
        "removed_clauses": response_dict.get('removed_clauses', []),
        "modified_clauses": response_dict.get('modified_clauses', [])
    }

    return final_response


def identify_clauses_v2(document_path, clauses, docId):
    # Start the timer
    start_time = time.time()
    # Load the prompts
    prompts = load_prompts('../py_prompts/prompts.json')

    openai_client = org_opeani(api_key=os.getenv("OPENAI_API_KEY"))
    text = file_to_text(document_path)
    text_clauses = convert_clauses_to_text(clauses)
    
    # Define a function to make OpenAI calls concurrently
    def get_openai_response(model, messages):
        return openai_client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=4095,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        ).choices[0].message.content

    # Use ThreadPoolExecutor for concurrent LLM calls
    with ThreadPoolExecutor(max_workers=5) as executor:
        # Submit the LLM calls as tasks to the thread pool
        futures = {
            'added_clauses': executor.submit(
                get_openai_response,
                "gpt-4-turbo",
                [
                    {"role": "system", "content": prompts['identify_added_clauses']['system']},
                    {"role": "user", "content": f"Document Text: {text} Clause Library: {text_clauses}"}
                ]
            ),
            'removed_clauses': executor.submit(
                get_openai_response,
                "gpt-4-turbo",
                [
                    {"role": "system", "content": prompts['identify_removed_clauses']['system']},
                    {"role": "user", "content": f"Document Text: {text} Clause Library: {text_clauses}"}
                ]
            )
        }

        # Get results from the futures
        added_clauses = futures['added_clauses'].result()
        removed_clauses = futures['removed_clauses'].result()

        # Submit the JSON responses as tasks within the same executor
        futures['json_added_clauses'] = executor.submit(
            get_openai_response,
            "gpt-4o-mini",
            [
                {"role": "system", "content": prompts['json_added_clauses']['system']},
                {"role": "user", "content": added_clauses},
            ]
        )

        futures['json_removed_clauses'] = executor.submit(
            get_openai_response,
            "gpt-4o-mini",
            [
                {"role": "system", "content": prompts['json_removed_clauses']['system']},
                {"role": "user", "content": removed_clauses},
            ]
        )

        json_added_clauses = futures['json_added_clauses'].result()
        json_removed_clauses = futures['json_removed_clauses'].result()

        # Handle modified clauses in parallel as well
        clause_sets = [
            ['1', '2', '3', '4', '5'],
            ['7', '9', '16', '18', '19'],
            ['10', '8', '20', '11', '13'],
            ['6', '12', '14', '15', '17']
        ]

        modified_clauses_futures = []
        for clause_set in clause_sets:
            subset_clauses = [clause for clause in clauses if clause['clauseNumber'] in clause_set]
            text_clauses_subset = convert_clauses_to_text(subset_clauses)
            future = executor.submit(
                get_openai_response,
                "gpt-4-turbo",
                [
                    {"role": "system", "content": prompts['identify_modified_clauses']['system']},
                    {"role": "user", "content": f"Document Text: {text} Clause Library: {text_clauses_subset}"}
                ]
            )
            modified_clauses_futures.append(future)

        # Collect modified clauses results
        modified_clauses = [future.result() for future in modified_clauses_futures]
        merged_modified_clauses = "\n".join(modified_clauses)

        # JSON Modified Clauses Response
        json_modified_clauses = get_openai_response(
            "gpt-4o-mini",
            [
                {"role": "system", "content": prompts['json_modified_clauses']['system']},
                {"role": "user", "content": merged_modified_clauses}
            ]
        )

    final_response = {
        "added_clauses": json_added_clauses,
        "removed_clauses": json_removed_clauses,
        "modified_clauses": json_modified_clauses
    }

    # Calculate elapsed time
    elapsed_time = time.time() - start_time

    # Save the result to a file
    output_file = '../py_prompts/results.json'
    if os.path.exists(output_file):
        with open(output_file, 'r') as file:
            data = json.load(file)
    else:
        data = {}
    data[docId] = final_response
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Execution completed in {elapsed_time:.2f} seconds.")
    return final_response

def identify_clauses_v2_using_claude(document_path, clauses, docId):
    # Start the timer
    start_time = time.time()
    # Load the prompts
    prompts = load_prompts('../py_prompts/prompts.json')
    text = file_to_text(document_path)
    text_clauses = convert_clauses_to_text(clauses)
    # openai_client = org_opeani(api_key=os.getenv("ANTHROPIC_API_KEY"))
    claude_api_key = os.getenv("ANTHROPIC_API_KEY")
    model = ClaudeModel(
    config={
        "api_key": claude_api_key,
        "model": "claude-3-5-sonnet-20240620",  # Added comma
        "max_tokens": 7000,  # Added comma
        "temperature": 0  # Corrected spelling of temperature
    }
)
    claude_prompt = prompts['claude_model_prompt']['system']
    formatted_prompt = claude_prompt.replace("{{DOCUMENT_TEXT}}", text).replace("{{AGREEMENT_CLAUSES}}", text_clauses)
    print("using claude to generate repsonse of agreement summary")
    response = model.generate_response(system_message=formatted_prompt, messages=["Do the above"])
    print("response in identify_clauses_v2_using_claude", response)

      # Parse the response string into a dictionary
    try:
        response_dict = json.loads(response)  # Parse response as JSON
    except json.JSONDecodeError:
        raise Exception("Failed to parse Claude's response as JSON")

    # Extract relevant information
    final_response = {
        "added_clauses": response_dict.get('added_clauses', []),  # Ensure it defaults to an empty list if not found
        "removed_clauses": response_dict.get('removed_clauses', []),
        "modified_clauses": response_dict.get('modified_clauses', [])
    }
    
    # Calculate and print execution time
    elapsed_time = time.time() - start_time
    # print(f"Execution completed in {elapsed_time:.2f} seconds.")
    
    # Save the result to a file
    output_file = '../py_prompts/results.json'
    if os.path.exists(output_file):
        with open(output_file, 'r') as file:
            data = json.load(file)
    else:
        data = {}
    
    data[docId] = final_response
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)
    
    print(f"Execution completed in {elapsed_time:.2f} seconds.")
    return final_response


def get_response_by_doc_id(docId):
    """
    Retrieve the response for a specific docId from the JSON file.

    :param docId: The document ID to search for in the JSON file.
    :param file_path: The path to the JSON file where responses are stored.
    :return: The response for the given docId, or None if not found.
    """
    file_path = '../py_prompts/results.json'
    # Check if the JSON file exists
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist.")
        return None

    # Load the existing data from the JSON file
    with open(file_path, 'r') as file:
        data = json.load(file)

    # Retrieve the response for the given docId
    response = data.get(docId)

    # Check if the response exists
    if response:
        return response
    else:
        print(f"No response found for docId: {docId}")
        return None

def get_document_name_for_image(file_path):
    try:
        media_type = get_media_type(file_path)
        with open(file_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")
        print(f"Using Claude for generating Document Name for image drawing")
        client = anthropic.Anthropic(api_key='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')
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=4000,
            system="""Based on the analysis of the drawing image, 
                        generate a concise and descriptive document name 
                        that captures the essence of the content. Consider the type of 
                        drawing, main subject, key components, and purpose. 
                        The name should be clear, specific, and easily identifiable. 
                        Avoid generic terms and focus on unique aspects of the drawing. 
                        Provide only the document name as plain text, without any file 
                        extensions or additional information.""",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,  # Use the dynamically determined media type
                                "data": image_data,
                            }
                        }
                    ],
                }
            ],
        )
        output = message.content[0].text
        return output
    except Exception as e:
        traceback.print_exc()
        return None
    

def run_tasks_in_thread_pool(file_path, form_data):
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Define the tasks to be executed concurrently
        future_tasks = [
            executor.submit(generate_tags_from_drawing, file_path, form_data["organizationId"]),
            executor.submit(generate_summary_for_drawing, file_path, form_data["organizationId"])
        ]

        # Wait for all tasks to complete and retrieve their results in order of submission
        drawing_concepts, drawing_summary = [future.result() for future in future_tasks]
        
        print("DRAWING CONCEPTS in run_tasks_in_thread_pool ----->", drawing_concepts)
        print("DRAWING SUMMARY in run_tasks_in_thread_pool ----->", drawing_summary)

    return drawing_concepts, drawing_summary

def find_user_by_name(name, org_id):
    name = name.strip().lower()
    print("Searching for name:", name)

    # 1. Try exact match on individual fields
    user = users_collection.find_one({
        "organizationId": org_id,
        "$or": [
            {"username": {"$regex": f"^{re.escape(name)}$", "$options": "i"}},
            {"email": {"$regex": f"^{re.escape(name)}$", "$options": "i"}},
            {"firstname": {"$regex": f"^{re.escape(name)}$", "$options": "i"}},
            {"lastname": {"$regex": f"^{re.escape(name)}$", "$options": "i"}}
        ]
    })
    if user:
        print("✅ Found by direct match:", user.get("username"))
        return user

    # 2. Fallback: Try combined first + last name match
    candidates = users_collection.find({"organizationId": org_id})
    for user in candidates:
        #print("user",user)
        first = user.get("firstname", "").strip().lower()
        last = user.get("lastname", "").strip().lower()
        combined = f"{first} {last}".strip()

        if name == combined:
            print("✅ Found by full name match:", combined)
            return user

    print("❌ No match found for:", name)
    return None

def extract_names_from_text(text, role):
    patterns = {
        "reviewers": r"(?:Reviewed\s+by[:\-]?\s*)([A-Za-z0-9\s]+)",
        "approvers": r"(?:Approved\s+by[:\-]?\s*)([A-Za-z0-9\s]+)"
    }
    matches = re.findall(patterns[role], text, re.IGNORECASE)
    return [match.strip() for match in matches]
def extract_names_using_embeddings(text, role, embed_model, threshold=0.75):
    role_prompts = {
        "reviewers": "This person reviewed the document",
        "approvers": "This person approved the document",
        "creators": "This person created or authored or prepared the document"
    }
    role_embedding = embed_model.encode([role_prompts[role]])[0]
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    line_embeddings = embed_model.encode(lines)
    names = []

    for i, line in enumerate(lines):
        score = cosine_similarity([line_embeddings[i]], [role_embedding])[0][0]
        if score >= threshold:
            doc = nlp(line)
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    names.append(ent.text.strip().title())
    return names

def extract_review_metadata_with_minilm(text, org_id, embed_model, users_collection, nlp):
    reviewers_names = set(extract_names_from_text(text, "reviewers"))
    approvers_names = set(extract_names_from_text(text, "approvers"))
    creators_names = set(extract_names_using_embeddings(text, "creators", embed_model))
    print("users",reviewers_names,approvers_names,creators_names)

    # Combine with database lookup
    def names_to_ids(names):
        ids = set()
        for name in names:
            user = find_user_by_name(name, org_id)
            if user:
                print("Adding user ID:", user["_id"], "→", user.get("username"))
                ids.add(str(user["_id"]))
        return ids

    reviewers_ids = names_to_ids(reviewers_names)
    approvers_ids = names_to_ids(approvers_names)
    creators_ids = names_to_ids(creators_names)

    # Return lists of IDs
    return list(reviewers_ids), list(approvers_ids), list(creators_ids)



def extract_issue_date(text):
    """
    Extract a plausible issue/effective/approved/published date using fuzzy keyword scanning.
    """
    date_keywords = [
        "date of issue", "issued on", "effective date", 
        "effective from", "issue date", "date issued",
        "approved date", "approved on", "published date", "published on"
    ]
    
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    for i, line in enumerate(lines):
        line_lower = line.lower()

        if any(keyword in line_lower for keyword in date_keywords):
            candidates = [line]
            if i + 1 < len(lines):
                candidates.append(lines[i + 1])
            if i + 2 < len(lines):  # catch the rare case it's two lines below
                candidates.append(lines[i + 2])

            for candidate in candidates:
                # Try matching multiple date formats
                date_match = (
                    re.search(r"(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})", candidate)
                    or re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", candidate)
                    or re.search(r"(\d{4}-\d{2}-\d{2})", candidate)
                )

                if date_match:
                    try:
                        raw_date = date_match.group(1)
                        cleaned = re.sub(r"(st|nd|rd|th)", "", raw_date)
                        parsed = date_parser.parse(cleaned, dayfirst=True)
                        return parsed.strftime("%Y-%m-%d")
                    except Exception as e:
                        print(f"⚠️ Couldn't parse date: {raw_date} → {e}")

    print("⚠️ No recognizable date found.")
    return  datetime.utcnow()  





def generate_embedding(text):
    if not text:
        return None
    embedding = embed_model.encode([text])[0]
    return embedding.tolist()


def get_doctype_id(doc_type_name, orgId):
    print(f"🔍 Matching doctype for: {doc_type_name}")
    if not doc_type_name:
        return None

    # Exact case-insensitive match within org
    doctype = doctypes_collection.find_one({
        "documentTypeName": {"$regex": f"^{doc_type_name}$", "$options": "i"},
        "organizationId": orgId
    })
    if doctype:
        print(f"✅ Exact match found: {doctype['documentTypeName']} (ID: {doctype['_id']})")
        return str(doctype["_id"])

    # Fallback to vector similarity within same org
    all_types = list(doctypes_collection.find({"organizationId": orgId}, {"documentTypeName": 1}))
    query_emb = generate_embedding(doc_type_name)
    if query_emb is None:
        print("⚠️ Empty embedding for doc_type_name, cannot match.")
        return None

    best_score = 0
    best_id = None
    for dt in all_types:
        dt_name = dt.get("documentTypeName")
        if not dt_name:
            continue
        dt_emb = generate_embedding(dt_name)
        if dt_emb is None:
            continue
        score = cosine_similarity([query_emb], [dt_emb])[0][0]
        print(f"🔍 Comparing '{doc_type_name}' ↔ '{dt_name}': score = {score:.2f}")
        if score > best_score:
            best_score = score
            best_id = str(dt["_id"])

    if best_score > 0.4:
        print(f"✅ Vector match found with score {best_score:.2f}: ID {best_id}")
        return best_id
    else:
        print(f"⚠️ No good vector match found (best score: {best_score:.2f})")
        return None



def match_document_type(text, orgId):
    # Map doc types to lists of prioritized keywords/phrases, longest first
    known_keywords = {
        "policy": ["information security policy", "security policy", "policy"],
        "manual": ["user guide", "reference manual", "manual"],
        "workflow": ["process flow", "flowchart", "workflow"],
        "sop": ["standard operating procedure", "sop"],
        "recovery": ["disaster recovery", "recovery"],
        "records": ["records", "record"],
        "formats": ["templates", "formats"],
        "procedures":["procedure","guidelines"]
    }

    all_types = list(doctypes_collection.find({"organizationId": orgId}, {"documentTypeName": 1}))
    doc_type_names = [dt["documentTypeName"] for dt in all_types if "documentTypeName" in dt]

    text_lower = text.lower()

    # Prioritize doc types and keywords by length (desc)
    for dt_name in doc_type_names:
        keywords = known_keywords.get(dt_name.lower(), [])
        keywords = sorted(keywords, key=len, reverse=True)  # longest first

        for keyword in keywords:
            # Use regex for whole word/phrase matching
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            if re.search(pattern, text_lower):
                print(f"✅ Matched by keyword: '{keyword}' → {dt_name}")
                return dt_name

    # If no keyword match, fallback to embedding similarity as before...
    print("⚠️ No keyword match, running embedding match...")
    query_emb = generate_embedding(text)
    best_score = 0
    best_match = None

    for dt_name in doc_type_names:
        dt_emb = generate_embedding(dt_name)
        score = cosine_similarity([query_emb], [dt_emb])[0][0]
        print(f"🔍 Comparing text ↔ '{dt_name}': score = {score:.2f}")
        if score > best_score:
            best_score = score
            best_match = dt_name

    if best_score > 0.45:  # lower threshold for short names
        print(f"✅ Matched by embedding: {best_match} (score = {best_score:.2f})")
        return best_match

    print("❌ No good match found for document type.")
    return None



def extract_metadata(text, bold_title, orgId, docType,filename=None):
    print(f"➡️ Extracted bold title: {bold_title} {docType}")
    text = normalize_spaces(text).lower()
    doc = nlp(text)

    metadata = {
        "title": bold_title or None,
        "serial_number": None,
        "document_type": docType,
        "system_ids": [],
        "version": "",
        "issue_number": "",
        "reviewers": [],
        "approvers": [],
        "effective_date": ""
    }

    # --- Reviewer & Approver Extraction ---
    reviewers, approvers, _ = extract_review_metadata_with_minilm(
        text, orgId, embed_model, users_collection, nlp
    )
    metadata["reviewers"] = reviewers
    metadata["approvers"] = approvers

    # --- Version & Issue Number Extraction ---
    version_match = re.search(r"\b(?:version|v)\s*[:\-]?\s*(\d+)\.(\d+)", text, re.IGNORECASE)
    if version_match:
        major = version_match.group(1)
        minor = version_match.group(2)
        metadata["version"] = f"0.{minor}"
        metadata["issue_number"] = major
    else:
        metadata["version"] = "0.1"
        metadata["issue_number"] = "1"

    # --- Serial Number Extraction ---
    serial_pattern = r"\b[A-Za-z0-9]{2,}(?:\s*-\s*[A-Za-z0-9]{2,}){1,4}\s*-\s*\d{1,5}\b"
    all_possible_sources = [text]
    if bold_title:
        all_possible_sources.append(bold_title.lower())

    for source in all_possible_sources:
        serial_match = re.search(serial_pattern, source)
        if serial_match:
            metadata["serial_number"] = serial_match.group(0).strip()
            break

    # --- Semantic Document Type Matching ---
    if not docType:
        print("🔍 Running semantic match for document type...")
        all_types = list(doctypes_collection.find({"organizationId": orgId}, {"documentTypeName": 1}))
        query_text = (bold_title or text[:1000])
        query_emb = generate_embedding(query_text)
        best_score = 0
        best_match = None

        for dt in all_types:
            dt_name = dt.get("documentTypeName")
            if not dt_name:
                continue
            dt_emb = generate_embedding(dt_name)
            score = cosine_similarity([query_emb], [dt_emb])[0][0]
            print(f"🔍 Comparing ↔ '{dt_name}': score = {score:.2f}")
            if score > best_score:
                best_score = score
                best_match = dt_name

        if best_score > 0.55:
            metadata["document_type"] = best_match
            print(f"✅ Semantic match: {best_match} (score={best_score:.2f})")
        else:
            print("⚠️ No strong semantic match. Trying keyword fallback...")

            # --- Controlled Keyword Matching ---
            known_keywords = {
                "Policy": ["information security policy", "security policy", "policy", "guideline"],
                "Manual": ["user guide", "reference manual", "manual"],
                "Workflow": ["process flow", "flowchart", "workflow"],
                "SOP": ["standard operating procedure", "sop", "procedure"],
                "Recovery": ["disaster recovery", "recovery"],
                "Records": ["records", "record"],
                "Formats": ["templates", "formats"]
            }

            # Check in text
            for doctype, keywords in known_keywords.items():
                for kw in keywords:
                    if re.search(rf"\b{re.escape(kw.lower())}\b", text):
                        metadata["document_type"] = doctype
                        print(f"📌 Keyword match in text for doctype '{doctype}': '{kw}'")
                        break
                if metadata["document_type"]:
                    break

            # Fallback to title or filename if still not found
            if not metadata["document_type"] and (bold_title or filename):
                title_fallback = (bold_title or os.path.splitext(filename)[0]).lower()
                for doctype, keywords in known_keywords.items():
                    for kw in keywords:
                        if re.search(rf"\b{re.escape(kw.lower())}\b", title_fallback):
                            metadata["document_type"] = doctype
                            print(f"📌 Keyword match in title/filename for doctype '{doctype}': '{kw}'")
                            break
                    if metadata["document_type"]:
                        break

    # --- Date Extraction ---
    date_match = re.search(
        r"(Effective Date|Approved Date|Published Date)\s*[:\-]?\s*"
        r"(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})",
        text,
        re.IGNORECASE
    )
    if date_match:
        try:
            date_text = date_match.group(2)
            cleaned_date = re.sub(r"(st|nd|rd|th)", "", date_text)
            parsed_date = date_parser.parse(cleaned_date, dayfirst=True)
            metadata["effective_date"] = parsed_date.strftime("%Y-%m-%d")
            print(f"📅 Extracted date: {metadata['effective_date']}")
        except Exception as e:
            print(f"⚠️ Date parsing failed: {date_text} → {e}")

    # --- System ID Matching ---
    metadata["system_ids"] = get_system_ids(text, orgId)

    return metadata

def get_system_ids(text,orgId):
    system_ids = set()
    all_systems = list(system_collection.find(
    {"organizationId":orgId}, 
    {"name": 1}
))

    text_lower = text.lower()

    for system in all_systems:
        sys_name = system.get("name")
        if not sys_name:
            continue
        sys_name_clean = sys_name.lower().replace("/", "").replace("-", "").replace(" ", "")
        text_clean = text_lower.replace("/", "").replace("-", "").replace(" ", "")

        # Try direct or fuzzy substring match
        if sys_name.lower() in text_lower or sys_name_clean in text_clean:
            system_ids.add(str(system["_id"]))
            continue

        # Fall back to embedding similarity if substring fails
        text_emb = generate_embedding(text)
        sys_emb = generate_embedding(sys_name)
        score = cosine_similarity([text_emb], [sys_emb])[0][0]
        if score > 0.70:
            system_ids.add(str(system["_id"]))

    return list(system_ids)
def normalize_spaces(text):
    # Replace multiple spaces with single space and strip line ends
    lines = text.splitlines()
    normalized_lines = [' '.join(line.split()).strip() for line in lines]
    return '\n'.join(normalized_lines)

def extract_text_from_docx(file_obj, filename=None):
    file_obj.seek(0)
    doc = docx.Document(file_obj)
    full_text = []
    title_candidates = []

    for para in doc.paragraphs[:20]:  # Look in first 20 paragraphs
        text = para.text.strip()
        if text:
            full_text.append(text)

        is_centered = para.alignment == 1
        if not text or len(text) < 8:
            continue
        if len(set(text)) <= 3:  # Skip lines like ----- or ====
            continue
        if any(run.bold for run in para.runs) or is_centered:
            word_count = len(re.findall(r"\b\w+\b", text))
            if word_count >= 4:
                title_candidates.append(text)

    # Keyword-based scoring for title relevance
    for candidate in title_candidates:
        if re.search(r"\b(manual|policy|procedure|instruction|guide|security|management|document|name|recovery)\b", candidate, re.IGNORECASE):
            return "\n".join(full_text), candidate

    # Fallback to first candidate if no keyword hit
    if title_candidates:
        return "\n".join(full_text), title_candidates[0]

    # Final fallback: use cleaned-up filename
    if filename:
        fallback_title = re.sub(r"[_\-]+", " ", os.path.splitext(filename)[0]).strip().title()
    else:
        fallback_title = "Untitled"

    return "\n".join(full_text), fallback_title


def extract_text_from_pdf(file_obj):
    file_obj.seek(0)
    reader = PdfReader(file_obj)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    print("Raw PDF text:", text[:5000])
    return text

def extract_text_from_excel(file_obj):
    file_obj.seek(0)
    file_bytes = BytesIO(file_obj.read())  # wrap in buffer
    wb = openpyxl.load_workbook(file_bytes, data_only=True)

    text_cells = []
    for sheet in wb.worksheets:
        for row in sheet.iter_rows(values_only=True):
            for cell in row:
                if cell is not None:
                    text_cells.append(str(cell))
    return "\n".join(text_cells)

def infer_title_from_filename(filename: str) -> str:
    # Remove extension
    name = os.path.splitext(filename)[0]

    # Replace underscores, dashes with spaces
    name = re.sub(r"[_\-]+", " ", name)

    # Remove extra spaces and capitalize properly
    name = re.sub(r"\s+", " ", name).strip().title()

    return name


def process_docfile(file_obj, filename, location_id, entity_id, created_by, orgId, docUrl):
    try:
        file_obj.seek(0)
        ext = filename.lower().split('.')[-1]

        if ext == 'docx':
            text, bold_title = extract_text_from_docx(file_obj, filename)
        elif ext == 'pdf':
            text = extract_text_from_pdf(file_obj)
            bold_title = None
        elif ext in ['xlsx', 'xls']:
            text = extract_text_from_excel(file_obj)
            bold_title = None
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        metadata = extract_metadata(text, bold_title, orgId,None)
        doctype_id = get_doctype_id(metadata["document_type"], orgId)
        print("doctype id",doctype_id)

        # Abort if no document type match found
        if not doctype_id:
            print(f"⚠️ No valid document type found for '{metadata['document_type']}' in {filename}. Falling back to 'Default' document type.")
            doctype_id = get_doctype_id("Default", orgId)
        print("doctype id",doctype_id)
        # if not doctype_id:
        #     print(f"❌ 'Default' document type not found in organization {orgId}. Document creation aborted.")
        # return {
        #     "filename": filename,
        #     "document_state": "FAILED",
        #     "reason": "Document not uploaded: No matching or default document type found."
        # }

        reviewers = metadata.get("reviewers", [])
        approvers = metadata.get("approvers", [])
        system_ids = metadata.get("system_ids")

        # Determine state based on completeness
        document_state = "PUBLISHED"
        if not system_ids or not reviewers or not approvers:
            print(f"⚠️ Missing reviewers, approvers, or systems → marking as DRAFT")
            document_state = "DRAFT"

        # Determine approved date
        if ext in ['docx', 'xlsx', 'xls']:
            approved_date = extract_issue_date(text)
        else:
            approved_date = metadata.get("effective_date")
            if isinstance(approved_date, str) and approved_date:
                approved_date = date_parser.parse(approved_date)
            else:
                approved_date = datetime.utcnow()

        # Build final document data
        doc_data = {
            "doctypeId": doctype_id,
            "organizationId": orgId,
            "documentName": metadata["title"] or infer_title_from_filename(filename),
            "reasonOfCreation": "",
            "currentVersion": metadata["version"],
            "documentLink": docUrl,
            "documentState": document_state,
            "locationId": location_id,
            "entityId": entity_id,
            "system": system_ids,
            "issueNumber": metadata["issue_number"],
            "revisionReminderFlag": False,
            "isVersion": False,
            "documentNumbering": metadata["serial_number"],
            "countNumber": 1,
            "createdBy": created_by,
            "favoriteFor": [],
            "reviewers": reviewers,
            "approvers": approvers,
            "distributionList": {"type": "None", "ids": []},
            "readAccess": {"type": "All Users", "ids": ["All"]},
            "versionInfo": [],
            "workflowDetails": "default",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "updatedBy": created_by,
            "nextRevisionDate": datetime.utcnow(),
            "approvedDate": approved_date,
            # "semanticEmbedding": {
            #     "title": generate_embedding(metadata["title"]),
            #     "serial": generate_embedding(metadata["serial_number"]),
            #     "docType": generate_embedding(metadata["document_type"]),
            # }
        }

        documents_collection.insert_one(doc_data)
        # print(f"✅ Uploaded: {filename} ({document_state})")
        return {
        "filename": filename,
        "document_state": document_state,
        "reason": "Missing reviewers, approvers, or systems marked as DRAFT" if document_state == "DRAFT" else "All required details were found"
        }

    except Exception as e:
        print(f"❌ Failed to process {filename}: {e}")
        return {
            "filename": filename,
            "document_state": "FAILED",
            "reason": f"Document not uploaded: {str(e)}"
        }




