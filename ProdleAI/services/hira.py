from pymilvus import Collection
from database.connection import connect_to_milvus, use_database
from database.settings import DEFAULT_DB_NAME
import os
from pymongo import MongoClient
from docx import Document
import time
from PyPDF2 import PdfReader
import openai
from openai import OpenAI
from dotenv import load_dotenv
from ai_models import OpenaiModel, ClaudeModel
from services.utils import generate_openai_embeddings, get_hira_data, get_embedding_for_text
from utils.license_token_tracker import track_token_usage_in_license
import json

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

def chunk_text(text, max_length=2000):
    chunks = []
    while len(text) > max_length:
        split_point = text.rfind("\n", 0, max_length)
        if split_point == -1:
            split_point = max_length
        chunks.append(text[:split_point])
        text = text[split_point:].strip()
    chunks.append(text)
    return chunks


def generate_embeddings_and_prepare_data(hira_text, metadata):
    text_chunks = chunk_text(hira_text)
    embeddings = generate_openai_embeddings(text_chunks)

    if len(embeddings) != len(text_chunks):
        raise ValueError("Number of embeddings does not match number of text chunks.")

    # Prepare data for insertion into Milvus
    chunk_ids = list(range(len(text_chunks)))
    metadata_list = [{**metadata, "chunkIndex": i} for i in range(len(text_chunks))]

    return text_chunks, embeddings, chunk_ids, metadata_list



def create_hira_text_and_metadata(hira_data):
    hira = hira_data.get("hira", {})
    steps = hira_data.get("steps", [])
    category = hira.get("categoryDetails", {})

    # Get dynamic labels
    title_label = category.get("titleLabel", "Job Title")
    step_label = category.get("basicStepLabel", "Step")

    # Helper function to safely get values, defaulting to "N/A"
    def safe_get(d, key, subkey=None):
        if subkey:
            return d.get(key, {}).get(subkey, "N/A") if d.get(key) else "N/A"
        return d.get(key, "N/A")

    # Construct the readable text for HIRA
    hira_text = f"{title_label}: {safe_get(hira, 'jobTitle')}\n"
    hira_text += f"Risk Category: {safe_get(category, 'riskCategory')}\n"
    hira_text += f"Location: {safe_get(hira, 'locationDetails', 'locationName')}\n"
    hira_text += f"Entity: {safe_get(hira, 'entityDetails', 'entityName')}\n"
    hira_text += f"Section: {safe_get(hira, 'sectionDetails', 'name')}\n"
    hira_text += f"Area: {safe_get(hira, 'areaDetails', 'name')}\n"
    hira_text += f"Condition: {safe_get(hira, 'condition')}\n"
    hira_text += f"Risk Type: {safe_get(hira, 'riskType')}\n"
    hira_text += "Steps:\n"

    for step in steps:
        hira_text += (
            f"\n{step_label} {safe_get(step, 'sNo')}: {safe_get(step, 'jobBasicStep')}\n"
            f"Hazard: {safe_get(step, 'hazardDescription')}\n"
            f"Impact: {safe_get(step, 'impactText')}\n"
            f"Controls: {safe_get(step, 'existingControl')}\n"
        )

    # Metadata for Milvus
    metadata = {
        "hiraId": safe_get(hira, "_id"),
        "riskCategory": safe_get(category, "riskCategory"),
        "categoryId": safe_get(category, "_id"),
        "jobTitle": safe_get(hira, "jobTitle"),
        "organizationId": safe_get(hira, "organizationId"),
        "locationName": safe_get(hira, "locationDetails", "locationName"),
        "entityName": safe_get(hira, "entityDetails", "entityName"),
        "stepsCount": len(steps),
    }

    return hira_text, metadata


