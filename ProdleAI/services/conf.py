import os
from celery import Celery
from kombu import Queue

rabbitmq_url = os.getenv("RABBITMQ_URL")

celery = Celery("chatQuery", broker=rabbitmq_url)
celery.conf.task_default_queue = "celery"

celery.conf.task_queues = (
    Queue('doc_queue', routing_key='doc'),
    Queue('image_queue', routing_key='image'),
    Queue('checklist_queue', routing_key='checklist'),
    Queue('bulkUpload_queue', routing_key='bulkUpload'),
)
