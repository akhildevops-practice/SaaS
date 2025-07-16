from spire.doc import *
from spire.doc.common import *
import uuid
from dotenv import load_dotenv
import os
from bs4 import BeautifulSoup
load_dotenv()


folder_path = os.getenv("FOLDER_PATH")
server_url = os.getenv("SERVER_URL")


def generate_html_template(html_content):
    """Generate a clean HTML template from the input HTML."""
    
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Replace all text content in <p>, <span>, etc., with placeholders
    for tag in soup.find_all(["p", "span"]):
        tag.string = "Placeholder for text content"
    
    # Process headings (<h1>, <h2>, etc.)
    for tag in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
        tag.string = "Sample Heading"
    
    # Process lists (<ul>, <ol>)
    for list_tag in soup.find_all(["ul", "ol"]):
        for li_tag in list_tag.find_all("li"):
            li_tag.string = "Sample List Item"
        # Keep only one list item
        if len(list_tag.find_all("li")) > 1:
            for extra_li in list_tag.find_all("li")[1:]:
                extra_li.decompose()
    
    # Process tables
    for table_tag in soup.find_all("table"):
        # Replace <thead> content
        thead = table_tag.find("thead")
        if thead:
            for th_tag in thead.find_all("th"):
                th_tag.string = "Sample Header"
        
        # Replace <tbody> content with a single sample row
        tbody = table_tag.find("tbody")
        if tbody:
            for tr_tag in tbody.find_all("tr"):
                for td_tag in tr_tag.find_all("td"):
                    td_tag.string = "Sample Data"
            # Keep only one row
            if len(tbody.find_all("tr")) > 1:
                for extra_tr in tbody.find_all("tr")[1:]:
                    extra_tr.decompose()
    
    # Replace <title> content
    if soup.title:
        soup.title.string = "Sample Title"
    
    # Return the cleaned-up HTML as a string
    return soup.prettify()


def docx_to_html(docx_file, html_file):
    # Load the DOCX file
    document = Document()
    document.LoadFromFile(docx_file)

    # Save the DOCX file as HTML
    document.SaveToFile(html_file, FileFormat.Html)
    document.Close()

    # Read the generated HTML
    with open(html_file, 'r', encoding='utf-8') as file:
        html_content = file.read()

    # print("html_content original in docx to html", html_content)

    # Define custom CSS for table borders and other styles
    custom_css = """
    <style>
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 10px;
    }
    </style>
    """

    # Check if <head> exists, add it with custom CSS if not
    if '<head>' in html_content:
        # Insert custom CSS into the existing <head>
        html_content = html_content.replace('<head>', '<head>' + custom_css)
    else:
        # Add <head> with custom CSS
        html_content = '<head>' + custom_css + '</head>' + html_content

    # Write the modified HTML back to file
    with open(html_file, 'w', encoding='utf-8') as file:
        file.write(html_content)
    # print("html_content with styles in docx to html", html_content)
    return html_content

def convert_html_content_to_docx(html_content, docx_file):
    generated_uuid_to_create_file = uuid.uuid4()

    # Convert UUID format to a string.
    file_name = str(generated_uuid_to_create_file)
    print("file_name", file_name)

    final_path = docx_file + "/" + file_name + ".docx"
    print("final_path", final_path)
    
    # Check if we're using object store
    is_object_store = os.getenv("IS_OBJECT_STORE", "false").lower() == "true"
    
    if is_object_store:
        # For object store, return the object name directly
        # This will be used as the documentLink in the database
        document_link = file_name + ".docx"
        # print(f"Using object store. Document link: {document_link}")
    else:
        # For local storage, use the server URL path
        document_link = final_path.replace("../uploads", server_url)
        # print(f"Using local storage. Document link: {document_link}")
    
    # Create a Document instance
    document = Document()

    # Add a section to the document
    section = document.AddSection()

    # Add a paragraph to the section
    paragraph = section.AddParagraph()

    # Set the HTML content to the paragraph
    paragraph.AppendHTML(html_content)

    # Save the document as a DOCX file
    document.SaveToFile(final_path, FileFormat.Docx2016)
    document.Close()

    return document_link

