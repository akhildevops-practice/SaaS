from milvus_collections.base_schema import (
    create_int64_field,
    create_varchar_field,
    create_json_field,
    create_float_vector_field,
    create_collection_schema,
)

# Define optimized fields for the Audit Report collection
fields = [
    # Auto-incrementing primary key
    create_int64_field(name="id", is_primary=True, auto_id=True),
    # Unique Audit Identifier
    create_varchar_field(name="auditId", max_length=255),
    # Organization ID
    create_varchar_field(name="organizationId", max_length=255),
    
    create_varchar_field(name="locationId", max_length=255),
    create_varchar_field(name="entityId", max_length=255),
    # JSON field storing all audit metadata
    create_json_field(name="metaData"),
    # Field for storing text chunks (RCA, Corrective Action, etc.)
    # Use VARCHAR with a large max length or JSON field
    create_varchar_field(name="chunkData", max_length=65535),
    # Embedding field with dimension 1536
    create_float_vector_field(name="embeddingData", dim=1536),
]

# Create the collection schema
list_of_finding_schema = create_collection_schema(
    fields=fields,
    description="Optimized schema for storing noncomformance with metadata, chunkData, and embeddings",
    enable_dynamic_field=True  # Allows storing additional fields dynamically
)
