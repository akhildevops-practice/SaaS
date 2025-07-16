import json
import os
from bson import ObjectId
from openai import OpenAI
from pymilvus import Collection
from pymongo import MongoClient
from ai_models.openai_model import OpenaiModel
from database.connection import connect_to_milvus, use_database
from database.settings import DEFAULT_DB_NAME
import numpy as np
from prompt_templates.templates import list_of_findings_prompt

from services.hira import chunk_text
from services.utils import generate_openai_embeddings, get_embedding_for_text

mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))
db = mongo_client["prodle_db"]


def reduce_embedding_dimension(embedding):
    """ Reduce 1536-dimensional embedding to 128 dimensions """
    if len(embedding) == 1536:
        return np.mean(np.array(embedding).reshape(128, -1), axis=1).tolist()
    return embedding  # Return as is if already 128-dimension


def chunk_text(text, max_length=2000):
    """ Split text into chunks of max_length characters """
    chunks = []
    while len(text) > max_length:
        split_point = text.rfind("\n", 0, max_length)
        if split_point == -1:
            split_point = max_length
        chunks.append(text[:split_point])
        text = text[split_point:].strip()
    chunks.append(text)
    return chunks


def insert_audit_report_data(record):
    connect_to_milvus()  # Ensure connection to Milvus is established
    use_database(DEFAULT_DB_NAME)
    collection_name = "auditreport_collection"

    # Load the collection
    collection = Collection(name=collection_name)

    if not record.get("isDraft", False):
        audit_id = str(record.get("_id"))
        organization_id = record.get("organization", "")

        # Extract system names
        system_ids = [ObjectId(id) for id in record.get("system", [])]
        systems = db.systems.find(
            {"_id": {"$in": system_ids}}, {"_id": 0, "name": 1})
        system_names = [s["name"] for s in systems]

        # Extract user emails
        user_ids = record.get("auditors", []) + record.get("auditees", [])
        users = db.User.find({"_id": {"$in": user_ids}},
                             {"_id": 0, "email": 1})
        user_emails = [u["email"] for u in users]
        auditors = user_emails[:len(record.get("auditors", []))]
        auditees = user_emails[len(record.get("auditors", [])):]

        # Extract audited entity name
        entity_id = record.get("auditedEntity", "")
        entity = db.Entity.find_one(
            {"_id": entity_id}, {"_id": 0, "entityName": 1})
        audited_entity_name = entity["entityName"] if entity else ""

        location_id = record.get("location", "")
        location = db.Entity.find_one(
            {"_id": location_id}, {"_id": 0, "locationName": 1})
        audited_location_name = location["locationName"] if location else ""

        # Extract audited clauses
        clauses = []
        for clause in record.get("auditedClauses", []):
            if clause["name"].lower() == "all":
                clauses = ["All"]
                break
            clauses.append(clause["name"])

        # Extract template titles
        template_ids = [ObjectId(t["_id"])
                        for t in record.get("selectedTemplates", [])]
        templates = db.audittemplates.find(
            {"_id": {"$in": template_ids}}, {"_id": 0, "title": 1})
        template_titles = [t["title"] for t in templates]

        # **Extract section texts**

        # Prepare metadata
        metaData = {
            "Unit": record.get("unit", ""),  # Add Unit
            "Entity": audited_entity_name,  # Add Entity
            "Auditors": auditors,  # Add Auditors
            "Auditees": auditees,  # Add Auditees
            # Add Audit Date & Time
            "locationName": audited_location_name,
            "AuditDateAndTime": str(record.get("date", "")),
            "AuditType": record.get("auditType", ""),  # Add Audit Type
            "MongoCollectionID": audit_id,  # Add Mongo Collection ID
            "System": system_names,  # Add System
            "Clause": clauses,  # Add Clause
            "templates": template_titles,
        }

        # Extract and chunk section text
        chunk_data = []
        embeddings_data = []

        for section in record.get("sections", []):
            for subsection in section.get("sections", []):
                for field in subsection.get("fieldset", []):
                    nc = field.get("nc", {})

                    # Extract details from the nc object
                    nc_details = {
                        "type": nc.get("type", ""),
                        "statusComments": nc.get("statusComments", ""),
                        "findingTypeId": nc.get("findingTypeId", ""),
                        "clause": {
                            "clauseName": nc.get("clause", {}).get("clauseName", ""),
                        },
                        "comment": nc.get("comment", ""),
                        "evidence": []
                    }

                    # Extract evidence URLs
                    for evidence in nc.get("evidence", []):
                        evidence_urls = [attachment.get(
                            "url", "") for attachment in evidence.get("attachment", [])]
                        nc_details["evidence"].extend(evidence_urls)

                    # Combine all details into a single string for chunking
                    combined_text = (
                        f"Type: {nc_details['type']}, "
                        f"Status Comments: {nc_details['statusComments']}, "
                        f"Finding Type ID: {nc_details['findingTypeId']}, "
                        f"Clause Name: {nc_details['clause']['clauseName']}, "
                        f"Comment: {nc_details['comment']}, "
                        f"Evidence URLs: {', '.join(nc_details['evidence'])}"
                    )

                    # Chunk the combined text
                    chunked_texts = chunk_text(combined_text)
                    embedded_data = generate_openai_embeddings(chunked_texts)
                    if len(embedded_data) != len(chunked_texts):
                        raise ValueError(
                            "Number of embeddings does not match number of text chunks."
                        )

                    # Store chunked text and embeddings
                    chunk_data.extend(chunked_texts)
                    embeddings_data.extend(embedded_data)

        # Prepare Milvus data
        milvus_data = [
            [audit_id] * len(chunk_data),  # auditId
            [organization_id] * len(chunk_data),  # organizationId
            [location_id]*len(chunk_data),
            [entity_id]*len(chunk_data),
            [metaData] * len(chunk_data),  # metaData (as a raw dictionary)
            chunk_data,  # chunkData (raw text chunks)
            embeddings_data  # embeddingData
        ]

        # Insert data into Milvus
        collection.insert(milvus_data)


