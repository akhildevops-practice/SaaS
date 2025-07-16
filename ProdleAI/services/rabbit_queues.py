import os
import json
import requests
import io
from pymilvus import Collection
from openai import OpenAI as org_opeani
from dateutil import parser as date_parser
from dotenv import load_dotenv
from pymongo import MongoClient
from ai_models import OpenaiModel
from datetime import datetime
from services.utils import (
    preprocess_docx,
    get_entities_for_bulk_upload,
    get_embedding_for_text,
    file_to_text,
    insert_into_ai_meta_data_collection,
    call_create_schedule_api,
    insert_into_audit_template_collection,
    insert_into_question_collection,
    download_file_from_oci,
    generate_preauthenticated_url,
    get_oci_config_from_objectstore,
)
from services.doc import(
   extract_text_from_docx,extract_text_from_pdf,extract_text_from_excel,infer_title_from_filename,extract_metadata,extract_issue_date,get_doctype_id,
)
from prompt_templates.templates import audit_checklist_prompt
from database.milvus_insert import insert_into_milvus_doc_collection
from database.connection import connect_to_milvus, use_database
from services.doc import generate_mcq, generate_summary_for_drawing, generate_summary_from_doc, generate_tags_from_doc, generate_tags_from_drawing
from .conf import celery
from database.settings import DEFAULT_DB_NAME
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
server_url = os.getenv("SERVER_URL")
is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"

mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))


db = mongo_client["prodle_db"]
documents_collection = db["documents"]
doctypes_collection = db["doctypes"]
def get_sop_by_audit_scope(audit_scope, body):
    #convert audit_scope text to embedding
    connect_to_milvus()
    use_database(DEFAULT_DB_NAME)
    audit_scope_embedding = get_embedding_for_text(audit_scope)
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

    top_k = 1  # Only retrieve the top result
    search_params = {
        "metric_type": "IP",  # Inner Product for cosine similarity
        "params": {"nprobe": 10}
    }

    # Build dynamic filters using metadata
    filters = []
    metadata_keys = ["locationName", "entityName"]  # Metadata fields to filter
    for key in metadata_keys:
        if key in body:
            filters.append(f"metadata['{key}'] == '{body[key]}'")

    filter_expr = " and ".join(filters) if filters else ""
    print("filters ==", filter_expr)
    print("searching milvus...")
    results = collection.search(
        data=[audit_scope_embedding],
        anns_field="doc_embedding",
        param=search_params,
        limit=top_k,
        output_fields=["doc_id", "doc_chunk", "metadata"],  # Include metadata in output
        expr=filter_expr
    )

    # print("result in get sop by audit scope", results)
    return results

def get_hira_by_audit_scope(audit_scope, body):
    """
    Fetch relevant HIRA entries from Milvus based on the audit scope.
    """
    connect_to_milvus()
    use_database(DEFAULT_DB_NAME)
    audit_scope_embedding = get_embedding_for_text(audit_scope)
    collection_name = "hira_collection"
    collection = Collection(name=collection_name)

    # Check if the collection has an index; if not, create one
    if not collection.has_index():
        index_params = {
            "index_type": "IVF_FLAT",
            "metric_type": "IP",
            "params": {"nlist": 128}
        }
        collection.create_index(field_name="step_embedding", index_params=index_params)

    # Load the collection into memory
    collection.load()

    top_k = 1
    search_params = {
        "metric_type": "IP",
        "params": {"nprobe": 10}
    }

    # Build filters using metadata
    filters = []
    metadata_keys = ["locationName", "entityName"]
    for key in metadata_keys:
        if key in body:
            filters.append(f"metadata['{key}'] == '{body[key]}'")

    filter_expr = " and ".join(filters) if filters else ""
    print("Filters for HIRA search:", filter_expr)
    print("Searching Milvus for HIRA entries...")
    results = collection.search(
        data=[audit_scope_embedding],
        anns_field="step_embedding",
        param=search_params,
        limit=top_k,
        output_fields=["step_description", "metadata"],
        expr=filter_expr
    )

    return results


