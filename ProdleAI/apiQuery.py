import os
import docx
import uuid
import json
from types import SimpleNamespace
import pprint
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from bs4 import BeautifulSoup
from services.auditReport import search_list_of_finding
# from services.clause import insert_clause_in_milvus_clause_collection
from services.clause import insert_clause_in_milvus_clause_collection
from services.doc import (
    query, semantic_search, generate_mcq, 
    generate_summary_from_doc, generate_template_and_topic_content, 
    generate_tags_from_doc, get_docs_by_ids, 
    identify_clauses, update_prompts, 
    identify_clauses_v2_using_claude, get_response_by_doc_id, 
    get_type_of_doc, getFirstDocTypeInOrg
    )
from database.initialize import initialize_database_and_collections

from services.capa import (
    insert_capa_in_milvus_capa_collection, 
    search_capa,get_capa_suggestions, 
    search_capa_in_doc, 
    generate_capa_ai_suggestions,search_similar_capas_milvus
    )
# from services.system import insert_system_in_milvus_system_collection
from services.system import insert_system_in_milvus_system_collection
from services.utils import (
    get_oci_config_from_objectstore, preprocess_docx, get_entities, 
    remove_headers_footers, 
    generate_preauthenticated_url,
    get_entities_for_bulk_upload,
    get_embedding_for_text,
    file_to_text,
    insert_into_ai_meta_data_collection,
    call_create_schedule_api,
    insert_into_audit_template_collection,
    insert_into_question_collection,
    download_file_from_oci,
    decode_oci_config,
)
from services.audit import generate_ai_audit_report_summary
from services.hira import (
    insert_into_milvus_hira_collection, 
    search_hira, 
    search_by_risk_analysis,
    search_by_risk_analysis_new,
    )
from services.rabbit_queues import process_file, process_image, generate_checklist_from_audit_scope,process_docfile
from services.oci_functions import process_audit_schedule
import oci
import base64
import tempfile
# Create a MongoClient
mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))

# Access your database
mongo_db = mongo_client["prodle_db"]

# Load environment variables from .env file
load_dotenv()
# Define the maximum number of threads in the pool
MAX_WORKERS = 5

folder_path = os.getenv("FOLDER_PATH")
server_url = os.getenv("SERVER_URL")
app = Flask(__name__)
CORS(app, origins="*")

config = oci.config.from_file()  # or use from_environment()
object_storage_client = oci.object_storage.ObjectStorageClient(config)
namespace = object_storage_client.get_namespace().data
bucket_name = os.getenv("OCI_BUCKET_NAME")
region = config["region"]

# Define the path to the prompts.json file
PROMPTS_FILE_PATH = '../py_prompts/prompts.json'


def insert_into_ai_meta_data_collection(record):
    ai_meta_data_collection = mongo_db["aimetadatas"]
    print("record in insert_into_ai_meta_data_collection", ai_meta_data_collection)
    ai_meta_data_collection.insert_one(record)


@app.post('/pyapi/chat')
def login_post():
    # print("request json", request.json)
    body = request.json
    # print("body", body)

    try:
        # Call the query function
        response = query(body)
        # print("response from query function", response)

        # Ensure the response is a JSON object
        if isinstance(response, str):
            # Convert JSON string to Python dictionary
            response_data = json.loads(response)
            return jsonify(response_data)
        else:
            # Log unexpected response type
            print("Unexpected response type:", type(response))
            return jsonify({"error": "Invalid response type"}), 500
    except Exception as e:
        # Handle any exceptions
        print("Error in /pyapi/chat endpoint:", str(e))
        return jsonify({"error": "Internal server error"}), 500


@app.post('/pyapi/search')
def search():
    print("request json", request.json)
    body = request.json
    print("body", body)
    # query_str = body["query"]
    response = semantic_search(body)
    # print("response from query function", response)
    # data = {
    #     "response": json.loads(response)
    # }
    return jsonify({"response": response})