def insert_into_milvus_hira_collection(hira_id):
    # Step 1: Prepare HIRA text and metadata
    hira_data = get_hira_data(hira_id)
    hira_text, metadata = create_hira_text_and_metadata(hira_data)

    print("Hira text", hira_text)
    # print("Metadata", metadata)

    # Step 2: Generate chunks and embeddings
    text_chunks, embeddings, chunk_ids, metadata_list = generate_embeddings_and_prepare_data(hira_text, metadata)

    # Step 3: Insert into Milvus
    collection_name = "hira_collection"
    collection = Collection(name=collection_name)

    data_to_insert = [
        [metadata["hiraId"]] * len(chunk_ids),  # HIRA ID
        chunk_ids,                             # Chunk IDs
        embeddings,                            # Embeddings
        text_chunks,                           # Text chunks
        metadata_list                          # Metadata
    ]

    try:
        insert_data =  collection.insert(data_to_insert)
        print("insert_data", insert_data)
        print(f"Successfully inserted {len(chunk_ids)} chunks into Milvus.")
    except Exception as e:
        print(f"Failed to insert data into Milvus: {e}")

#mainly for QandA, single top matching result
def query_hira(body):
    """
    Query HIRA data using Milvus vector search.
    """
    try:
        # Step 1: Generate query embedding
        query_embedding = get_embedding_for_text(body["query"])

        # Step 2: Connect to Milvus collection
        collection_name = "hira_collection"
        collection = Collection(name=collection_name)

        # Ensure the collection has an index; if not, create one
        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",  # Choose index type suitable for your use case
                "metric_type": "IP",       # Inner Product for cosine similarity
                "params": {"nlist": 128}
            }
            collection.create_index(field_name="step_embedding", index_params=index_params)

        # Load the collection into memory
        collection.load()

        # Step 3: Prepare search parameters and dynamic filters
        top_k = 1  # Retrieve the top result
        search_params = {
            "metric_type": "IP",  # Inner Product for cosine similarity
            "params": {"nprobe": 10}
        }

        # Dynamic filters for metadata fields
        filters = []
        metadata_keys = ["locationName", "entityName", "organizationId"]  # Metadata keys for filtering
        for key in metadata_keys:
            if key in body:
                filters.append(f"metadata['{key}'] == '{body[key]}'")

        filter_expr = " and ".join(filters) if filters else ""

        # Step 4: Perform search in Milvus
        results = collection.search(
            data=[query_embedding],
            anns_field="step_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["step_description", "metadata", "step_embedding"],  # Return text chunk and metadata
            expr=filter_expr
        )

        # Step 5: Process results
        if not results[0]:
            # If no results found, return "no results found"
            return {
                "answer": "no results found",
                "highlight_text": ""
            }

        top_result = results[0][0]
        metadata = top_result.entity.get("metadata")
        chunk_text = top_result.entity.get("step_description")
        similarity = top_result.distance

        
        # print("response_text entity", top_result.entity)

        # Step 6: Format response with LLM-generated reply
        # Step 4: Generate LLM response with JSON output format
        query_text = body["query"]
        chat_prompt = (
            """Context: {chunk_text}\n
            Query: {query_text} \n
            Metadata: {metadata}\n
            Provide a JSON object with just one key: 'answer' containing the most relevant answer to the query, 
            If no relevant answer is found, set 'answer' to 'no results found.
            Dont wrap the json in ```json ```, it should be a plain json object.
            """
        )
        model = OpenaiModel(
            config={
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": "gpt-4o-mini",
                "max_tokens": 4000,
                "temperature": 0,
            }
        )
        messages = [body["query"]]
        response = model.generate_response(system_message=chat_prompt, messages=messages)
        # print("response from openai", response)
        response_text = response["output"] 
        input_tokens = response["input_tokens"]
        output_tokens = response["output_tokens"]
        
        # print("input_tokens", input_tokens)
        # print("output_tokens", output_tokens)
        # print("model provider", model.provider)
        
        track_token_usage_in_license(
            org_id=body["organizationId"],
            provider=model.provider,
            feature="HiraQuery",
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )
        
        try:
        # Ensure response is a proper string
            cleaned_response = response_text.strip()
            
            # Fix improperly formatted JSON by replacing control characters
            cleaned_response = cleaned_response.replace("\n", "").replace("\t", "").replace("\r", "")

            response_json = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from OpenAI: {e}")
            response_json = {
                "answer": "no results found",
                "highlight_text": ""
            }

        return {
            "hiraId": metadata["hiraId"],
            "chunkText": chunk_text,
            "answer": response_json.get("answer", "no results found"),
            "highlight_text": response_json.get("highlight_text", ""),
            "metadata": metadata
        }



    except Exception as e:
        raise Exception(f"Error in HIRA query: {e}")