def process_audit_findings(record):
    """
    Processes audit findings by extracting relevant metadata and text chunks.

    Args:
        record (dict): The audit record containing various fields.

    Returns:
        dict: A dictionary with structured metadata and text chunk data.
    """
    metadata = {}

    # Extract key audit details
    metadata["Finding Category"] = record.get("findingCategory", "")
    metadata["Severity"] = record.get("severity", "")
    metadata["Status"] = record.get("status", "")
    metadata["Corrective Action Status"] = record.get(
        "correctiveActionStatus", "")
    metadata["Preventive Action Status"] = record.get(
        "preventiveActionStatus", "")
    metadata["Closure Date"] = str(record.get("closureDate", ""))
    metadata["Reported By"] = record.get("reportedBy", "")

    # Extract additional descriptive fields
    textChunk = {
        "Root Cause Analysis": record.get("rootCauseAnalysis", ""),
        "Impact Analysis": record.get("impactAnalysis", ""),
        "Recommendations": record.get("recommendations", "")
    }

    return {"metadata": metadata, "textChunk": textChunk}


def check_condition(accept, auditor_verification, closure_by, status):
    if accept == True and auditor_verification == False and closure_by == "None" and status == "ACCEPTED":
        return True
    elif accept == True and auditor_verification == False and closure_by == "None" and status == "AUDITORREVIEW":
        return True
    elif accept == False and auditor_verification == False and (closure_by == "IMSC" or closure_by == 'MCOE') and status == "CLOSED":
        return True
    elif accept == False and auditor_verification == True and closure_by == "None" and status == "VERIFIED":
        return True
    elif accept == True and auditor_verification == True and (closure_by == "IMSC" or closure_by == "MCOE") and status == "CLOSED":
        return True
    else:
        return False


