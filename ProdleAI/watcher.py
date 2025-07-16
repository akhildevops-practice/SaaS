import json
from pymongo import MongoClient
import pprint

# from indexDoc import insert_into_doc
from database.milvus_insert import (
    insert_audit_report,
    insert_audit_report_data,
    insert_into_milvus_doc_collection,
    insert_list_of_finding,
)
import os
from dotenv import load_dotenv
from services.doc import (
    generate_tags_from_doc,
    generate_tags_from_drawing,
    generate_summary_for_drawing,
    generate_mcq,
    generate_summary_from_doc,
    generate_risk_analysis_from_doc,
)
from services.utils import download_file_from_oci, get_oci_config_from_objectstore

# Load environment variables from .env file
load_dotenv()

# Create a MongoClient
mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))

# Access your database
mongo_db = mongo_client["prodle_db"]

# Function to handle change events


def insert_into_ai_meta_data_collection(record):
    ai_meta_data_collection = mongo_db["aimetadatas"]
    print("record in insert_into_ai_meta_data_collection", ai_meta_data_collection)
    ai_meta_data_collection.insert_one(record)


def handle_change(change):
    operation_type = change["operationType"]
    collection = change["ns"]["coll"]

    if operation_type == "insert" and collection == "documents":
        doc_dtls = change["fullDocument"]
        location_id = doc_dtls["locationId"]
        entity_id = doc_dtls["entityId"]
        print("------->DOC DTLS", doc_dtls)
        # Fetch the location record
        location_collection = mongo_db["Location"]
        location_record = location_collection.find_one({"_id": location_id})

        # Fetch the entity record
        entity_collection = mongo_db["Entity"]
        entity_record = entity_collection.find_one({"_id": entity_id})

        # Get the location and entity names
        location_name = location_record["locationName"]
        entity_name = entity_record["entityName"]

        org_collection = mongo_db["Organization"]
        org_record = org_collection.find_one(
            {"_id": location_record["organizationId"]})
        org_name = org_record["organizationName"]

        # Add new fields to doc_dtls
        doc_dtls["locationName"] = location_name
        doc_dtls["entityName"] = entity_name
        doc_dtls["organizationName"] = org_name

        print("inside watcher realmName", doc_dtls["organizationName"])

        # Check if we're using object store
        is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
        
        if is_object_store:
            # For object store, we need to download the file first
            object_name = doc_dtls["documentLink"]
            org_id = location_record["organizationId"]
            
            # Get OCI configuration
            oci_config = get_oci_config_from_objectstore(org_id)
            
            # Download the file to a temporary location
            local_path = download_file_from_oci(object_name, org_id)
            # print(f"Downloaded file from OCI to {local_path}")
            
            # Process the file based on its type
            if not object_name.endswith(".pdf") and not object_name.endswith(".docx"):
                # print("Processing non-document file (e.g., JPG) from object store")
                drawing_concepts = generate_tags_from_drawing(
                    local_path, org_id)
                drawing_summary = generate_summary_for_drawing(
                    local_path, org_id)
                
                # print("-->drawing_concepts", drawing_concepts)

                meta_body = {
                    "organizationId": org_id,
                    "documentId": str(doc_dtls["_id"]),
                    "metadataDrawing": drawing_concepts,
                    "drawingSummary": drawing_summary
                }
                insert_into_ai_meta_data_collection(meta_body)
            else:
                # print("Processing DOCX or PDF from object store")
                concepts = generate_tags_from_doc(
                    local_path, org_id)
                doc_summary = generate_summary_from_doc(
                    local_path, org_id)
                doc_mcq = generate_mcq(local_path, org_id)
                risk_analysis = generate_risk_analysis_from_doc(
                    local_path, org_id)
                
                # Handle potential JSON formatting in `doc_mcq`
                if isinstance(doc_mcq, str) and "```json" in doc_mcq:
                    doc_mcq_cleaned = doc_mcq.strip('```json').rstrip('```')
                    doc_mcq_json = json.loads(doc_mcq_cleaned)
                else:
                    doc_mcq_json = json.loads(doc_mcq)

                meta_body = {
                    "organizationId": org_id,
                    "documentId": str(doc_dtls["_id"]),
                    "metadata": concepts,
                    "docSummary": doc_summary,
                    "docMCQ": doc_mcq_json,
                    "riskAnalysis": risk_analysis
                }

                # print("Creating record into ai_meta_data_collection (DOCX/PDF) from object store")
                insert_into_ai_meta_data_collection(meta_body)

                # Call the Milvus function with the local_path
                # print("Inserting document into Milvus from object store")
                insert_into_milvus_doc_collection(doc_dtls, local_path)
                # print("Document inserted into Milvus successfully!")
            
            # Clean up the temporary file
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")
        else:
            # Original local file storage logic
            doc_link = doc_dtls["documentLink"].replace(
                os.getenv("SERVER_URL"), "../uploads")
            # print("calling llm in watcher handle change")
            print("doc link in else in handle change watcher ", doc_link)
            if not doc_dtls["documentLink"].endswith(".pdf") and not doc_dtls["documentLink"].endswith(".docx"):
                # print("Processing non-document file (e.g., JPG)")
                drawing_concepts = generate_tags_from_drawing(
                    doc_link, location_record["organizationId"])
                drawing_summary = generate_summary_for_drawing(
                    doc_link, location_record["organizationId"])
                
                # print("-->drawing_concepts", drawing_concepts)

                meta_body = {
                    "organizationId": location_record["organizationId"],
                    "documentId": str(doc_dtls["_id"]),
                    "metadataDrawing": drawing_concepts,
                    "drawingSummary": drawing_summary
                }
                insert_into_ai_meta_data_collection(meta_body)
            else:
                # print("Processing DOCX or PDF")
                concepts = generate_tags_from_doc(
                    doc_link, location_record["organizationId"])
                doc_summary = generate_summary_from_doc(
                    doc_link, location_record["organizationId"])
                doc_mcq = generate_mcq(doc_link, location_record["organizationId"])
                risk_analysis = generate_risk_analysis_from_doc(
                    doc_link, location_record["organizationId"])
                # print("risk anyalysis text", risk_analysis)
                # Handle potential JSON formatting in `doc_mcq`
                if isinstance(doc_mcq, str) and "```json" in doc_mcq:
                    doc_mcq_cleaned = doc_mcq.strip('```json').rstrip('```')
                    doc_mcq_json = json.loads(doc_mcq_cleaned)
                else:
                    doc_mcq_json = json.loads(doc_mcq)

                meta_body = {
                    "organizationId": location_record["organizationId"],
                    "documentId":str(doc_dtls["_id"]),
                    "metadata": concepts,
                    "docSummary": doc_summary,
                    "docMCQ": doc_mcq_json,
                    "riskAnalysis": risk_analysis
                }

                # print("Creating record into ai_meta_data_collection (DOCX/PDF)")
                insert_into_ai_meta_data_collection(meta_body)

                # Call the new Milvus function with the local file path
                # print("Inserting document into Milvus")
                insert_into_milvus_doc_collection(doc_dtls, None)
                print("Document inserted into Milvus successfully!")
    elif operation_type in ["insert", "update", "create"] and collection == 'audits':
        audit_details = change["fullDocument"]
        insert_audit_report(audit_details)
    elif operation_type in ["insert", 'update', 'create'] and collection == 'nonconformances':
        audit_details = change['fullDocument']
        insert_list_of_finding(audit_details)


# Open a change stream on the collection
with mongo_db.watch(
    [{'$match': {'operationType': {'$in': ['insert', 'update', 'delete', 'create']}}}],
        full_document='updateLookup',
        full_document_before_change='whenAvailable'
) as stream:
    print("Watching for changes...")

    # Keep the change stream open to capture changes
    try:
        for change in stream:
            handle_change(change)
    except KeyboardInterrupt:
        print("Change stream closed.")