@celery.task(queue='doc_queue')
def process_file(file_path, form_data, authToken, batchId, docUrl, realm):
    """
    Process a file from OCI object storage.
    
    Args:
        file_path: The path of the file in OCI
        form_data: Form data for the document
        authToken: Authentication token
        batchId: Batch ID for the document
        docUrl: The object name in OCI
        realm: Realm name
    """
    try:
        if any(key.startswith('system[') for key in form_data):
            system_keys = [key for key in form_data if key.startswith('system[')]
            system_values = [form_data[key] for key in system_keys]

            # Creating new dictionary with 'system' as an array
            converted_data = {
                'system': system_values,
                **{k: v for k, v in form_data.items() if not k.startswith('system[')}
            }
        else:
            converted_data = form_data
        
        # print("file path in process file", file_path)
        # Download the file from OCI to a temporary location
        if is_object_store:
            local_path = download_file_from_oci(file_path)
        else:
            local_path = file_path
        print("local path in process file", local_path)
        print("doc url in process file", docUrl)
        header_footer_content = ""
        content = ""
        main_content = file_to_text(local_path)
        if(local_path.endswith('.pdf')):
            content = main_content
        else:
            header_footer_content = preprocess_docx(local_path)
            content = header_footer_content + main_content
        
        entities = get_entities_for_bulk_upload(content, converted_data)
        data = json.loads(entities)
        for key, value in converted_data.items():
            if key in data:
                data[key] = value
        nestjs_url = f"{server_url}/api/doctype/getDocTypeByName?docType={data.get('document_type')}&location={data.get('location')}&department={data.get('department')}&section={data.get('section')}"
        headers = {
            'Content-Type': 'application/json',
            # Forward the Authorization header
            'Authorization': authToken,
        }
        response = requests.get(nestjs_url, headers=headers)
        if response.status_code == 200 and response.json().get('finalResult'):
            final_result = response.json().get('finalResult')
            data.setdefault("system", final_result.get("systems"))

            # Create the data dictionary
            create_data = {
                "documentName": data.get("document_title") if data.get("document_title") else "Untitled Upload Document",
                "documentState": converted_data.get("documentState", "DRAFT"),
                "doctypeId": final_result.get("data").get("_id"),
                "organizationId": form_data.get("organizationId"),
                "locationId": form_data.get("locationId"),
                "entityId": form_data.get("entityId"),
                "systems": document_systems,
                "documentNumbering": "",
                "reasonOfCreation": "Bulk Upload Document",
                "documentLink": docUrl,
                "approvers": [],
                "reviewers": [],
                "distributionList": {
                    "type": final_result.get("data").get("docDistributionList", "None"),
                    "ids": final_result.get("data").get("docDistributionListIds", [])
                },
                "readAccess": {
                    "type": final_result.get("data").get("docReadAccess", "All Users"),
                    "ids": final_result.get("data").get("docReadAccessIds", [])
                },          # optional if still used elsewhere
                "issueNumber": "",
                "documentState": "DRAFT",
                "createdBy": form_data.get("createdBy"),
            }

            # Convert the create_data dictionary to form-data
            form = requests.models.RequestEncodingMixin._encode_params(create_data)

            # Make a POST request to create the document
            create_doc_url = f"{server_url}/api/documents/createdoc?realm={realm}&locationName={data.get('location')}"
            create_doc_response = requests.post(create_doc_url, json={**create_data}, headers=headers)
            # print("create_doc_response", create_doc_response.status_code)

            # Check if the document creation was successful
            if create_doc_response.status_code == 200 or create_doc_response.status_code == 201:
                # print("created doc json response in bulk upload process file-->", create_doc_response.json())
                document_id =  create_doc_response.json().get("_id")
                org_id = create_doc_response.json().get('document', {}).get("organizationId")
                # concepts = generate_tags_from_doc(local_path, org_id)
                # doc_summary = generate_summary_from_doc(local_path, org_id)
                # doc_mcq = generate_mcq(local_path, org_id)
                # # Check if `doc_mcq` is a string and contains ```json
                # if isinstance(doc_mcq, str) and "```json" in doc_mcq:
                #     # Strip the ```json and trailing backticks, then load it as JSON
                #     doc_mcq_cleaned = doc_mcq.strip('```json').rstrip('```')
                #     doc_mcq_json = json.loads(doc_mcq_cleaned)
                # else:
                #     # Directly load `doc_mcq` as JSON if it's already formatted correctly
                #     doc_mcq_json = json.loads(doc_mcq)

                # # Print the loaded JSON
                # print("doc_mcq_json in file process pdf docx ----->", doc_mcq_json)
                # print("concepts in file process pdf docx ----->", concepts)
                # meta_body = {"organizationId": org_id,
                #             "documentId": document_id, "metadata": concepts, "docSummary" : doc_summary, "docMCQ": doc_mcq_json}
                
                print("creating record in milvus database")
                data_to_insert = {
                    "doc_id": document_id,
                    "doc_link": create_data.get("documentLink"),
                    "documentName": create_data.get("documentName"),
                    "_id" : document_id,
                    "organizationId": org_id,
                    "locationName": create_data.get("locationName"),
                    "entityName": create_data.get("entityName"),
                    "documentLink": create_data.get("documentLink"),
                }
                insert_into_milvus_doc_collection(data_to_insert)
                # print("creating record into ai_meta_data_collection docx pdf")
                # insert_into_ai_meta_data_collection(meta_body)
                print("Document created successfully")
            else:
                print("Failed to create document:", create_doc_response.text)
        else:
            print("Failed to retrieve document type details:", response.text)
            
            nestjs_url = f"{server_url}/api/doctype/getFirstDocType/{form_data['organizationId']}"
            headers = {
            'Content-Type': 'application/json',
            # Forward the Authorization header
            'Authorization': authToken,
            }
            response = requests.get(nestjs_url, headers=headers)
            if response.status_code == 200:
                # Print the entire response body
                try:
                    # Try to print as JSON if applicable
                    print("DOC TYPE RESPONSE JSON----->>", response.json())
                except ValueError:
                    # If the response is not JSON, print the raw text
                    print("DOC TYPE RESPONSE TEXT----->>", response.text)
                final_result = response.json()
                print("final_result in bulk upload doc in last else part---->>>>", final_result.get("data"))
                # Extract the list of IDs from applicable_systems
                document_systems =  converted_data.get("system", [system['id'] for system in final_result.get('applicable_systems', [])]) 
                # print("document_systems in bulk upload doc in last else part---->>>>", document_systems)
                print("url uin else ", docUrl)
                # Create the data dictionary
                create_data = {
                    "documentName": data.get("document_title") if data.get("document_title") else "Untitled Upload Document",
                    "documentState": converted_data.get("documentState", "DRAFT"),
                    "doctypeId": final_result.get("data").get("_id"),
                    "organizationId": form_data.get("organizationId"),
                    "locationId": form_data.get("locationId"),
                    "entityId": form_data.get("entityId"),
                    "systems": document_systems,
                   "documentNumbering": "",
                    "reasonOfCreation": "Bulk Upload Document",
                    "documentLink": docUrl,
                    "approvers": [],
                    "reviewers": [],
                    "distributionList": {
                        "type": final_result.get("data").get("docDistributionList", "None"),
                        "ids": final_result.get("data").get("docDistributionListIds", [])
                    },
                    "readAccess": {
                        "type": final_result.get("data").get("docReadAccess", "All Users"),
                        "ids": final_result.get("data").get("docReadAccessIds", [])
                    },          # optional if still used elsewhere
                    "issueNumber": "",
                    "documentState": "DRAFT",
                    "createdBy": form_data.get("createdBy"),
                }

                print("create_data in bulk upload doc in last else part---->>>>", create_data)
                # Convert the create_data dictionary to form-data
                form = requests.models.RequestEncodingMixin._encode_params(create_data)

                # Make a POST request to create the document
                create_doc_url = f"{server_url}/api/documents/createdoc?realm=him&locationName={data.get('location')}"
                create_doc_response = requests.post(create_doc_url, json={**create_data}, headers=headers)
                print("create_doc_response", create_doc_response.status_code)

                # Check if the document creation was successful
                if create_doc_response.status_code == 200 or create_doc_response.status_code == 201:
                    print("created doc json response in bulk upload process file-->", create_doc_response.json())
                    document_id =  create_doc_response.json().get("_id")
                    org_id = create_doc_response.json().get('document', {}).get("organizationId")
                    # concepts = generate_tags_from_doc(local_path, org_id)
                    # doc_summary = generate_summary_from_doc(local_path, org_id)
                    # doc_mcq = generate_mcq(local_path, org_id)
                    # if isinstance(doc_mcq, str) and "```json" in doc_mcq:
                    # # Strip the ```json and trailing backticks, then load it as JSON
                    #     doc_mcq_cleaned = doc_mcq.strip('```json').rstrip('```')
                    #     doc_mcq_json = json.loads(doc_mcq_cleaned)
                    # else:
                    #     # Directly load `doc_mcq` as JSON if it's already formatted correctly
                    #     doc_mcq_json = json.loads(doc_mcq)
                    # print("doc_mcq_json in file process pdf docx ----->", doc_mcq_json)
                    # print("concepts in file process pdf docx ----->", concepts)
                    # meta_body = {"organizationId": org_id,
                    #             "documentId": document_id, "metadata": concepts, "docSummary" : doc_summary, "docMCQ": doc_mcq_json}
                    # print("creating record into ai_meta_data_collection docx pdf")
                    # insert_into_ai_meta_data_collection(meta_body)
                    print("Document created successfully")
                else:
                    print("Failed to create document:", create_doc_response.text)
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        # You could add additional error handling here, such as logging to a file or sending notifications
        raise  # Re-raise the exception to ensure Celery knows the task failed
    finally:
        # Cleanup code that should run regardless of success or failure
        if local_path and os.path.exists(local_path) and is_object_store:
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")
        
        print(f"File processing completed for {file_path}")
        # You could add additional cleanup code here if needed


