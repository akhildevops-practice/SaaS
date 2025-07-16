from milvus_collections.base_schema import (
    create_int64_field,
    create_float_vector_field,
    create_varchar_field,
    create_json_field,
    create_collection_schema,
)

# Define fields for HIRA collection
fields = [
    create_int64_field(name="id", is_primary=True, auto_id=True),
    create_varchar_field(name="hira_id", max_length=48),
    create_int64_field(name="step_id"),
    create_float_vector_field(name="step_embedding", dim=1536),
    create_varchar_field(name="step_description", max_length=65535),
    create_json_field(name="metadata")
]

# Create collection schema
hira_collection_schema = create_collection_schema(
    fields=fields,
    description="Schema for storing HIRA steps, embeddings, and metadata",
    enable_dynamic_field=True
)
