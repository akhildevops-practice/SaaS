from pymilvus import connections, db, MilvusClient
from database.settings import MILVUS_HOST, MILVUS_PORT, MILVUS_TOKEN, CLUSTER_ENDPOINT

def connect_to_milvus(alias="default"):
    """
    Establish a connection to the Milvus server.
    """
    try:
        connections.connect(alias, host=MILVUS_HOST, port=MILVUS_PORT)
        print(f"Connected to Milvus at {MILVUS_HOST}:{MILVUS_PORT}")
        # client = MilvusClient(
        #     uri=CLUSTER_ENDPOINT,
        #     token=MILVUS_TOKEN,
        # )
        # print("Connected to Milvus.", client)
    except Exception as e:
        raise ConnectionError(f"Failed to connect to Milvus: {e}")

def create_database(db_name):
    """
    Create a Milvus database if it doesn't already exist.
    """
    if db_name not in db.list_database():
        db.create_database(db_name)
        print(f"Database '{db_name}' created.")
    else:
        print(f"Database '{db_name}' already exists.")

def use_database(db_name):
    """
    Switch to a specific database in Milvus.
    """
    try:
        db.using_database(db_name)
        print(f"Switched to database '{db_name}'.")
    except Exception as e:
        raise RuntimeError(f"Failed to switch to database '{db_name}': {e}")
