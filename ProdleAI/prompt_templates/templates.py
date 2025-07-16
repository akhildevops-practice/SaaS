main_template = """
You are an AI assistant helping users answer document-based queries using the provided context.

---------------------
{context_str}
---------------------

Guidelines:

1. <b>Use only HTML formatting</b>. Do NOT use Markdown. Avoid **double asterisks**, underscores, or any Markdown syntax. For bold text, only use <b>...</b>. For line breaks, only use <br>.

2. Focus strictly on the content, data, and details found within this document. Do not include external knowledge, interpretations, or assumptions not supported by the context.

3. Provide a helpful, structured response that directly addresses the user's query. Summarize or paraphrase relevant parts of the context — do NOT repeat the full context or dump it.

4. Begin the answer with <b>ANSWER:</b><br><br>

5. Your answer must be suitable for rendering in an HTML-based chat interface.

6. Do NOT include any "Sources", document links, or mentions of document names.

7. Avoid repetition, extra phrases like "based on the document", or any non-informative filler.

8. Final Output Example (structure only):
<b>Section 1:</b> Your explanation here.<br>
<b>Section 2:</b> More details here.<br>
- Bullet point 1<br>
- Bullet point 2<br>

QUERY: {query_str}
ANSWER:
"""


temmplate_to_generate_filters = """

"1.You have to extract the key and value from the query"
"2. You have to return the output as json key value pair, look at the example below for output answer"
"3. And the query can refer to documentName as title of the document, document title, entityName as department, vertical, and locationName as Unit, location, \n"
"3.Please exclude any other text from the output, it should just contain json, not even the word 'Answer'"
"4. Please dont write any other operators such as back ticks or quotes in the output, just keep it exactly json which then can be further processed by the json.loads()"
"Query: {query_str}"

"<EXAMPLE_START>: "
"Query: What are the Documents in the department of potroom?"
"Answer: [{{"key":"department", "value":"potroom""}}]
"EXAMPLE_END>"
"Answer:"

"""

template_to_generate_file = """
Context information is below.

---------------------

{context_str}
---------------------

1. Begin by carefully reading the provided context information within the dashed lines.
2. Extract all the Headings, and generate a plain placeholder template.
3. In the generated template, under each heading, write `This is Sample Content`.

"""


# template_to_generate_summary = """
# Context information is below.

# ---------------------

# {context_str}
# ---------------------

# Please generate a detailed summary, Use <strong style="background-color:yellow;"> tags to
# emphasize key points and organize the content with appropriate HTML elements
# such as <p>, <ul>, <li>, and <div>. Avoid using heading tags smaller than <h5>. Include crucial information prominently.
# Can you provide a comprehensive summary of the given text? The summary should cover all the key points and main ideas presented in the original text,
# while also condensing the information into a concise and easy-to-understand format.
# Please ensure that the summary includes relevant details and examples that support the main ideas, while avoiding any unnecessary information or repetition.
# The length of the summary should be appropriate for the length and complexity of the original text, providing a clear
# and accurate overview without omitting any important information.
# """

template_to_generate_summary = """
Please create a detailed and comprehensive summary of the text provided. 
The summary should provide a clear and complete overview, capturing the essence and key points of the content. 
Use HTML elements like <strong> tags to emphasize crucial information and organize the content with <p>, <ul>, <li>, and <div> 
for readability. Avoid listing document headings directly, and instead integrate the information into a fluent narrative 
that stands on its own. The summary should be concise, omitting redundant details while ensuring that all important 
aspects are included and clearly explained. This should help any reader understand the main objectives, methodologies, 
and outcomes presented in the document without needing to refer to specific sections or headings.
"""

# prompt_to_generate_tags = """

# List the core concepts in the given text as tags . Hyperlink of these tags should display concept paragraph.
# The output should be formatted as an array of strings, such as ['Equipment Calibration Steps', 'Hazard Mitigation Strategies'].
# These should be present in the text and should be unique concepts or ideas that are discussed in the document. It should be taken from the text
# such that if i search it in the document i should be able to find the paragraph where it is discussed.
# """