# semantic search, multiple results
def search_hira(body):
    """
    Query HIRA data using Milvus vector search and return a single consolidated result.
    """
    # print("BODY IN CHHAT HIRA--", body)
    try:
        # Step 1: Generate query embedding
        query_embedding = get_embedding_for_text(body["query"])

        # Step 2: Connect to Milvus collection
        collection_name = "hira_collection"
        collection = Collection(name=collection_name)

        # Ensure the collection has an index; if not, create one
        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "IP",
                "params": {"nlist": 128}
            }
            collection.create_index(field_name="step_embedding", index_params=index_params)

        # Load the collection into memory
        collection.load()

        # Step 3: Prepare search parameters and dynamic filters
        top_k = 5  # Retrieve up to 5 matching results
        search_params = {
            "metric_type": "IP",  # Inner Product for cosine similarity
            "params": {"nprobe": 10}
        }

        # Dynamic filters for metadata fields
        filters = []
        metadata_keys = ["locationName", "entityName", "organizationId"]
        for key in metadata_keys:
            if key in body:
                filters.append(f"metadata['{key}'] == '{body[key]}'")

        # Add categoryId to filters if not "All"
        if "categoryId" in body and body["categoryId"] != "All":
            filters.append(f"metadata['categoryId'] == '{body['categoryId']}'")


        filter_expr = " and ".join(filters) if filters else ""

        # Step 4: Perform search in Milvus
        results = collection.search(
            data=[query_embedding],
            anns_field="step_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["step_description", "metadata", "step_embedding"],  # Return text chunk and metadata
            expr=filter_expr
        )

        # Step 5: Filter out invalid results
        filtered_results = [
            {
                "chunkText": top_result.entity.get("step_description"),
                "metadata": top_result.entity.get("metadata"),
                "similarity": top_result.distance,
            }
            for top_result in results[0]
            if top_result.entity.get("metadata") and top_result.entity.get("step_description")
        ]

        if not filtered_results:
            return {
                "answer": "No results found.",
                "highlight_text": "",
                "sources": []
            }

        # Step 6: Consolidate results for OpenAI prompt
        prompt_contexts = "\n\n".join(
            [
                f"Context {idx}:\n"
                f"Text: {result['chunkText']}\n"
                f"Metadata: {result['metadata']}\n"
                for idx, result in enumerate(filtered_results)
            ]
        )

        print("prompt_contexts", prompt_contexts)

        chat_prompt = (
            """ 
            {prompt_contexts}
            Query: {query} 

            Please provide a comprehensive and detailed response to the query based strictly on the provided contexts. Your response should:

            1. Be detailed and explanatory, written in simple, easy-to-understand language
            2. Break down complex information into clear points
            3. Explain cause-and-effect relationships when present
            4. Include relevant details from the context that help build a complete understanding
            5. Use natural, conversational language while maintaining professionalism
            6. Provide examples or clarifications from the context when available

            Important Guidelines:
            - Strictly use ONLY information present in the provided contexts
            - Do not make assumptions or include external knowledge
            - If information is not available in the contexts, respond with: "The information is not available in the provided contexts."
            - Ensure the answer is comprehensive yet focused on the query

            Format the response as a JSON object with the following keys:
            {{
                "answer": A detailed, well-structured explanation that thoroughly addresses the query. Break down complex information into digestible parts and use clear language. Include relevant context and explanations that help build a complete understanding.
                
                
                "sources": An array of objects containing:
                    - "jobTitle": The job title from the source
                    - "hiraId": The HIRA ID of the source
                    - "text": The relevant supporting text from the context
            }}

            Ensure the response is:
            1. A valid JSON object
            2. Based solely on provided contexts
            3. Comprehensive and detailed
            4. Clear and easy to understand
            5. Well-structured and logical
            make sure the json is valid,
            Don't wrap the JSON in ```json ``` tags. It should be a plain JSON object.
            """
        )

        chat_prompt = chat_prompt.format(prompt_contexts=prompt_contexts, query=body["query"])

        # Step 7: Query OpenAI
        model = OpenaiModel(
            config={
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": "gpt-4o-mini",
                "max_tokens": 4000,
                "temperature": 0,
            }
        )
        response = model.generate_response(system_message=chat_prompt, messages=[body["query"]])
        # print("response from openai in search hira", response)
        
        # print("input tokens hira chat search_hira", response["input_tokens"])
        # print("output tokens hira chat search_hira", response["output_tokens"])
        # print("model provider hira chat search_hira", model.provider)

        track_token_usage_in_license(
            org_id=body["organizationId"],
            provider=model.provider,
            feature="HiraChat",
            input_tokens=response["input_tokens"],
            output_tokens=response["output_tokens"]
        )

        # Step 8: Parse OpenAI response
        try:
            cleaned_response = response["output"].strip()
            cleaned_response = cleaned_response.replace("\n", "").replace("\t", "").replace("\r", "")
            response_json = json.loads(cleaned_response)
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from OpenAI.")

        # Validate response structure
        if not isinstance(response_json, dict) or "answer" not in response_json or "sources" not in response_json:
            raise Exception("Unexpected response structure from OpenAI.")

        # Ensure sources are in expected format
        sources = response_json.get("sources", [])
        for source in sources:
            if "jobTitle" not in source or "hiraId" not in source or "text" not in source:
                raise Exception("Invalid source structure in OpenAI response.")

        return response_json

    except Exception as e:
        raise Exception(f"Error in HIRA query: {e}")


