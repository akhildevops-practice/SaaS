import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Milvus server configuration
MILVUS_HOST = os.getenv("MILVUS_HOST", "127.0.0.1")  # Default to localhost if not set
MILVUS_PORT = int(os.getenv("MILVUS_PORT", 19530))  # Default to 19530 if not set
DEFAULT_DB_NAME = os.getenv("MILVUS_DB", "default")  # Default to 'default' if not set
CLUSTER_ENDPOINT = os.getenv("MILVUS_Z_CLUSTER_ENDPOINT")
MILVUS_TOKEN = os.getenv("MILVUS_Z_TOKEN")