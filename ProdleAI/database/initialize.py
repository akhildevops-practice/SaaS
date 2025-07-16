# initialize.py

from pymilvus import Collection, db, utility
from database.connection import connect_to_milvus, create_database, use_database
from database.settings import DEFAULT_DB_NAME
from milvus_collections import (
    audit_collection, list_of_findings_collection, document_collection,
    capa_collection, hira_collection, system_collection, clause_collection
)

# Mapping of collection names to their schemas
COLLECTION_SCHEMAS = {
    "document_collection": document_collection.document_collection_schema,
    "capa_collection": capa_collection.capa_collection_schema,
    "hira_collection": hira_collection.hira_collection_schema,
    "system_collection": system_collection.system_collection_schema,
    "clause_collection": clause_collection.clause_collection_schema,
    "auditreport_collection": audit_collection.auditReportSchema,
    "list_of_finding_collection": list_of_findings_collection.list_of_finding_schema
    }

def initialize_database_and_collections():
    """
    Initializes the Milvus database and collections if they do not already exist.
    """
    connect_to_milvus()

    # Ensure the database exists
    if DEFAULT_DB_NAME not in db.list_database():
        create_database(DEFAULT_DB_NAME)
        print(f"Created database: {DEFAULT_DB_NAME}")
    else:
        print(f"Database already exists: {DEFAULT_DB_NAME}")

    use_database(DEFAULT_DB_NAME)

    # Create collections if they do not exist
    for collection_name, schema in COLLECTION_SCHEMAS.items():
        if not utility.has_collection(collection_name):
            Collection(name=collection_name, schema=schema)
            print(f"Created collection: {collection_name}")
        else:
            print(f"Collection already exists: {collection_name}")