def search_by_risk_analysis(body):
    """
    Query HIRA data using Milvus vector search and return a comprehensive, formatted result,
    including unique HIRAs if a match is found.
    """
    try:
        query_embedding = get_embedding_for_text(body["query"])
        collection_name = "hira_collection"
        collection = Collection(name=collection_name)

        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "IP",
                "params": {"nlist": 128},
            }
            collection.create_index(field_name="step_embedding", index_params=index_params)
        collection.load()

        top_k = 5
        search_params = {"metric_type": "IP", "params": {"nprobe": 10}}
        results = collection.search(
            data=[query_embedding],
            anns_field="step_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["step_description", "metadata"],
        )

        SIMILARITY_THRESHOLD = 0.85
        filtered_results = [
            {
                "chunkText": result.entity.get("step_description"),
                "metadata": result.entity.get("metadata"),
                "similarity": result.distance,
            }
            for result in results[0]
            if (
                result.entity.get("metadata")
                and result.entity.get("step_description")
                and result.distance >= SIMILARITY_THRESHOLD
            )
        ]

        # print("Filtered results with similarity scores:", filtered_results)

        if filtered_results:
            # Construct unique HIRAs by their jobTitle and hiraId
            unique_hiras = {}
            for result in filtered_results:
                hira_id = result["metadata"].get("hiraId")
                job_title = result["metadata"].get("jobTitle")
                if hira_id and job_title and hira_id not in unique_hiras:
                    unique_hiras[hira_id] = {"jobTitle": job_title, "hiraId": hira_id}

            # Prepare context for LLM
            prompt_contexts = "\n\n".join(
                [
                    f"Context {idx}:\n"
                    f"Text: {result['chunkText']}\n"
                    f"Metadata: {result['metadata']}\n"
                    for idx, result in enumerate(filtered_results)
                ]
            )

            chat_prompt = f"""
            {prompt_contexts}
            Query: {body["query"]}

            Based on the provided contexts, craft a comprehensive paragraph to answer the query. Include:
            1. A clear explanation of whether relevant HIRA data was found.
            2. A summary of the relevant HIRA details, such as the job title, hazards, and steps, if applicable.
            3. Ensure the output is written as a professional and comprehensive paragraph, easy to understand.
            """

            model = ClaudeModel(
                config={
                    "api_key": os.getenv("ANTHROPIC_API_KEY"),
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0,
                }
            )
            response = model.generate_response(system_message=chat_prompt, messages=[body["query"]])

            # Prepare response including unique HIRAs
            return {
                "answer": response.strip(),
                "sources": [
                    {
                        "jobTitle": result["metadata"].get("jobTitle"),
                        "hiraId": result["metadata"].get("hiraId"),
                        "text": result["chunkText"],
                    }
                    for result in filtered_results
                ],
                "uniqueHiras": list(unique_hiras.values()),  # Return the unique HIRA job titles and IDs
            }

        # If no relevant results are found
        else:
            no_match_prompt = f"""
            You are a HIRA expert. No existing HIRA data was found for the following risk analysis:

            {body["query"]}

            Please provide a response in the following JSON format for suggested HIRAs:
            {{
                "message": "No match found",
                "suggestedHiras": [
                    {{
                        "jobTitle": "string",
                        "steps": [
                            {{
                                "basicStepOfJob": "string",
                                "hazardDescription": "string",
                                "impactText": "string",
                                "existingControlMeasure": "string"
                            }}
                        ]
                    }}
                ]
            }}

            Create comprehensive HIRAs based on the risk analysis provided. Each HIRA can have multiple steps.
            Ensure all fields are properly filled with relevant information.
            """

            model = ClaudeModel(
                config={
                    "api_key": os.getenv("ANTHROPIC_API_KEY"),
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0,
                }
            )

            response = model.generate_response(system_message=no_match_prompt, messages=[body["query"]])
            # print("Response from Claude:", response)

            try:
                response_json = json.loads(response)
                return response_json
            except:
                return {"message": "No match found", "suggestedHiras": []}

    except Exception as e:
        raise Exception(f"Error in HIRA query: {e}")



