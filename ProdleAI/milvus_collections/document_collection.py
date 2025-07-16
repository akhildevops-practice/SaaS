from milvus_collections.base_schema import (
    create_int64_field,
    create_float_vector_field,
    create_varchar_field,
    create_json_field,
    create_collection_schema,
)

# Define fields for document collection
fields = [
    create_int64_field(name="id", is_primary=True, auto_id=True),
    create_varchar_field(name="doc_id", max_length=48),
    create_int64_field(name="chunk_id"),
    create_float_vector_field(name="doc_embedding", dim=1536),
    create_varchar_field(name="doc_chunk", max_length=65535),
    create_json_field(name="metadata")
]

# Create collection schema
document_collection_schema = create_collection_schema(
    fields=fields,
    description="Schema for storing document chunks, embeddings, and full document text",
    enable_dynamic_field=True
)