prompt_to_generate_tags = """
For this document being uploaded list the core concepts , specifications, methods, document references , 
document responsibilities, ISO or IS Quality systems, equipment list, people names, safety and health hazard, 
environmental aspects and KPI titles as tags. 
The output should be formatted as an array of strings, such as ['Equipment Calibration Steps', 'Hazard Mitigation Strategies'].

"""

prompt_to_generate_concept_string = """
Given a document, extract and list its core concepts, specifications, methods, document references, 
document responsibilities, ISO or IS Quality systems, equipment list, people names, safety and health hazards, 
environmental aspects, and KPI titles as tags. These tags should represent unique concepts or ideas discussed within the document. 
Use the following examples just for illustration and do not include them in your output: "Equipment Calibration Steps, 
Hazard Mitigation Strategies, KPI Titles". The expected format for the output is a comma-separated string of these concepts.

"""
# Based on the provided text, generate an array of concise, descriptive tags. Each tag should be a brief phrase
# that captures a unique concept, procedure, or theme discussed within the text.  Ensure the tags accurately reflect the key points and
# distinct sections of the text, providing a clear snapshot of its contents. These tags should serve as categorical summaries that help in
# quickly identifying the focus areas and main topics of the text, suitable for efficient management and retrieval.

# For the given text, extract key concepts and provide a brief excerpt for each concept. The output should be formatted as an array of objects,
# where each object has two properties: 'tag' and 'text'. The 'tag' should be a unique concept or idea discussed in the document, and 'text'
# should contain 1-2 lines from the document where that tag or concept is mentioned. This should allow someone to understand the context of the tag
# by reading the excerpt without needing to search through the document.

#     For this document being uploaded list the core concepts , specifications, methods, document references ,
# document responsibilities, ISO or IS Quality systems, equipment list, people names, safety and health hazard,
# environmental aspects and KPI titles as tags.
# The output should be formatted comma separated concepts in string , such as "Equipment Calibration Steps, Hazard Mitigation Strategies"

prompt_to_extract_concepts = """ 

Given a document, extract and list the following attributes as a comma-separated string within an object: 
equipment, people, locations, dates, references, hira, aspect, systems, and clauses. 
Each attribute should represent unique concepts or ideas discussed within the document. 
Include only those that are mentioned in the document.

Examples and definitions for each attribute:
- Equipment: Include all machines, tools, and equipment involved, such as "Drills, Loaders, Dumpers".
- People: Include all designations, roles, and officials mentioned, like "Engineer, Supervisor, Manager".
- Locations: Include names of departments, actual location sites, or place names, like "Utkal, Mahan, Aditya".
- Dates: List all important dates mentioned along with a brief description of what the date is about.
- References: Mention all document titles or names of references cited within the document.
- Hira: Include all sorts of hazards, HIRA, and risks associated mentioned in the document.
- Aspect: Note any environmental considerations or impacts described in the document.
- Systems: Mention all ISO standard systems discussed, like "ISO 9001, ISO 14001".
- Clauses: List only the numbers of the ISO clauses mentioned in the document, like "6.1, 7.2".

The expected output format is an object where each attribute contains a string value, 
for example: { equipment: "Drills, Loaders, Dumpers", locations: "Utkal, Mahan" }.

"""

# Given a document, extract and list the following attributes as a comma-separated string within an object:
# equipment, people, locations, dates, references, hira, aspect, systems, and clauses.
# Each attribute should represent unique concepts or ideas discussed within the document,
# and should be included only if they are mentioned in the document.

# The expected output format is an object where each attribute contains a string value,
# for example: { equipment: "Drills, Loaders, Dumpers", locations: "Aditya, Utkal" }.

