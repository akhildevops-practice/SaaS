
from oci import functions as fn
import io
import uuid
import os
import oci
import json
import requests
import time
from concurrent.futures import ThreadPoolExecutor
from pymongo import MongoClient
from dotenv import load_dotenv
from services.utils import call_create_schedule_api

config = oci.config.from_file()
load_dotenv()


run_id = str(uuid.uuid4())
server_url = os.getenv("SERVER_URL")
function_ocid = os.getenv("CHECKLIST_FN_ID")
fn_invoke = None


def init_fn():
    global fn_invoke
    fn_mgmt_client = fn.FunctionsManagementClient(config)
    fn_details = fn_mgmt_client.get_function(function_id=function_ocid).data
    fn_invoke = fn.FunctionsInvokeClient(config)
    fn_invoke.base_client.set_region('ap-hyderabad-1')
    fn_invoke.base_client.endpoint = fn_details.invoke_endpoint


def invoke_oci_function(request_type, payload):
    global fn_invoke
    payload["type"] = request_type

    invoke_function_body = json.dumps(payload)

    print(f"\n Invoking OCI function for {request_type.upper()}...\n")

    fn_invoke.invoke_function(
        function_id=function_ocid,
        invoke_function_body=invoke_function_body,
        fn_invoke_type="detached",

    )

    return "Function invoked successfully."


def process_audit_schedule(payload):
    """Handles schedule creation and function invocation for SOP and HIRA."""
    # print(">>>>config in funciton", config)
    run_id = str(uuid.uuid4())
    payload["run_id"] = run_id
    payload["mongo_creation"] = True
    payload["isAiGenerated"] = True
    # print(">>>>> pAYLOAD", payload)
    # Create schedule if mongo_creation is True
    if payload.get("mongo_creation"):
        schedule_id = call_create_schedule_api(payload["scheduleData"])
        if schedule_id:
            payload["schedule_id"] = schedule_id
        else:
            raise Exception(
                "Failed to create schedule. Aborting function invocation.")

    # Set up OCI function invocation client

    # print(">>> fn details", fn_details)
    init_fn()
    invoke_oci_function("hira", payload)
    invoke_oci_function("sop", payload)
    invoke_oci_function("clause", payload)