@app.post('/pyapi/getDocWithIds')
def getDocWithIds():
    print("request json", request.json)
    body = request.json
    print("body", body)
    # query_str = body["query"]
    response = get_docs_by_ids(body)
    # print("response from query function", response)
    # data = {
    #     "response": json.loads(response)
    # }
    return jsonify({"response": response})


@app.route('/pyapi/summary', methods=['POST'])
def summary():
    body = request.json
    print("body", body)
    document_link = body["documentLink"]
    print('server url', server_url)
    org_id = body["orgId"]
    
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    if is_object_store:
        # For object store, download the file to a temporary location
        # print(f"Using object store for summary. Document link: {document_link}")
        try:
            # Download the file to a temporary location
            local_path = download_file_from_oci(document_link, org_id)
            # print(f"Downloaded file from OCI to {local_path}")
            
            # Generate summary using the local file path
            summary = generate_summary_from_doc(local_path, org_id)
            # print("summary", summary)
            
            # Clean up the temporary file
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")
                
            return jsonify({"summary": summary})
        except Exception as e:
            # print(f"Error processing file from object store: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        # For local storage, replace server URL with folder path
        doc_path = document_link.replace(server_url, folder_path)
        # print(f"Using local storage for summary. Document path: {doc_path}")
        
        summary = generate_summary_from_doc(doc_path, org_id)
        # print("summary", summary)
        return jsonify({"summary": summary})

@app.route('/pyapi/tags', methods=['POST'])
def tags():
    body = request.json
    # print("body", body)
    document_link = body["documentLink"]
    # print('server url', server_url)
    org_id = body["orgId"]
    
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    if is_object_store:
        # For object store, download the file to a temporary location
        # print(f"Using object store for tags. Document link: {document_link}")
        try:
            # Download the file to a temporary location
            local_path = download_file_from_oci(document_link, org_id)
            # print(f"Downloaded file from OCI to {local_path}")
            
            # Generate tags using the local file path
            tags = generate_tags_from_doc(local_path, org_id)
            # print("tags", tags)
            
            # Clean up the temporary file
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")
                
            return jsonify({"tags": tags})
        except Exception as e:
            # print(f"Error processing file from object store: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        # For local storage, replace server URL with folder path
        doc_path = document_link.replace(server_url, folder_path)
        # print(f"Using local storage for tags. Document path: {doc_path}")
        
        tags = generate_tags_from_doc(doc_path, org_id)
        # print("tags", tags)
        return jsonify({"tags": tags})


@app.route('/pyapi/mcq', methods=['POST'])
def document_mcq():
    body = request.json
    # print("body", body)
    document_link = body["documentLink"]
    org_id = body["orgId"]
    
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    if is_object_store:
        # For object store, download the file to a temporary location
        # print(f"Using object store for MCQ. Document link: {document_link}")
        try:
            # Download the file to a temporary location
            local_path = download_file_from_oci(document_link, org_id)
            # print(f"Downloaded file from OCI to {local_path}")
            
            # Generate MCQ using the local file path
            mcq = generate_mcq(local_path, org_id)
            data = json.loads(mcq)
            # print("mcq", mcq)
            
            # Clean up the temporary file
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")
                
            return jsonify({"mcq": data})
        except Exception as e:
            # print(f"Error processing file from object store: {str(e)}")
            return jsonify({"error": str(e)}), 500
    else:
        # For local storage, replace server URL with folder path
        document_path = document_link.replace(server_url, folder_path)
        # print(f"Using local storage for MCQ. Document path: {document_path}")
        
        mcq = generate_mcq(document_path, org_id)
        data = json.loads(mcq)
        # print("mcq", mcq)
        return jsonify({"mcq": data})