template_to_generate_mcq = """
Please generate exactly four multiple choice questions based on the content of the document, the questions should be random, formatted directly in JSON. Each question should be structured as a JSON object with keys 'question', 'options' (an array of four choices), and 'correct_answer'. Output should be an array of such objects.

Example of expected output:
[
    {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": "Paris"
    },
    ...
]

Use clear and concise language to ensure the questions and options are understandable and relevant to the document content.
"""

entity_extraction = """
Context information is below.

---------------------

{context_str}
---------------------

1. Begin by carefully reading the provided context information within the dashed lines.
2. Using the context information perform entity extraction for the following department, section, location, document number, document type, effective date, document title, revision number, revision date, issue number, issue date, prepared by, prepared by date, reviewed by, reviewed by date, approved by, approved by date, issued by, issued by date, ISO standards(also known as system), clause numbers.
3. If some of the extraction details are not present skip those entities.
Please note that document number should be in string fromat only.
4. Ensure the new content is relevant, accurate, and directly addresses the query.
5. For document type, use the list i have provided and pick the most relevant document type from the list that matches or is close to the document type extracted and represent the document_type as a string of documentTypeName, below is the document type:
    {docTypeOptions}

6. For system, in the document type list there is also applicable_systems field which represents systems belonging to a particular document type, so pick the most relevant applicable_system from the list that matches or is close to ISO standards extracted and represent the ISO standards as "system" and it is an array of the applicable_system ids.
7. Return the result in plain json format like, without adding "json``` ```" around the result.

"""

capa_ai_suggestions_prompt = """
For a given Corrective and Preventive Actions(CAPA) with problem statement, problem description and containment action and other information mentioned below, if containment action and other details are present use the containment action and other details to get the result if not suggest a containment action and other details.
Problem Statement: {problemStatement}
Problem Description: {problemDescription}
Containment Action: {containmentAction}
Root Cause: {rootCauseAnalysis}
Corrective Action: {correctiveAction}
Possible Causes:
    Man: {man}
    Material: {material}
    Method: {method}
    Machine: {machine}
    Measurement: {measurement}
    Environment: {environment}
Why Why's:
    Why1: {why1}
    Why2: {why2}
    Why3: {why3}
    Why4: {why4}
    Why5: {why5}
Prefered Technique: {preferedTechnique}
Return the result in plain json format like without adding "json``` ```" around the result with the paramenters below: 
1. Correction/Containment Action as "containmentAction".
2. Root Cause Analysis as "rootCause".
3. Depending upon Prefered Technique give the best solution for this CAPA.
    a) If Prefered Technique is "Any":
        There are two options pick the best for this CAPA:
            1) Possible Causes: With Man, Material, Method, Machine, Measurement and Environment parameters.
            2) Why Why: Use Why Why Techniques which gives me 5 Why's, like why1, why2 etc with question and answer in a single string.
    b) If Prefered Technique is "Possible Causes":
        Then give the best solutions for Possible Causes: With Man, Material, Method, Machine, Measurement and Environment parameters.
    c) If Prefered Technique is "Why Why":
        Then give the best solutions for Why Why: Use Why Why Techniques which gives me 5 Why's, like why1, why2 etc with question and answer in a single string.
4. How my json should be if possibleCauses is the best option then my json will contain containmentAction, rootCause and possibleCauses which is an object with the mentoined parameters,
    if Why Why is the best option then my json will contain containmentAction, rootCause and whyWhy which is an object with why1, why2 etc.
5. Do not mention Problem Statement and Problem Description in the json result.
"""

prompt_to_generate_tags_from_drawing = """
Analyze the provided image in detail and respond with the following structure:

Title: [Provide a concise title for the image]
Summary: [Briefly describe the main content of the image]
Metadata:

Drawing Date: [Extract if available]
Drawing Number: [Extract if available]
Drawn By/Creator: [Extract if available]
Revision Number: [Extract if available]

Identified Features:
[List key features of the drawing as key-value pairs]
Dimensions:
[List all visible dimensions as key-value pairs, e.g., Height: 165 mm]
Additional Features:
[List any other notable features or information not covered in the above categories]

Return the result in plain json format , without adding "json``` ```" around the result.
"""