@celery.task(queue='image_queue')
def process_image(file_path, form_data, authToken, batchId, docUrl, doc_type_details):
    print("file_path in process image", file_path)
    print("docUrl in process image", docUrl)
    local_path = None
    try:
        if any(key.startswith('system[') for key in form_data):
            system_keys = [key for key in form_data if key.startswith('system[')]
            system_values = [form_data[key] for key in system_keys]

            # Creating new dictionary with 'system' as an array
            converted_data = {
                'system': system_values,
                **{k: v for k, v in form_data.items() if not k.startswith('system[')}
            }
        else:
            converted_data = form_data
        headers = {
            'Content-Type': 'application/json',
            # Forward the Authorization header
            'Authorization': authToken,
        }
        # response = requests.get(nestjs_url, headers=headers)
        if doc_type_details.get("data").get("_id"):
            # Check if we're using object store
            is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"

            if is_object_store:
                # For object store, we need to download the file first
                object_name = file_path
                org_id = form_data["organizationId"]

                # Get OCI configuration
                oci_config = get_oci_config_from_objectstore(org_id)

                # Download the file to a temporary location
                local_path = download_file_from_oci(object_name)
                print(f"Downloaded file from OCI to {local_path}")

                # Process the image
                drawing_concepts = generate_tags_from_drawing(local_path, org_id)
                drawing_summary = generate_summary_for_drawing(local_path, org_id)
            else:
                # Original local file storage logic
                local_path = file_path
                drawing_concepts = generate_tags_from_drawing(local_path, form_data["organizationId"])
                drawing_summary = generate_summary_for_drawing(local_path, form_data["organizationId"])

            concepts_json = json.loads(drawing_concepts)
            generated_document_name_from_concepts = concepts_json.get("Title", concepts_json.get("title"))

            # Use the object name for documentLink when using object store
            if is_object_store:
                document_link = object_name
            else:
                document_link = docUrl  # Use the docUrl directly for local storage

            document_systems = converted_data.get(
                "system",
                [
                    system["id"]
                    for system in doc_type_details.get("applicable_systems", [])
                ],
            )
            print("FINAL DATA DOCTYPE IN PROCESS IMAGE-->", doc_type_details)
            # Create the data dictionary
            create_data = {
                "documentName": generated_document_name_from_concepts,
                "documentState": converted_data.get("documentState", "DRAFT"),
                "doctypeId": doc_type_details.get("data").get("_id"),
                "locationId": form_data.get("locationId"),
                "entityId": form_data.get("entityId"),
                "organizationId": form_data.get("organizationId"),
                "systems": document_systems,
                "documentNumbering": "",
                "reasonOfCreation": "Bulk Upload Images",
                "documentLink": docUrl,
                "approvers": [],
                "reviewers": [],
                "distributionList": {
                    "type": doc_type_details.get("data").get(
                        "docDistributionList"
                    ),
                    "ids": doc_type_details.get("data").get(
                        "docDistributionListIds"
                    ),
                },
                "readAccess": {
                    "type": doc_type_details.get("data").get(
                        "docReadAccess", "All Users"
                    ),
                    "ids": doc_type_details.get("data").get("docReadAccessIds", []),
                },
                "issueNumber": "",
                "documentState": "DRAFT",
                "createdBy": form_data.get("createdBy"),
            }
            print("FINAL CREATE DATA IN PROCESS IMAGE-->", create_data)
            create_doc_url = f"{server_url}/api/documents/createdoc?realm=him&locationName={form_data.get('location')}"
            create_doc_response = requests.post(create_doc_url, json={**create_data}, headers=headers)
            print("DOC CREATED success ---===>>", create_doc_response.status_code)
            print("CREATED DOC RESPOSNE JSON IMAGE ----->>", create_doc_response.json())
            
            created_doc_id = create_doc_response.json().get("_id")

            # Check if the document creation was successful
            if create_doc_response.status_code == 200 or create_doc_response.status_code == 201:
                meta_body = {"organizationId": form_data["organizationId"], "documentId": created_doc_id, "metadataDrawing": drawing_concepts, "drawingSummary": drawing_summary}
                insert_into_ai_meta_data_collection(meta_body)
                print("Document created successfully")
                update_flag_data = {
                    "batchId": batchId,
                    "docUrl": docUrl,
                    "status": "completed",
                    "isFailed" : False,
                }
                update_flag_response = requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)
                print("update_flag_response status when DOC  CREATED----->", update_flag_response.status_code)
                print("update response text -----> when DOC  CREATED", update_flag_response.text)
            else:
                print("Failed to create document:", create_doc_response.text)
                update_flag_data = {
                    "batchId": batchId,
                    "docUrl": docUrl,
                    "status": "completed",
                    "isFailed" : True,
                    "failedReason" : "Error in Document Creation.."
                }
                update_flag_response = requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)
                print("update_flag_response status when DOC CREATION FAILED ----->", update_flag_response.status_code)
                print("update response text when DOC CREATION FAILED----->", update_flag_response.text)
        else:
            print("Failed to retrieve document type details:")
            update_flag_data = {
                "batchId": batchId,
                "docUrl": docUrl,
                "status": "failed",
                "isFailed" : True,
                "failedReason" : "Error in Retrieving Document Type Details.."
            }
            update_flag_response = requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)
            print("update_flag_response status  when DOC type fetching failed----->", update_flag_response.status_code)
            print("update response text  when DOC type fetching failed----->", update_flag_response.text)
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        # You could add additional error handling here, such as logging to a file or sending notifications
        raise  # Re-raise the exception to ensure Celery knows the task failed
    finally:
        # Cleanup code that should run regardless of success or failure
        if local_path and os.path.exists(local_path) and is_object_store:
            try:
                os.remove(local_path)
                print(f"Temporary file {local_path} removed")
            except Exception as e:
                print(f"Error removing temporary file {local_path}: {str(e)}")

        print(f"Image processing completed for {file_path}")
        # You could add additional cleanup code here if needed


