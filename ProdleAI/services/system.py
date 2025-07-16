import docx
import pytesseract
from PIL import Image
import io
import os
from services.utils import get_capa_data,generate_openai_embeddings
from prompt_templates.templates import entity_extraction,capa_ai_suggestions_prompt
from openai import OpenAI as org_opeani
from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from pymilvus import Collection, WeightedRanker, RRFRanker
from database.connection import connect_to_milvus, use_database
from database.settings import DEFAULT_DB_NAME
import json
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
tesseract_path = os.getenv("TESSERACT_PATH")
folder_path = os.getenv("FOLDER_PATH")
server_url = os.getenv("SERVER_URL")
app = Flask(__name__)
api_key = os.getenv("OPENAI_API_KEY")
CORS(app, origins="*")
pytesseract.pytesseract.tesseract_cmd = tesseract_path
from sentence_transformers import CrossEncoder

# Load the Cross-Encoder model (pre-trained for MS MARCO)
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-12-v2')

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
def generate_embeddings_and_prepare_data(CAPA_text, metadata):
    text_chunks = chunk_text(CAPA_text)
    #print(f"Number of text chunks: {text_chunks}")
    embeddings = generate_openai_embeddings(text_chunks)
    #print(f"Number of text chunks: {len(embeddings)}")

    # if len(embeddings) != len(text_chunks):
    #     raise ValueError("Number of embeddings does not match number of text chunks.")

    # Prepare data for insertion into Milvus
    chunk_ids = list(range(len(text_chunks)))
    metadata_list = [{**metadata, "chunkIndex": i} for i in range(len(text_chunks))]

    return text_chunks, embeddings, chunk_ids, metadata_list


def insert_system_in_milvus_system_collection(systemDtls):
    print("capa data", systemDtls)

    # Connect to Milvus
    connect_to_milvus()
    use_database(DEFAULT_DB_NAME)
    collection_name = "system_collection"
    collection = Collection(name=collection_name)
    
    # Ensure the collection has an index; if not, create one
    if not collection.has_index():
        index_params = {
            "index_type": "IVF_FLAT",  # Choose index type suitable for your use case
            "metric_type": "IP",       # Inner Product for cosine similarity
            "params": {"nlist": 128}
        }
        collection.create_index(field_name="embedding", index_params=index_params)

    # Load the collection into memory
    collection.load()
    
    # Extract meta_data correctly (content is already a dictionary)
    meta_data = {
        "systemId":   systemDtls["_id"],
        "type":    systemDtls["type"],
        "organizationId":   systemDtls["organizationId"]
    }
    print("Meta data:", meta_data)
    
    # Construct CAPA text from various fields
    CAPA_text = f"System Name: {systemDtls.get('name', 'N/A')}\n"
    CAPA_text += f"Description: {systemDtls.get('description', 'N/A')}\n"
    CAPA_text += f"System Type: {systemDtls.get('type', 'N/A')}\n"
    CAPA_text += f"Applicable Locations: {systemDtls.get('applicable_locations', 'N/A')}\n"
    CAPA_text += f"Organization Id: {systemDtls.get('organizationId', 'N/A')}\n"
    
    print("CAPA_text data:", CAPA_text)

    # Generate embeddings and prepare data (assuming generate_embeddings_and_prepare_data works)
    text_chunks, embeddings, chunk_ids, metadata_list = generate_embeddings_and_prepare_data(CAPA_text, meta_data)
    print("text_chunks data:", text_chunks)
    print("embeddings data:", embeddings)
    print("chunk_ids data:", chunk_ids)
    print("metadata_list data:", metadata_list)
    #print("text chunks and chunk ids",embeddings)
    # Prepare the data for insertion
    
    data_to_insert = [
        [meta_data["systemId"]] * len(chunk_ids),
        embeddings,                              # Embeddings
        text_chunks,
        metadata_list                            # Text chunks
    ]
    # data_to_insert = [
    # ["CAPA-12345"], 
    # [[0.12] * 1536],  
    # ["This is a sample CAPA document for testing."],  
    # [{"location": "Mumbai", "entity": "ABC Corp"}]  
    # ]
    
    # Insert data into Milvus collection
    try:
        result = collection.insert(data_to_insert)
        #print("Chunks added:", result)
        return "Success"

    except Exception as e:
        print(f"Error inserting data into Milvus: {e}")
        return jsonify({"message": "Failed to upload data to Milvus", "error": str(e)}), 500