@app.route('/pyapi/template', methods=['POST'])
def create_template():
    realm = request.args.get('realm')
    location_name = request.args.get('locationName')
    org_id = request.args.get('orgId')
    location_name_in_lower_case = location_name.lower()
    form_data = request.get_json()
    
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    # URL of the NestJS service
    nestjs_url = f'{server_url}/api/documents/createDoc?realm={realm}&locationName={location_name}'
    topic = form_data["topic"]
    
    headers = {
        'Content-Type': 'application/json',
        # Forward the Authorization header
        'Authorization': request.headers.get('Authorization'),
    }
    
    destination_path = folder_path + "/" + realm + "/" + location_name_in_lower_case + "/document"
    
    if is_object_store:
        # For object store, use the object name directly
        doc_path = form_data["documentLink"]
        # print(f"Using object store for template. Document path: {doc_path}")
    else:
        # For local storage, replace server URL with folder path
        doc_path = form_data["documentLink"].replace(server_url, folder_path)
        # print(f"Using local storage for template. Document path: {doc_path}")
    
    template_file_path = generate_template_and_topic_content(
        doc_path, destination_path, topic, org_id)
    print("template_file path -->", template_file_path)
    
    # If using object store, upload the generated template to OCI
    if is_object_store:
        try:
            # Get the local file path from the template_file_path
            local_file_path = os.path.join(destination_path, template_file_path)
            # print(f"Local file path for template: {local_file_path}")
            
            # Create object name following NestJS convention
            if org_id == "master":
                org_path = f"Master/{org_id}/"
            else:
                org_path = f"{org_id}/"
                
            object_name = f"{org_path}{location_name}/{template_file_path}"
            # print(f"Object name for template: {object_name}")
            
            # Get OCI configuration
            oci_config_raw = get_oci_config_from_objectstore(org_id)
            
            # Use the utility function to decode OCI config
            oci_config, namespace, bucket_name, key_file_path = decode_oci_config(oci_config_raw)
            
            # Upload file to OCI
            oci_client = oci.object_storage.ObjectStorageClient(oci_config)
            
            # Read the file content
            with open(local_file_path, 'rb') as file:
                file_content = file.read()
            
            oci_client.put_object(
                namespace_name=namespace,
                bucket_name=bucket_name,
                object_name=object_name,
                put_object_body=file_content
            )
            
            # Clean up the temporary key file
            try:
                os.unlink(key_file_path)
            except Exception as e:
                print(f"Error removing temporary key file: {str(e)}")
            
            # print(f"Uploaded template {object_name} to bucket '{bucket_name}'")
            
            # Use the object name as the document link
            template_file_path = object_name
            # print(f"Using object name as document link: {template_file_path}")
            
        except Exception as e:
            print(f"Error uploading template to object store: {str(e)}")
            # Continue with the local file path if upload fails
    
    response = requests.post(nestjs_url, json={
        **form_data, "documentLink": template_file_path}, headers=headers)
    print("nestjs api response----->", response)
    
    return jsonify(response.json()), response.status_code

@app.route('/pyapi/documents/directCreate', methods=['POST'])
def direct_create():
    try:
        realm = request.args.get('realm')
        file = request.files['file']
        file_store_path = folder_path + "/" + realm
        file_store_path_py = file_store_path + "/directCreate"
        print(file_store_path)

        if not os.path.exists(file_store_path_py):
            os.makedirs(file_store_path_py)

        if file:
            # Save the file to the specified directory
            filename = str(uuid.uuid4()) + '.docx'
            file_path = os.path.join(file_store_path_py, filename)
            file.save(file_path)

            content = preprocess_docx(file_path)
            entities = get_entities(content)
            entities_obj = json.loads(entities, object_hook=lambda d: SimpleNamespace(**d))
            location = entities_obj.location
            
            doc = docx.Document(file_path)
            remove_headers_footers(doc)

            # Save the modified DOCX file
            modified_file_store_path = file_store_path + "/" + location + "/document"
            modified_file_path = os.path.join(modified_file_store_path, filename)
            doc.save(modified_file_path)
            actual_file_path = server_url + "/" + realm + "/" + location + "/document/" + filename

            return jsonify({"message": "File successfully uploaded", "entities": entities, "filePath": actual_file_path}), 200
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500


@app.route('/pyapi/capaDtlsToVB', methods=['POST'])
def capaDtlsToVB():
    body = request.json
    #print("data in body", body)
    
    # Correct indentation
    capa_id = body.get("capaId")
    #print("capa_id",capa_id)
    result = insert_capa_in_milvus_capa_collection(capa_id)
    return result, 200


