# capa_collection.py
from milvus_collections.base_schema import (
    create_int64_field,
    create_float_vector_field,
    create_varchar_field,
    create_collection_schema,
    create_json_field,
)

# Define fields for CAPA collection
system_fields = [
    create_int64_field(name="id", is_primary=True, auto_id=True),
    create_varchar_field(name="system_id", max_length=48),
    create_float_vector_field(name="embedding", dim=1536),
    create_varchar_field(name="system_text", max_length=65535),
    create_json_field(name="metadata"),
]

# Create CAPA collection schema
system_collection_schema = create_collection_schema(
    fields=system_fields,
    description="Schema for storing CAPA data, embeddings, and text",
    enable_dynamic_field=True
)