@celery.task(queue='checklist_queue')
def generate_checklist_from_audit_scope(payload, schedule_data):
    print("Payload in generate checklist function:", payload)
    print("Schedule data in generate checklist function:", schedule_data)
    connect_to_milvus()
    use_database("prodle_vdb")
    department_template_map = {}
    all_template_ids = []

    for department in payload:
        audit_scope = department["audit_scope"]
        entity_id = department["entity_id"]
        entity_name = department["entity_name"]
        month = department["month"]
        audit_type_name = department["audit_type_name"]
        created_by = department["created_by"]
        org_id = department["org_id"]

        checklist_name = f"{month}-{audit_type_name}-{entity_name}"
        print(f"Processing checklist: {checklist_name} for entity: {entity_name}")

        # Fetch SOPs based on audit scope
        sop_results = get_sop_by_audit_scope(audit_scope, department)
        if not sop_results or not sop_results[0]:
            print(f"No SOP results found for {entity_name}. Skipping...")
            continue

        sop_docs = []
        for result_group in sop_results:
            for result in result_group:
                sop_docs.append({
                    "doc_id": result.entity.get("doc_id"),
                    "doc_chunk": result.entity.get("doc_chunk"),
                    "metadata": result.entity.get("metadata"),
                })

        sop_text = "\n\n".join(
            [f"Document ID: {doc['doc_id']}\nContent: {doc['doc_chunk']}" for doc in sop_docs]
        )

        # Fetch HIRA data based on audit scope
        hira_results = get_hira_by_audit_scope(audit_scope, department)
        hira_text = ""

        if hira_results and hira_results[0]:
            hira_texts = [
                result.entity.get("step_description") for result_group in hira_results for result in result_group
            ]
            # Combine all the HIRA texts into a single string, separated by double newlines
            hira_text = "\n\n".join(hira_texts)

        # Format prompt for OpenAI
        prompt = audit_checklist_prompt.format(
            sop_text=sop_text, hira_text=hira_text, audit_scope=audit_scope
        )

        # Generate checklist from AI
        model = OpenaiModel(
            config={
                "api_key": openai_api_key,
                "model": "gpt-4o",
                "max_tokens": 4000,
                "temperature": 0,
            }
        )
        print(f"Calling OpenAI for {entity_name}...")
        response = model.generate_response(
            system_message="Analyze the context given and return a checklist in JSON format.",
            messages=[prompt],
        )
        print(f"Raw OpenAI response for {entity_name}:", response)

        # Parse the response
        try:
            if isinstance(response, str):
                response = json.loads(response)
            if not isinstance(response, list):
                print(f"Invalid checklist format for {entity_name}. Skipping...")
                continue
        except Exception as e:
            print(f"Error parsing response for {entity_name}: {e}")
            continue

        # Transform checklist into `auditTemplate` format
        sections_map = {}
        for item in response:
            section_title = item["SectionTitle"]
            if section_title not in sections_map:
                sections_map[section_title] = {
                    "title": section_title,
                    "totalScore": 0,
                    "obtainedScore": 0,
                    "fieldset": [],
                }

            question_data = {
                "title": item.get("QuestionTitle", ""),
                "inputType": item.get("Type", "text"),
                "hint": item.get("Hint", ""),
                "slider": item.get("Slider", False),
                "options": [
                    {
                        "name": opt.split(":")[0],
                        "value": int(opt.split(":")[1]),
                        "checked": False,
                    }
                    for opt in item.get("Score", "").split(",")
                    if ":" in opt
                ],
                "score": [
                    {
                        "name": part.split(":")[0],
                        "value": int(part.split(":")[1]),
                        "score": 0,
                    }
                    for part in item.get("Score", "").split(",")
                    if ":" in part
                ],
                # Default fields
                "value": "",
                "questionScore": 0,
                "open": False,
                "required": True,
                "allowImageUpload": True,
                "image": "",
                "imageName": "",
                "nc": {
                    "type": "",
                    "findingTypeId": "",
                    "comment": "",
                    "clause": "",
                    "severity": "",
                    "mainComments": "",
                },
            }

            print("Prepared question data:", question_data)
            # Insert question into the `Question` collection and get its ID
            try:
                question_id = insert_into_question_collection(question_data)
                print(f"Inserted question with ID: {question_id}")
                # Add question ID to the corresponding section's fieldset
                sections_map[section_title]["fieldset"].append(str(question_id))
            except Exception as e:
                print(f"Error inserting question: {e}")

        # Convert sections_map to a list
        sections = list(sections_map.values())
        print("Generated sections:", sections)

        # Prepare final template
        audit_template_data = {
            "title": checklist_name,
            "isDraft": True,
            "status": False,
            "createdBy": created_by,
            "locationName": [{"id": "All", "locationName": "All"}],
            "publishedDate": None,
            "organizationId": org_id,
            "sections": sections,
            "entityId": entity_id,
            "isAiGenerated": True,
        }

        # Insert into `auditTemplate` collection
        print(f"Inserting audit template into MongoDB: {audit_template_data}")
        try:
            template_id = insert_into_audit_template_collection(audit_template_data)
            print(f"Inserted audit template with ID: {template_id}")
            all_template_ids.append(str(template_id))  # Collect all generated template IDs
        except Exception as e:
            print(f"Error inserting audit template: {e}")

        # Map the template ID to the current department (entity ID)
        if entity_id not in department_template_map:
            department_template_map[entity_id] = []
        department_template_map[entity_id].append(str(template_id))

    print("All templates generated successfully.")

    # Update the `auditScheduleEntityWise` section in `schedule_data`
    for entity in schedule_data["auditScheduleEntityWise"]:
        entity["auditTemplates"] = department_template_map.get(entity["entityId"], [])

    # Update the main `auditTemplates` in `schedule_data`
    schedule_data["auditTemplates"] = all_template_ids

    # Call the `call_create_schedule_api` function
    print("Calling create schedule API with updated schedule data...", schedule_data)
    try:
        call_create_schedule_api(schedule_data)
        print("Successfully called create schedule API.")
    except Exception as e:
        print(f"Error calling create schedule API: {e}")

    return True