audit_report_summary_prompt = """
Below is the HTML of an audit report using the Findings, Findings Details, References, Clauses and Evidence, generate a summary of that report.
Give me the summary in different segments and each segment is for one Findings.
{audit_report_summary_html}

I also already have the summary of the images, so do not analyse the images in the given html.
There is one more segment:
5) Image Summary
Use the summary below for this segment, let the summary be as it is do not make any changes to it.
{audit_report_image_summary}

Give me the summary in: 
1) Basic HTML format with no fillers like ```html ``` or comments before or after the html code.
2) Do not include the images in the html.
3) Do not represent the summary in table format, represent it like a report that has to been shown to a CEO.
Thank You.
"""

audit_report_image_summary_prompt = """
You have a list of images, carefully analyse the images one by one and tell me what you see or what the image is trying to convey.
Limit your response to 3-4 sentences per image, focusing on the most relevant and important aspects of the image.
Thank You
"""

audit_checklist_prompt = """
Generate a JSON audit checklist based on the SOPs, HIRAs, and audit scope.

Audit Scope: {audit_scope}  
SOPs: {sop_text}  
HIRAs: {hira_text}  

Checklist Format:  
Each question must have:  
- "SectionTitle": Section name  
- "QuestionTitle": Question text  
- "Type": Question type (checkbox, numeric, radio, text)  
- "Score": Scoring (checkbox: yes:10, no:5, radio: yes:10, no:0, na:5, numeric: >6:10,<3:2, text: Not Required)  
- "Slider": true/false (only for numeric type)  
- "Hint": Optional guidance  

**Guidelines**:  
- Include 10 sections evenly distributed across SOPs and HIRAs, covering "Infrastructure," "Equipment and Systems," and "Hazards."  
- Create 5 questions in total, ensuring a mix of topics from both SOPs and HIRAs.  
- Randomly select types (checkbox, numeric, radio, text).  
- Add appropriate scoring and hints.  

**Output Example**:  
[
  {{
    "SectionTitle": "Building integrity",
    "QuestionTitle": "Is there visible structural damage?",
    "Type": "checkbox",
    "Score": "yes:10, no:5",
    "Slider": false,
    "Hint": "Check walls, ceilings, and beams for cracks."
  }},
  {{
    "SectionTitle": "Chemical hazards",
    "QuestionTitle": "Are PPEs being used to mitigate chemical spill risks?",
    "Type": "radio",
    "Score": "yes:10, no:0, na:5",
    "Slider": false,
    "Hint": "Verify adherence to HIRA control measures for chemical spills."
  }}
]
JSON should not have ```json ``` around it.
Generate 5 questions as described, ensuring alignment with the SOPs, and HIRAs.

"""

