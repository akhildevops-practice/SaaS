
from pymilvus import utility, connections, db
if __name__ == "__main__":
    connections.connect(host="127.0.0.1", port=19530)

    db.using_database("prodle_vdb")
    utility.drop_collection("document_collection")


# run python scripts/one_time_init.py to create the database and collection in Milvus.