@app.route('/pyapi/capaSuggestions', methods=['POST'])
def capaSuggestions():
    body = request.json
    suggestions = get_capa_suggestions(body)
    capa_data_list = [suggestion["capa_data"] for suggestion in suggestions]
    return capa_data_list,200

@app.post('/pyapi/chat_capa')
def chat_with_capa():
    # print("request json", request.json)
    body = request.json;
    response = search_capa(body)
    # print("response from chat function", response)
    return jsonify({"data": response})

@app.route('/pyapi/searchCapaInDoc', methods=['POST'])
def searchCapaInDoc():
    body = json.dumps(request.json)
    print("body in /pyapi/searchCapaInDoc", body)
    body = {
        "query": body,
        "top_k": 1
    }
    suggestions = search_capa_in_doc(body)
    return jsonify(suggestions),200

@app.route('/pyapi/capaAISuggestions', methods=['POST'])
def capaAISuggestions():
    body = request.json
    #print("body", body)
    response = generate_capa_ai_suggestions(body["query"])
    return jsonify(response),200


@app.route('/pyapi/clauses', methods=['POST'])
def match_clauses():
    body = request.json
    # print("body", body)
    clauses = body["clauses"]
    document_link = body["documentLink"]
    document_path = document_link.replace(server_url, folder_path)
    response = identify_clauses(document_path, clauses)
    return jsonify({"response": response})


@app.route('/pyapi/agreement-summary', methods=['POST'])
def agreement_summary():
    body = request.json
   
    clause_collection = mongo_db["clauses"]
    # print("CLAUSE COLLECTION", clause_collection)
     # print("CLAUSE COLLECTION", clause_collection)
    print("org id", body["organizationId"])
    clause_record = clause_collection.find({"organizationId" : body["organizationId"], "deleted" : False})
    # print("clause_records===============>>>>>>>>>>>>", clause_record)
    clause_records_list = list(clause_record)
    # print("clause_records===============>>>>>>>>>>>>", clause_records_list)

    # Assuming `records` is your list of JSON objects
    clause_new_array = [{'clauseNumber': item['number'], 'clauseText': item['name'], 'clauseDescription' : item['description']} for item in clause_records_list]
    # print("body", body)
    # clauses = body["clauses"]
    document_link = body["documentLink"]
    document_path = document_link.replace(server_url, folder_path)
    docId = body["docId"]
    # print("doc Path----->", document_path)
    response = identify_clauses_v2_using_claude(document_path, clause_new_array, docId)
    
    return jsonify({"response": response})


@app.route('/pyapi/clause-summary', methods=['POST'])
def get_response():
    body = request.json
    # print("body", body)
    docId = body["docId"]
   
    response = get_response_by_doc_id(docId)
    return jsonify({"response": response})


# API endpoint to update the prompts
@app.route('/pyapi/update-prompts', methods=['POST'])
def update_prompts_api():
    body = request.json
    
    # Ensure that the received body contains the necessary keys
    required_keys = [
        "claude_model_prompt",
        "identify_added_clauses", "json_added_clauses",
        "identify_removed_clauses", "json_removed_clauses",
        "identify_modified_clauses", "json_modified_clauses"
    ]
    
    # Check if all required keys are present in the request
    if not all(key in body for key in required_keys):
        return jsonify({"error": "Missing required prompts"}), 400

    # Call the update function with the received prompts
    update_prompts(body)
    
    return jsonify({"message": "Prompts updated successfully!"})

