import os
from prompt_templates.templates import audit_report_summary_prompt, audit_report_image_summary_prompt
from openai import OpenAI as org_opeani
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
import anthropic
import base64
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
folder_path = os.getenv("FOLDER_PATH")
server_url = os.getenv("SERVER_URL")
app = Flask(__name__)
api_key = os.getenv("OPENAI_API_KEY")
CORS(app, origins="*")


def generate_ai_audit_report_summary(audit_dtls):
    openai_client = org_opeani(api_key=os.getenv("OPENAI_API_KEY"))
    attachment_urls = audit_dtls["attachmentUrls"]
    # Generate summaries for all attachments
    attachment_summaries = get_attachment_urls_summary(attachment_urls)

    # Concatenate all attachment summaries
    prompt = audit_report_summary_prompt.format(
        audit_report_summary_html=audit_dtls["auditReportSummaryHtml"],
        audit_report_image_summary = attachment_summaries
    )
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=4091,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        suggestions = response.choices[0].message.content
        #suggestions += "\n\n### Attachment Summaries:\n" + attachments_summary_text
        return suggestions
    except Exception as e:
        print("Error generating suggestions:", e)
        return None

def get_media_type(file_path):
    # Get the file extension
    ext = os.path.splitext(file_path)[1].lower()

    # Map of file extensions to media types
    media_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".bmp": "image/bmp",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".tiff": "image/tiff",
        ".webp": "image/webp",
        # Add more media types as needed
    }

    # Return the appropriate media type or a default one
    return media_types.get(ext, "image/jpeg")
    
def get_attachment_urls_summary(attachment_urls):
    # Prepare the payload with all images encoded in Base64
    attachments = []
    for file_path in attachment_urls:
        try:
            media_type = get_media_type(file_path)
            with open(file_path, "rb") as image_file:
                image_data = base64.b64encode(image_file.read()).decode("utf-8")
            attachments.append({
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": media_type,
                    "data": image_data
                }
            })
        except Exception as e:
            print(f"Error encoding file {file_path}: {e}")
    
    if not attachments:
        return "No valid attachments found."
    
    client = anthropic.Anthropic(api_key='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')

    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=4000,
        system=audit_report_image_summary_prompt,
        messages=[
                {"role": "user", "content": attachments}
            ]
    )
        
    output = message.content[0].text
    return output
