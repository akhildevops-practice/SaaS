from pymilvus import Collection, CollectionSchema
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
from services.auditReport import insert_audit_report_data, insert_list_of_finding_data
from services.utils import generate_openai_embeddings
from services.doc import generate_risk_analysis_from_doc
from openai import OpenAI

# Load environment variables from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


def chunk_text(text, size=4096):
    return [text[i:i+size] for i in range(0, len(text), size)]


def docx_to_text(file_path):
    doc = Document(file_path)
    output = []
    for paragraph in doc.paragraphs:
        text = paragraph.text
        output.append(text)

    return "\n".join(output)


def pdf_to_text(file_path):
    reader = PdfReader(file_path)
    output = []
    for page in reader.pages:
        text = page.extract_text()
        output.append(text)

    return "\n".join(output)


def file_to_text(file_path):
    if file_path.endswith(".docx"):
        return docx_to_text(file_path)
    elif file_path.endswith(".pdf"):
        return pdf_to_text(file_path)
    else:
        raise ValueError("Unsupported file format")


def insert_into_milvus_doc_collection(doc, local_path=None):
    # Start the timer
    start_time = time.time()

    # Connect to Milvus and use the default database
    connect_to_milvus()
    use_database(DEFAULT_DB_NAME)

    # Access the Milvus collection
    collection_name = "document_collection"
    collection = Collection(name=collection_name)

    # Determine the file path to use
    if local_path and os.path.exists(local_path):
        # If local_path is provided and exists, use it directly
        # print(f"Using provided local file: {local_path}")
        file_path = local_path
    else:
        # Otherwise, construct the path from the document link
        doc_link = doc["documentLink"].replace(
            os.getenv("SERVER_URL"), "../uploads")
        file_path = doc_link
        # print(f"Using document link path: {file_path}")
    
    # Extract text from the file
    text = file_to_text(file_path)
    text_chunks = chunk_text(text)

    print(f"Loaded {len(text_chunks)} chunks.")
    # Generate embeddings for the text chunks using OpenAI
    embeddings = generate_openai_embeddings(text_chunks)
    if len(embeddings) != len(text_chunks):
        raise ValueError(
            "Number of embeddings does not match number of text chunks.")

    # Prepare data for Milvus insertion
    chunk_ids = list(range(len(text_chunks)))  # Milvus expects numeric IDs
    doc_ids = [str(doc["_id"])] * len(text_chunks)  # Repeated doc_id

    # print("chunk ids and doc ids", chunk_ids, doc_ids)

    meta_data_list = [{
        "documentName": doc["documentName"],
        "docId": str(doc["_id"]),
        "organizationId": doc["organizationId"],
        "locationName": doc["locationName"],
        "entityName": doc["entityName"],
        "documentLink": doc["documentLink"],
        "chunkIndex": i
    } for i in range(len(text_chunks))]

    # Prepare data for Milvus
    data = {
        "chunk_id": chunk_ids,
        "doc_id": doc_ids,
        "doc_embedding": embeddings,
        "doc_chunk": text_chunks,
        "metadata": meta_data_list
    }
    # Prepare data in row-wise format
    # Prepare data in column-wise format for Milvus
    data_to_insert = [
        data["doc_id"],         # List of doc_ids
        data["chunk_id"],       # List of chunk_ids
        data["doc_embedding"],  # List of embeddings (vectors)
        data["doc_chunk"],      # List of text chunks
        data["metadata"],       # List of metadata dictionaries
    ]

    # Insert into Milvus
    try:
        collection.insert(data_to_insert)  # Pass data as column-wise lists
        print(
            f"Successfully inserted {len(data['chunk_id'])} chunks into Milvus.")
    except Exception as e:
        print(f"Failed to insert data into Milvus: {e}")


def process_sections(sections, all_findings):
    unique_findings_object = {}

    for section in sections:
        for subsection in section.get("sections", []):
            for field in subsection.get("fieldset", []):
                nc_item = next(
                    (item for item in all_findings if item["sectionFindingId"] == field.get("ncId")), None)

                if nc_item:
                    field["nc"] = field.get("nc", {})
                    field["nc"]["status"] = nc_item["status"]

                field_type = field.get("nc", {}).get("type")
                if field_type:
                    if field_type not in unique_findings_object:
                        unique_findings_object[field_type] = []
                    unique_findings_object[field_type].append(field["nc"])

    return unique_findings_object


def generate_openai_embeddings(text_chunks):
    """
    Generate embeddings for a list of text chunks using OpenAI's Ada model.
    """
    embeddings = []
    openai_client = OpenAI()
    print("text_chunks in generate openai embeddings", text_chunks)
    print("length of text_chunks", len(text_chunks))
    try:
        for chunk in text_chunks:
            response = openai_client.embeddings.create(
                input=chunk,
                model="text-embedding-ada-002"
            )
            embedding = response.data[0].embedding
            embeddings.append(embedding)
    except Exception as e:
        print(f"Error generating embeddings: {e}")
    return embeddings


def insert_audit_report(record):
    insert_audit_report_data(record)


def insert_list_of_finding(record):
    insert_list_of_finding_data(record)
