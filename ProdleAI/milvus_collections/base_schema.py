from pymilvus import FieldSchema, DataType, CollectionSchema

def create_int64_field(name, is_primary=False, auto_id=False):
    return FieldSchema(name=name, dtype=DataType.INT64, is_primary=is_primary, auto_id=auto_id)

def create_float_vector_field(name, dim):
    return FieldSchema(name=name, dtype=DataType.FLOAT_VECTOR, dim=dim)

def create_varchar_field(name, max_length):
    return FieldSchema(name=name, dtype=DataType.VARCHAR, max_length=max_length)

def create_json_field(name):
    return FieldSchema(name=name, dtype=DataType.JSON)

def create_array_field(name):
    return FieldSchema(name=name, dtype=DataType.ARRAY,element_type=DataType.VARCHAR, max_length=255, max_capacity=10)


def validate_schema(fields):
    if not isinstance(fields, list) or len(fields) == 0:
        raise ValueError("A schema must have at least one field.")
    for field in fields:
        if not isinstance(field, FieldSchema):
            raise TypeError(f"Invalid field type: {field}")
    return True

def create_collection_schema(fields, description="", enable_dynamic_field=False):
    validate_schema(fields)
    return CollectionSchema(fields=fields, description=description, enable_dynamic_field=enable_dynamic_field)