audit_checklist_prompt_with_CAPA = """
Generate a JSON audit checklist based on the SOPs, HIRAs,CAPAs and audit scope.

Audit Scope: {audit_scope}  
CAPAs: {capa_text}

Checklist Format:  
Each question must have:  
- "SectionTitle": Section name  
- "QuestionTitle": Question text  
- "Type": Question type (checkbox, numeric, radio, text)  
- "Score": Scoring (checkbox: yes:10, no:5, radio: yes:10, no:0, na:5, numeric: >6:10,<3:2, text: Not Required)  
- "Slider": true/false (only for numeric type)  
- "Hint": Optional guidance  

**Guidelines**:  
- Include 10 sections evenly distributed across SOPs,CAPAs and HIRAs, covering "Infrastructure," "Equipment and Systems," and "Hazards."  
- Create 5 questions in total, ensuring a mix of topics from both SOPs,CAPAs and HIRAs.  
- Randomly select types (checkbox, numeric, radio, text). 
- Include questions based on corrective actions, problem statements, and root causes from CAPAs. 
- Add appropriate scoring and hints.  

**Output Example**:  
[
  {{
    "SectionTitle": "Building integrity",
    "QuestionTitle": "Is there visible structural damage?",
    "Type": "checkbox",
    "Score": "yes:10, no:5",
    "Slider": false,
    "Hint": "Check walls, ceilings, and beams for cracks."
  }},
  {{
    "SectionTitle": "Chemical hazards",
    "QuestionTitle": "Are PPEs being used to mitigate chemical spill risks?",
    "Type": "radio",
    "Score": "yes:10, no:0, na:5",
    "Slider": false,
    "Hint": "Verify adherence to HIRA control measures for chemical spills."
  }},
  {{  
    "SectionTitle": "CAPA: Corrective Actions",  
    "QuestionTitle": "Have the corrective actions for the equipment failure been implemented?",  
    "Type": "checkbox",  
    "Score": "yes:10, no:5",  
    "Slider": false,  
    "Hint": "Ensure that all corrective actions mentioned in CAPA are completed."  
  }},  
  {{  
    "SectionTitle": "CAPA: Root Cause",  
    "QuestionTitle": "Was the root cause of the issue properly identified in the CAPA?",  
    "Type": "radio",  
    "Score": "yes:10, no:0, na:5",  
    "Slider": false,  
    "Hint": "Verify the root cause analysis from CAPA documentation."  
  }},  
  {{  
    "SectionTitle": "CAPA: Problem Statement",  
    "QuestionTitle": "Does the CAPA adequately address the problem statement related to system downtime?",  
    "Type": "numeric",  
    "Score": ">6:10,<3:2",  
    "Slider": true,  
    "Hint": "Review the CAPA document for alignment with system downtime issues."  
  }}  
]
JSON should not have ```json ``` around it.
Generate 5 questions as described, ensuring alignment with the SOPs,CAPAs and HIRAs.

"""
list_of_findings_prompt = """
    {prompt_contexts}
    Query: {query}

    Based strictly on the provided contexts, generate a structured and comprehensive response. The response should:

    1. Clearly explain the issue, corrective action, and any related metadata.
    2. Use simple, easy-to-understand language while maintaining professionalism.
    3. Break down complex details into clear and digestible points.
    4. Provide relevant details to ensure a complete understanding.
    5. Maintain a natural and conversational tone while staying precise.
    6. Avoid making assumptions or including external knowledge.
    7. If information is not available in the contexts, respond with: "The information is not available in the provided contexts."

    Format the response as a valid JSON object with the following structure:

    {{
        "answer": "A detailed and structured explanation of the issue, corrective action, and metadata. Include all relevant details from the provided context.",
        "metadata": {{
            "location": "Location of the issue",
            "entity": "Entity involved",
            "auditor": ["List of auditors"],
            "auditee": ["List of auditees"],
            "Nonconformance Date": "YYYY-MM-DDTHH:MM:SS",
            "Nonconformance Type": "Type of nonconformance",
            "Clauses": ["List of related clauses"],
            "Finding Category": "Finding category",
            "Severity": "Severity level",
            "Status": "Current status",
            "Corrective Action Status": "Status of corrective action",
            "Preventive Action Status": "Status of preventive action",
            "Closure Date": "YYYY-MM-DDTHH:MM:SS",
            "Reported By": "Reporter of the issue"
        }},
        "sources": An array of objects containing:
                   "location": "Location of the issue",
                   "entity": "Entity involved",

    Ensure the response:
            1. A valid JSON object
            2. Based solely on provided contexts
            3. Comprehensive and detailed
            4. Clear and easy to understand
            5. Well-structured and logical
            make sure the json is valid,
            Don't wrap the JSON in ```json ``` tags. It should be a plain JSON object.
    """
    