# based on risk categoroies
def search_by_risk_analysis_new(query, risk_categories, org_id):

    """
    Query HIRA data using Milvus vector search and return a comprehensive, formatted result,
    including unique HIRAs if a match is found.
    """
    try:
        query_embedding = get_embedding_for_text(query)

        collection_name = "hira_collection"
        collection = Collection(name=collection_name)

        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "IP",
                "params": {"nlist": 128},
            }
            collection.create_index(field_name="step_embedding", index_params=index_params)
        collection.load()

        top_k = 5
        search_params = {"metric_type": "IP", "params": {"nprobe": 10}}
        results = collection.search(
            data=[query_embedding],
            anns_field="step_embedding",
            param=search_params,
            limit=top_k,
            output_fields=["step_description", "metadata"],
        )

        SIMILARITY_THRESHOLD = 0.85
        filtered_results = [
            {
                "chunkText": result.entity.get("step_description"),
                "metadata": result.entity.get("metadata"),
                "similarity": result.distance,
            }
            for result in results[0]
            if (
                result.entity.get("metadata")
                and result.entity.get("step_description")
                and result.distance >= SIMILARITY_THRESHOLD
            )
        ]

        # print("Filtered results with similarity scores:", filtered_results)

        if filtered_results:
            # Construct unique HIRAs by their jobTitle and hiraId
            unique_hiras = {}
            for result in filtered_results:
                hira_id = result["metadata"].get("hiraId")
                job_title = result["metadata"].get("jobTitle")
                if hira_id and job_title and hira_id not in unique_hiras:
                    unique_hiras[hira_id] = {"jobTitle": job_title, "hiraId": hira_id}

            # Prepare context for LLM
            prompt_contexts = "\n\n".join(
                [
                    f"Context {idx}:\n"
                    f"Text: {result['chunkText']}\n"
                    f"Metadata: {result['metadata']}\n"
                    for idx, result in enumerate(filtered_results)
                ]
            )

            chat_prompt = f"""
            {prompt_contexts}
            Query: {query}

            Based on the provided contexts, craft a comprehensive paragraph to answer the query. Include:
            1. A clear explanation of whether relevant HIRA data was found.
            2. A summary of the relevant HIRA details, such as the job title, hazards, and steps, if applicable.
            3. Ensure the output is written as a professional and comprehensive paragraph, easy to understand.
            """

            model = ClaudeModel(
                config={
                    "api_key": os.getenv("ANTHROPIC_API_KEY"),
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0,
                }
            )

            response = model.generate_response(system_message=chat_prompt, messages=[query])

            # # Track token usage
            track_token_usage_in_license(
                org_id=org_id,
                provider=model.provider,
                feature="HiraRiskAnalysisMatchFound",
                input_tokens=response["input_tokens"],
                output_tokens=response["output_tokens"]
            )

            # Prepare response including unique HIRAs
            return {
                "answer": response["output"].strip(),
                "sources": [
                    {
                        "jobTitle": result["metadata"].get("jobTitle"),
                        "hiraId": result["metadata"].get("hiraId"),
                        "text": result["chunkText"],
                    }
                    for result in filtered_results
                ],
                "uniqueHiras": list(unique_hiras.values()),
            }


            # If no relevant results are found
        else:
            no_match_prompt = f"""
                You are a Risk Assessment Expert.

                No relevant risks were found in the database for the following input:
                "{query}"

                Based on the following risk categories:
                {', '.join(risk_categories)}

                Please generate one complete risk for each category listed above.

                Each risk must include:
                - A `jobTitle`: Title or name for the job or process being assessed
                - A `category`: One of the provided risk categories
                - A `steps` array with at least 2 well-defined steps

                Each step must include:
                - `basicStepOfJob`: Description of the step
                - `hazardDescription`: The key hazard involved
                - `impactText`: What could happen if the hazard is not controlled
                - `existingControlMeasure`: How the hazard is currently managed

                Respond strictly in this JSON format:
                {{
                "message": "No match found",
                "suggestedHiras": [
                    {{
                    "jobTitle": "Descriptive title related to the job/process",
                    "category": "Risk Category Name (e.g., HIRA, Operational, Environmental)",
                    "steps": [
                        {{
                        "basicStepOfJob": "Step description relevant to this category",
                        "hazardDescription": "Describe the main hazard related to the step",
                        "impactText": "Explain the impact if the hazard occurs",
                        "existingControlMeasure": "What controls or precautions are typically used to manage this hazard"
                        }},
                        {{
                        "basicStepOfJob": "...",
                        "hazardDescription": "...",
                        "impactText": "...",
                        "existingControlMeasure": "..."
                        }}
                    ]
                    }}
                ]
                }}

                Ensure:
                - There is **one full risk per category**
                - Each has **2 or more steps**
                - The content is **practical, realistic, and aligned to the category**
                """

            model = ClaudeModel(
                config={
                    "api_key": os.getenv("ANTHROPIC_API_KEY"),
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4000,
                    "temperature": 0,
                }
            )

            response = model.generate_response(system_message=no_match_prompt, messages=[query])

            # # Track token usage for no match fallback
            track_token_usage_in_license(
                org_id=org_id,
                provider=model.provider,
                feature="HiraRiskAnalysisNoMatchFound",
                input_tokens=response["input_tokens"],
                output_tokens=response["output_tokens"]
            )

            try:
                response_json = json.loads(response["output"])
                return response_json
            except:
                return {"message": "No match found", "suggestedHiras": []}


    except Exception as e:
        raise Exception(f"Error in HIRA query: {e}")