def insert_list_of_finding_data(record):
    connect_to_milvus()  # Ensure connection to Milvus is established
    use_database(DEFAULT_DB_NAME)

    auditfinding = db.auditfindings.find_one({
        "findingType": record.get('type', ""),
        "auditTypeId": record.get('auditTypeId', "")
    })

    status = record.get('status', "")
    accept = auditfinding.get('accept', False)
    auditorVerification = auditfinding.get('auditorVerification', False)
    closureBy = auditfinding.get('closureBy', None)
    if (check_condition(accept, auditorVerification, closureBy, status)):
        collection_name = "list_of_finding_collection"

        # Load the collection
        collection = Collection(name=collection_name)

        noncompliance_id = str(record.get("_id"))
        organization_id = record.get("organization", "")

        # Extract responsible user emails
        user_ids = record.get("auditors", []) + record.get("auditees", [])
        users = db.User.find({"_id": {"$in": user_ids}},
                             {"_id": 0, "email": 1})
        user_emails = [u["email"] for u in users]
        auditors = user_emails[:len(record.get("auditors", []))]
        auditees = user_emails[len(record.get("auditors", [])):]

        # Extract entity name
        entity_id = record.get("auditedEntity", "")
        entity = db.Entity.find_one(
            {"_id": entity_id}, {"_id": 0, "entityName": 1})
        entity_name = entity["entityName"] if entity else ""

        location_id = record.get("location", "")
        location = db.Location.find_one(
            {"_id": location_id}, {"_id": 0, "locationName": 1})
        location_name = location["locationName"] if location else ""

        # Extract clause information
        clauses = []
        for clause in record.get("clause", []):
            clauses.append(clause["clauseName"])

        # Process audit findings
        audit_findings = process_audit_findings(record)

        # Prepare metadata
        metaData = {
            "location": location_name,
            "entity": entity_name,
            "auditor": auditors,
            "auditee": auditees,
            "Nonconformance Date": str(record.get("date", "")),
            "Nonconformance Type": record.get("ncType", ""),
            "MongoCollectionID": noncompliance_id,
            "Clauses": clauses,
            **audit_findings["metadata"]  # Merge processed metadata
        }

        # Extract and chunk issue description
        chunk_data = []
        embeddings_data = []

        comment = record.get("comment", "")
        corrective_action = record.get("correctiveAction", "")
        preventive_action = record.get("preventiveAction", "")

        combined_text = f"Issue: {comment}, Corrective Action: {corrective_action}, Preventive Action: {preventive_action}"
        combined_text += ", " + \
            ", ".join(
                [f"{k}: {v}" for k, v in audit_findings["textChunk"].items() if v])

        # Chunk the combined text
        chunked_texts = chunk_text(combined_text)
        embedded_data = generate_openai_embeddings(chunked_texts)

        if len(embedded_data) != len(chunked_texts):
            raise ValueError(
                "Number of embeddings does not match number of text chunks.")

        # Store chunked text and embeddings
        chunk_data.extend(chunked_texts)
        embeddings_data.extend(embedded_data)

        # Prepare Milvus data
        milvus_data = [
            [noncompliance_id] * len(chunk_data),  # noncomplianceId
            [organization_id] * len(chunk_data),  # organizationId
            [location_id]*len(chunk_data),
            [entity_id]*len(chunk_data),
            [metaData] * len(chunk_data),  # metaData (as a raw dictionary)
            chunk_data,  # chunkData (raw text chunks)
            embeddings_data  # embeddingData
        ]

        # Insert data into Milvus
        collection.insert(milvus_data)
    else:
        raise ValueError(
            "Number of embeddings does not match number of text chunks.")


def search_list_of_finding(body):
    """
    Query List of Findings data using Milvus vector search and return a single consolidated result.
    """
    try:
        # Step 1: Generate query embedding
        query_embedding = get_embedding_for_text(body["query"])

        # Step 2: Connect to Milvus collection
        collection_name = "list_of_finding_collection"
        collection = Collection(name=collection_name)

        # Ensure the collection has an index; if not, create one
        if not collection.has_index():
            index_params = {
                "index_type": "IVF_FLAT",
                "metric_type": "IP",
                "params": {"nlist": 128}
            }
            collection.create_index(
                field_name="embeddingData", index_params=index_params)  # Correct field

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
        # Corrected keys to match schema
        metadata_keys = ["locationId", "entityId"]
        for key in metadata_keys:
            if key in body:
                # Corrected field
                filters.append(f"metaData['{key}'] == '{body[key]}'")


        filter_expr = " and ".join(filters) if filters else ""

        # Step 4: Perform search in Milvus
        results = collection.search(
            data=[query_embedding],
            anns_field="embeddingData",  # Correct field name
            param=search_params,
            limit=top_k,
            output_fields=["metaData", "chunkData"],  # Corrected output fields
            expr=filter_expr
        )

        # Step 5: Filter out invalid results
        filtered_results = [
            {
                # Corrected field
                "chunkText": top_result.entity.get("chunkData"),
                # Corrected field
                "metadata": top_result.entity.get("metaData"),
                "similarity": top_result.distance,
            }
            for top_result in results[0]
            if top_result.entity.get("metaData") and top_result.entity.get("chunkData")
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


        chat_prompt = list_of_findings_prompt.format(
            prompt_contexts=prompt_contexts, query=body["query"])

        # Step 7: Query OpenAIF
        model = OpenaiModel(
            config={
                "api_key": os.getenv("OPENAI_API_KEY"),
                "model": "gpt-4o-mini",
                "max_tokens": 4000,
                "temperature": 0,
            }
        )
        response = model.generate_response(
            system_message=chat_prompt, messages=[body["query"]])
        
        response_text = response["output"]

        # Step 8: Parse OpenAI response
        response_json = response_text  # Directly use it

        # if not isinstance(response_json, dict) or "answer" not in response_json or "sources" not in response_json:
        #     raise Exception("Unexpected response structure from OpenAI.")

        try:
            # Ensure response is a proper string
            cleaned_response = response_text.strip()

            # Fix improperly formatted JSON by replacing control characters
            cleaned_response = cleaned_response.replace(
                "\n", "").replace("\t", "").replace("\r", "")

            response_json = json.loads(cleaned_response)
            return response_json
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from OpenAI.")

    except Exception as e:
        raise Exception(f"Error in List of Findings query: {e}")