# API endpoint to fetch all 6 prompts from the prompts.json file
@app.route('/pyapi/get-prompts', methods=['GET'])
def get_prompts_api():
    # Load the current prompts from the JSON file
    with open(PROMPTS_FILE_PATH, 'r') as file:
        prompts = json.load(file)
    
    # Extract only the 'system' text from each prompt to send to the frontend
    response = {
        "claude_model_prompt": prompts.get("claude_model_prompt", {}).get("system", ""),
        "identify_added_clauses": prompts.get("identify_added_clauses", {}).get("system", ""),
        "json_added_clauses": prompts.get("json_added_clauses", {}).get("system", ""),
        "identify_removed_clauses": prompts.get("identify_removed_clauses", {}).get("system", ""),
        "json_removed_clauses": prompts.get("json_removed_clauses", {}).get("system", ""),
        "identify_modified_clauses": prompts.get("identify_modified_clauses", {}).get("system", ""),
        "json_modified_clauses": prompts.get("json_modified_clauses", {}).get("system", "")
    }
    
    return jsonify(response)


@app.route('/pyapi/getdoctype', methods=['POST'])
def getdoctype():
    body = request.json
    print("body in /pyapi/getdoctype", body)
    document_link = body["documentLink"]
    document_path = document_link.replace(server_url, folder_path)
    docType = get_type_of_doc(document_path)
    print("docType", docType)
    return jsonify({"docType": docType})


@app.route('/pyapi/percipereBulkUpload', methods=['POST'])
def percipereBulkUpload():
  

    files = list(request.files.getlist('files'))  # Ensure list, not stream
    body = request.form.to_dict()
    authToken = request.headers.get("Authorization")

    location_id = body.get("locationId")
    entity_id = body.get("entityId")
    created_by = body.get("createdBy")
    orgId = body.get("organizationId")
    locationName = body.get("location")
    realm_name = body.get("realmName", "default")
    docType = body.get("docType", "").strip() or None
    documentState = body.get("documentState", "").strip() or None

    folder_path = os.getenv("FOLDER_PATH")
    server_url = os.getenv("SERVER_URL", "")
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"

    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    success, failed, uploaded_files = [], [], []
    batch_id = str(uuid.uuid4())

    upload_dir = os.path.join(folder_path, realm_name, "bulkUpload")
    os.makedirs(upload_dir, exist_ok=True)

    for file in files:
        original_filename = file.filename
        unique_id = str(uuid.uuid4())
        file_extension = os.path.splitext(original_filename)[1]
        new_file_name = f'{unique_id}{file_extension}'

        try:
            if is_object_store:
                object_name = f'{orgId}/{locationName}/{new_file_name}'

                oci_config_raw = get_oci_config_from_objectstore(orgId)
                oci_config, namespace, bucket_name, key_file_path = decode_oci_config(oci_config_raw)
                oci_client = oci.object_storage.ObjectStorageClient(oci_config)

                file_content = file.read()
                oci_client.put_object(
                    namespace_name=namespace,
                    bucket_name=bucket_name,
                    object_name=object_name,
                    put_object_body=file_content
                )

                try:
                    os.unlink(key_file_path)
                except Exception as e:
                    print(f"Error removing temporary key file: {str(e)}")

                docUrl = f"{server_url}/{object_name}"

            else:
                file_path = os.path.join(upload_dir, new_file_name)
                file.save(file_path)
                docUrl = file_path.replace(folder_path, server_url)

            uploaded_files.append({
                "batchId": batch_id,
                "organizationId": orgId,
                "status": "pending",
                "file_extension": file_extension,
                "new_file_name": new_file_name,
                "file_path": object_name if is_object_store else file_path,
                "docUrl": docUrl,
                "type": "Bulk Upload Docs",
                "fileName":original_filename,
                "createdBy": created_by
            })

            file.seek(0)
            file_bytes = file.read()

            # ✅ Fire background job (non-blocking)
            process_docfile.delay(
                file_bytes,
                original_filename,
                location_id=location_id,
                entity_id=entity_id,
                created_by=created_by,
                orgId=orgId,
                docUrl=docUrl,
                batch_id=batch_id,
                authToken=authToken,
                docType=docType,
                documentState=documentState
                )

            success.append({"file": original_filename, "status": "processing"})

        except Exception as e:
            failed.append({
                "file": original_filename,
                "reason": str(e)
            })

    # ✅ Create document process metadata only once
    try:
        bulk_create_status_response = requests.post(
            f"{server_url}/api/documents/bulkCreateDocProcesses",
            json=uploaded_files,
            headers={'Authorization': authToken}
        )
        if not bulk_create_status_response.ok:
            raise Exception(f"Bulk process creation failed with status: {bulk_create_status_response.status_code}")
    except Exception as e:
        return jsonify({"error": "Failed to save upload metadata", "details": str(e)}), 500

    # ✅ Report files
    report_files = {}

    if failed:
        failed_report_path = os.path.join(upload_dir, "failed_report.txt")
        with open(failed_report_path, "w") as f:
            for entry in failed:
                f.write(f"File: {entry['file']}\nReason: {entry['reason']}\n{'-'*40}\n")
        report_files["failure_report"] = failed_report_path.replace(folder_path, server_url)

    return jsonify({
        "uploaded": success,
        "failed": failed,
        **report_files
    })