@celery.task(queue='bulkUpload_queue')
def process_docfile(file_bytes, filename, location_id, entity_id, created_by, orgId, docUrl, batch_id, authToken, docType, documentState):
    try:
        file_obj = io.BytesIO(file_bytes)
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

        metadata = extract_metadata(text, bold_title, orgId, docType)
        print("metadata", metadata)

        doctype_id = get_doctype_id(metadata["document_type"], orgId)
        print("doctype id", doctype_id)

        # Fallback to default:true docType if not found
        if not doctype_id:
            print(f"⚠️ No valid document type found for '{metadata['document_type']}' in {filename}. Looking for default document type...")
            default_doctype = doctypes_collection.find_one(
                {"organizationId": orgId, "default": True},
                {"_id": 1}
            )
            try:
                if default_doctype:
                    doctype_id = default_doctype["_id"]
                    print(f"ℹ️ Falling back to default document type with ID: {doctype_id}")
                else:
                    raise ValueError(f"No default document type found for organization '{orgId}'.")
            except Exception as e:
                print(f"❌ Failed to process {filename}: {e}")
                update_flag_data = {
                    "batchId": batch_id,
                    "docUrl": docUrl,
                    "status": "failed",
                    "isFailed": True,
                    "fileName": filename,
                    "reason": f"Document not uploaded: {str(e)}"
                }
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': authToken,
                }
                requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)
                return {
                    "filename": filename,
                    "document_state": "FAILED",
                    "reason": f"Document not uploaded: {str(e)}"
                }

        reviewers = metadata.get("reviewers", [])
        approvers = metadata.get("approvers", [])
        system_ids = metadata.get("system_ids")

        # Determine state based on completeness
        document_state = "PUBLISHED"
        if not system_ids or not reviewers or not approvers:
            print(f"⚠️ Missing reviewers, approvers, or systems → marking as DRAFT")
            document_state = "DRAFT"
        final_document_state = documentState if documentState else document_state

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
            "documentState": final_document_state,
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
        }

        documents_collection.insert_one(doc_data)

        # Update processing status
        update_flag_data = {
            "batchId": batch_id,
            "docUrl": docUrl,
            "status": "completed",
            "isFailed": False,
            "fileName": filename,
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': authToken,
        }
        requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)

        print(f"✅ Uploaded: {filename} ({final_document_state})")
        return {
            "filename": filename,
            "document_state": final_document_state,
            "reason": "Missing reviewers, approvers, or systems marked as DRAFT" if final_document_state == "DRAFT" else "All required details were found"
        }

    except Exception as e:
        print(f"❌ Failed to process {filename}: {e}")
        update_flag_data = {
            "batchId": batch_id,
            "docUrl": docUrl,
            "status": "failed",
            "isFailed": True,
            "fileName": filename,
            "reason": f"Document not uploaded: {str(e)}"
        }
        headers = {
            'Content-Type': 'application/json',
            'Authorization': authToken,
        }
        requests.put(f"{server_url}/api/documents/updateProcessStatusByDocUrl", json=update_flag_data, headers=headers)
        return {
            "filename": filename,
            "document_state": "FAILED",
            "reason": f"Document not uploaded: {str(e)}"
        }
