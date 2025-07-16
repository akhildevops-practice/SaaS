from pymongo import MongoClient
from dotenv import load_dotenv
import os


load_dotenv()


mongo_client = MongoClient(os.getenv("MONGO_DB_URL"))
mongo_db = mongo_client["prodle_db"]
license_collection = mongo_db["licenses"]

def track_token_usage_in_license(org_id: str, provider: str, feature: str, input_tokens: int, output_tokens: int):
    provider = provider.lower()
    feature_map_field = f"{provider}Features"

    license_doc = license_collection.find_one({"organizationId": org_id}, {feature_map_field: 1})
    existing_field = license_doc.get(feature_map_field) if license_doc else None

    if existing_field is not None and not isinstance(existing_field, dict):
        # print(f"[track_token_usage] Fixing type of '{feature_map_field}' (was {type(existing_field).__name__})")
        license_collection.update_one(
            {"organizationId": org_id},
            {"$set": {feature_map_field: {}}}
        )

    update_query = {
        "$inc": {
            f"{feature_map_field}.total.inputTokens": input_tokens,
            f"{feature_map_field}.total.outputTokens": output_tokens,
            f"{feature_map_field}.{feature}.inputTokens": input_tokens,
            f"{feature_map_field}.{feature}.outputTokens": output_tokens,
        }
    }

    result = license_collection.update_one(
        {"organizationId": org_id},
        update_query,
        upsert=True
    )

    # if result.matched_count == 0:
    #     print(f"[track_token_usage] License document created for org_id={org_id}")
    # else:
    #     print(f"[track_token_usage] Updated tokens under {provider.upper()} for feature: {feature}, org_id: {org_id}")