@app.route('/pyapi/bulkUpload', methods=['POST'])
def bulkUpload():
    try:
        form_data = request.form
        files = request.files.getlist("files")
        authToken = request.headers.get("Authorization")
        realmName = form_data.get("realmName")
        locationName = form_data.get("location")
        org_id = form_data.get("organizationId")
        folder_path = os.getenv("FOLDER_PATH")
        
        if not files:
            return {"status": "error", "message": "No files provided"}
        
        if not authToken:
            return {"status": "error", "message": "Authorization token is required"}
        
        if not realmName:
            return {"status": "error", "message": "Realm name is required"}
        
        if not locationName:
            return {"status": "error", "message": "Location name is required"}
        
        if not org_id:
            return {"status": "error", "message": "Organization ID is required"}
        
        # Check if we're using object store
        is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
        # print("is_object_store", is_object_store)
        uploaded_files = []
        batch_id = str(uuid.uuid4())

        for file in files:
            file_name = file.filename
            unique_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file_name)[1]
            new_file_name = f'{unique_id}{file_extension}'
            
            if is_object_store:
                # Object store logic
                object_name = f'{org_id}/{locationName}/{new_file_name}'
                # print("object_name", object_name)
                
                # Get OCI configuration from objectstores collection
                oci_config_raw = get_oci_config_from_objectstore(org_id)
                # print("oci_config_raw", oci_config_raw)
                
                # Use the utility function to decode OCI config
                oci_config, namespace, bucket_name, key_file_path = decode_oci_config(oci_config_raw)
                
                # Upload file to OCI
                oci_client = oci.object_storage.ObjectStorageClient(oci_config)
                
                # Read the file content directly from the FileStorage object
                file_content = file.read()
                
                oci_client.put_object(
                    namespace_name=namespace,
                    bucket_name=bucket_name,
                    object_name=object_name,
                    put_object_body=file_content
                )
                
                # Clean up the temporary key file
                try:
                    os.unlink(key_file_path)
                except Exception as e:
                    print(f"Error removing temporary key file: {str(e)}")

                uploaded_files.append({
                    "batchId": batch_id,
                    "organizationId": org_id,
                    "status": "pending",
                    "file_extension": file_extension,
                    "new_file_name": new_file_name,
                    "file_path": object_name,
                    "docUrl": object_name,  # Use object name instead of preauthenticated URL
                    "type": "Bulk Upload Docs",
                    "createdBy": form_data.get("createdBy")
                })
                # print("uploaded_files", uploaded_files)
                # Process file in background
                process_file.delay(
                    file_path=object_name,
                    form_data=dict(form_data),
                    authToken=authToken,
                    batchId=batch_id,
                    docUrl=object_name,  # Store object name instead of preauthenticated URL
                    realm=realmName
                )
            else:
                # Original local file storage logic
                file_path = f'{folder_path}/{realmName}/bulkUpload/{new_file_name}'
                file.save(file_path)
                # print("file_path", file_path)
                uploaded_files.append({
                    "batchId": batch_id,
                    "organizationId": org_id,
                    "status": "pending",
                    "file_extension": file_extension,
                    "new_file_name": new_file_name,
                    "file_path": file_path,
                    "docUrl": file_path.replace(folder_path, server_url),
                    "type": "Bulk Upload Docs",
                    "createdBy": form_data.get("createdBy")
                })
                # print("uploaded_files", uploaded_files)
                # Process file in background
                process_file.delay(
                    file_path=file_path,
                    form_data=dict(form_data),
                    authToken=authToken,
                    batchId=batch_id,
                    docUrl=file_path.replace(folder_path, server_url),
                    realm=realmName
                )
        
        # Create bulk process status
        bulk_create_status_response = requests.post(
            f"{server_url}/api/documents/bulkCreateDocProcesses", 
            json=uploaded_files, 
            headers={'Authorization': authToken}
        )
        
        return {
            "status": "success",
            "message": "Files uploaded successfully",
            "files": uploaded_files,
            "batchId": batch_id
        }
    except Exception as e:
        print(f"Error in bulkUpload: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.route('/pyapi/bulkUploadImages', methods=['POST'])
def bulkUploadImages():
    try:
        files = request.files.getlist('files')
        body = request.form.to_dict()
        folder_path = os.getenv("FOLDER_PATH")
        realmName = body.get("realmName")
        locationName = body.get("location")
        authToken = request.headers.get('Authorization')
        batch_id = str(uuid.uuid4())
        org_id = body.get("organizationId")
        
        if not files:
            return {"status": "error", "message": "No files provided"}
        
        if not authToken:
            return {"status": "error", "message": "Authorization token is required"}
        
        if not realmName:
            return {"status": "error", "message": "Realm name is required"}
        
        if not locationName:
            return {"status": "error", "message": "Location name is required"}
        
        if not org_id:
            return {"status": "error", "message": "Organization ID is required"}
        
        # Check if we're using object store
        is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
        
        # Array to hold the new file paths and metadata
        uploaded_files = []
        doc_type_details = getFirstDocTypeInOrg(org_id, authToken)
        
        # First loop: Create new file names and paths, and save files
        for idx, file in enumerate(files):
            unique_id = str(uuid.uuid4())
            file_extension = os.path.splitext(file.filename)[1]
            original_filename = file.filename.replace(" ", "")
            new_file_name = f'{unique_id}-{original_filename}'
            
            if is_object_store:
                # Create object name following NestJS convention
                if org_id == "master":
                    org_path = f"Master/{org_id}/"
                else:
                    org_path = f"{org_id}/"
                    
                object_name = f"{org_path}{locationName}/{new_file_name}"
                
                # Get OCI configuration
                oci_config_raw = get_oci_config_from_objectstore(org_id)
                
                # Use the utility function to decode OCI config
                oci_config, namespace, bucket_name, key_file_path = decode_oci_config(oci_config_raw)
                
                # Upload file to OCI
                oci_client = oci.object_storage.ObjectStorageClient(oci_config)
                
                # Read the file content directly from the FileStorage object
                file_content = file.read()
                
                oci_client.put_object(
                    namespace_name=namespace,
                    bucket_name=bucket_name,
                    object_name=object_name,
                    put_object_body=file_content
                )
                
                # Clean up the temporary key file
                try:
                    os.unlink(key_file_path)
                except Exception as e:
                    print(f"Error removing temporary key file: {str(e)}")
                
                # print(f"Uploaded {object_name} to bucket '{bucket_name}'")
                
                try:
                    head_resp = oci_client.head_object(
                        namespace_name=namespace,
                        bucket_name=bucket_name,
                        object_name=object_name
                    )
                    # print(f"File '{object_name}' is present in OCI. Size: {head_resp.headers.get('content-length')} bytes")
                except Exception as e:
                    print(f"Failed to verify upload of {object_name}: {e}")

                # Add to uploaded files
                uploaded_files.append({
                    "batchId": batch_id,
                    "organizationId": org_id,
                    "status": "pending",
                    "file_extension": file_extension,
                    "new_file_name": new_file_name,
                    "file_path": object_name,
                    "docUrl": object_name,  # Use object name instead of preauthenticated URL
                    "type": "Bulk Upload Images",
                    "createdBy": body.get("createdBy")
                })
                
                # Process image in background
                process_image.delay(object_name, body, authToken, batch_id, object_name, doc_type_details)
            else:
                # Original local file storage logic
                file_path = f'{folder_path}/{realmName}/bulkUpload/{new_file_name}'
                file.save(file_path)
                
                
                # Add to uploaded files
                uploaded_files.append({
                    "batchId": batch_id,
                    "organizationId": org_id,
                    "status": "pending",
                    "file_extension": file_extension,
                    "new_file_name": new_file_name,
                    "file_path": file_path,
                    "docUrl": file_path.replace(folder_path, server_url),
                    "type": "Bulk Upload Images",
                    "createdBy": body.get("createdBy")
                })
                
                # Process image in background
                process_image.delay(file_path, body, authToken, batch_id, file_path.replace(folder_path, server_url), doc_type_details)
        
        # Create bulk process status
        bulk_create_status_response = requests.post(
            f"{server_url}/api/documents/bulkCreateDocProcesses", 
            json=uploaded_files, 
            headers={'Authorization': authToken}
        )
        
        return {
            "status": "success",
            "message": "Files are being processed",
            "batchId": batch_id
        }
    except Exception as e:
        print(f"Error in bulkUploadImages: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.route('/pyapi/getAIAuditReportSummary', methods=['POST'])
def getAIAuditReportSummary():
    body = request.json
    response = generate_ai_audit_report_summary(body["query"])
    return jsonify(response),200

@app.route('/pyapi/generate_checklist', methods=['POST'])
def generate_checklist():
    body = request.json
    # print("body in /pyapi/generate_checklist", body)
    process_audit_schedule(body)
    return {"message": "Schedule is being created"}, 200


@app.route('/pyapi/addHiraToVectorDb', methods=['POST'])
def add_hira_to_vector_db():
    body = request.json
    # print("body in /pyapi/addHiraToVectorDb", body.get("data"))
    hira_id = body.get("data").get("hiraId")
    insert_into_milvus_hira_collection(hira_id)
    # data = generate_checklist_from_audit_scope.delay(body.get("data"), schedule_data)
    return {"message": "Hira Successfully added to Vector DB"}, 200


@app.post('/pyapi/chat_hira')
def chat_with_hira():
    # print("request json", request.json)
    body = request.json;
    response = search_hira(body)
    # print("response from chat function", response)
    return jsonify({"data": response})

@app.post('/pyapi/chatListOfFinding')
def chat_with_list_of_finding():
    # print("request json", request.json)
    body = request.json;
    response = search_list_of_finding(body)
    # print("response from chat function", response)
    return jsonify({"data": response})


@app.post("/pyapi/risk_analysis")
def risk_analysis():
    body = request.json
    risk_categories = body.get("riskCategories", [])

    risk_categories = [
        category["categoryName"].lower()
        for category in risk_categories
        if "categoryName" in category
    ]
    org_id = body.get("orgId")

    response = search_by_risk_analysis_new(body["query"], risk_categories, org_id)
    return jsonify({"data": response})


@app.route('/pyapi/systemDtlsToVB', methods=['POST'])
def systemDtlsToVB():
    body = request.json
    print("data in body", body)
    
    result = insert_system_in_milvus_system_collection(body)
    return result, 200

@app.route('/pyapi/clauseDtlsToVB', methods=['POST'])
def clauseDtlsToVB():
    body = request.json
    print("data in body", body)
    
    # Correct indentation
    result = insert_clause_in_milvus_clause_collection(body)
    return result, 200

@app.route('/pyapi/getSimilarCapas', methods=['POST'])
def getSimilarCapas():
    body = request.json
    if not body or "query" not in body:
        return jsonify({"error": "Missing 'query' in request body"}), 400

    try:
        results = search_similar_capas_milvus(body)
        return jsonify(results), 200
    except Exception as e:
        print("Error during search:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
     # Initialize database and collections (only if necessary)
    print("Checking and initializing database...")
    initialize_database_and_collections()

    # Start your main application logic
    print("Starting the main application...")
    app.run(debug=True, port=5001)
