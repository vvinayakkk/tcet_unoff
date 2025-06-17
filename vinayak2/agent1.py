# Set up logging
from langchain.agents import AgentType, initialize_agent
from langchain_groq import ChatGroq
from composio_langchain import ComposioToolSet, App
import os
from dotenv import load_dotenv
import requests
import logging
from datetime import datetime
from PIL import Image
import io
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
GROQ_API_KEY=os.getenv("GROQ_API_KEY")
os.environ["GROQ_API_KEY"] = GROQ_API_KEY
COMPOSIO_API_KEY=os.getenv("COMPOSIO_API_KEY")
os.environ["COMPOSIO_API_KEY"] = COMPOSIO_API_KEY


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize API keys and configurations
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not HUGGINGFACE_API_KEY:
    raise ValueError("HUGGINGFACE_API_KEY not found in environment variables")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Hugging Face API configuration
HF_API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev"
HF_HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

# Initialize LLM
llm = ChatGroq(model="llama-3.1-8b-instant")


# Define available actions
all_actions = [
    'GMAIL_SEND_EMAIL', 'GMAIL_FETCH_EMAILS', 'GOOGLEDOCS_CREATE_DOCUMENT', 'GOOGLEDOCS_GET_DOCUMENT_BY_ID',
    'GOOGLECALENDAR_FIND_EVENT', 'GOOGLECALENDAR_FIND_EVENT', 'GOOGLEMEET_CREATE_MEET',
    'GOOGLEMEET_GET_RECORDINGS_BY_CONFERENCE_RECORD_ID', 'GOOGLEMEET_GET_CONFERENCE_RECORD_FOR_MEET',
    'GOOGLEMEET_GET_MEET', 'GOOGLECALENDAR_CREATE_EVENT', 'GOOGLECALENDAR_FIND_FREE_SLOTS',
    'NOTION_INSERT_ROW_DATABASE', 'NOTION_QUERY_DATABASE', 'GOOGLECALENDAR_FIND_EVENT', 'GOOGLECALENDAR_QUICK_ADD',
    'GOOGLECALENDAR_DELETE_EVENT', 'GOOGLECALENDAR_UPDATE_EVENT', 'GOOGLECALENDAR_REMOVE_ATTENDEE',
    'GOOGLESHEETS_GET_SPREADSHEET_INFO', 'GOOGLESHEETS_CREATE_GOOGLE_SHEET1', 'GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW',
    'GOOGLESHEETS_SHEET_FROM_JSON', 'GOOGLESHEETS_CLEAR_VALUES', 'GOOGLESHEETS_BATCH_GET','GOOGLESHEETS_BATCH_UPDATE',
    'GOOGLEDRIVE_GOOGLE_DRIVE_CHANGES', 'GOOGLEDRIVE_FIND_FILE', 'GOOGLEDRIVE_CREATE_FILE_FROM_TEXT',
    'GOOGLEDRIVE_FIND_FOLDER', 'GOOGLEDRIVE_CREATE_FOLDER', 'GOOGLEDRIVE_UPLOAD_FILE',
    'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE', 'GOOGLEDRIVE_EDIT_FILE', 'GOOGLEDRIVE_COPY_FILE',
    'GOOGLEDRIVE_DELETE_FOLDER_OR_FILE', 'GOOGLEDRIVE_DOWNLOAD_FILE', 'FIRECRAWL_MAP_URLS',
    'FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM', 'FIRECRAWL_CRAWL_URLS', 'FIRECRAWL_EXTRACT', 'FIRECRAWL_CANCEL_CRAWL_JOB',
    'FIRECRAWL_CRAWL_JOB_STATUS','YOUTUBE_SEARCH_YOU_TUBE', 'YOUTUBE_VIDEO_DETAILS','YOUTUBE_LIST_CAPTION_TRACK','YOUTUBE_VIDEO_DETAILS','YOUTUBE_LOAD_CAPTIONS','YOUTUBE_SEARCH_YOU_TUBE',
     'TWITTER_MEDIA_UPLOAD_MEDIA','TWITTER_MEDIA_UPLOAD_MEDIA','TWITTER_CREATION_OF_A_POST','TWITTER_FOLLOW_USER','TWITTER_UNFOLLOW_USER','TWITTER_GET_USER_S_FOLLOWED_LISTS','TWITTER_FOLLOWERS_BY_USER_ID'
]




def clarify_ambiguous_task(task):
    """Identifies and clarifies ambiguous instructions in the task."""
    prompt = f"""
    Analyze this task and identify any ambiguities or missing specifics that might lead to errors.
    
    Task: {task}
    
    Check for:
    1. Document sharing instructions (prefer links over attachments)
    2. Calendar event details (time, duration, participants)
    3. Email specifics (recipients, subject)
    4. Drive file handling preferences
    5. Any other ambiguous instructions
    
    If ambiguities exist, provide a clarified version of the task with appropriate defaults.
    If the task is clear enough, simply return "TASK_IS_CLEAR"
    
    Format response as:
    Ambiguities: [list specific ambiguities found]
    Clarified_Task: [improved version with added specifics]
    """
    
    response = llm.invoke(prompt)
    print("response from llm is as follows:",response)
    response_text = response.content.strip()
    
    if "TASK_IS_CLEAR" in response_text:
        return task
    
    lines = response_text.split('\n')
    clarified_task = ""
    
    for line in lines:
        if line.startswith("Clarified_Task:"):
            clarified_task = line.replace("Clarified_Task:", "").strip()
            break
    
    return clarified_task if clarified_task else task

def generate_spicy_caption(task, image_prompt):
    """Generate an engaging caption using Gemini."""
    try:
        prompt = f"""
        Generate a spicy, engaging, and viral-worthy tweet caption for a social media post.
        
        Context:
        - Task: {task}
        - Image Description: {image_prompt}
        
        Requirements:
        - Make it witty and attention-grabbing
        - Include relevant hashtags
        - Keep it under 280 characters
        - Make it shareable and engaging
        - Add emojis where appropriate
        
        Give me only the caption text without any explanations or additional context.
        """
        
        response = model.generate_content(prompt)
        caption = response.text.strip()
        logger.info(f"Generated caption: {caption}")
        return caption
        
    except Exception as e:
        logger.error(f"Error generating caption: {str(e)}")
        return None

def analyze_task_requirements(task):
    """Analyze if task needs image and generate appropriate prompt."""
    prompt = f"""
    Analyze this task and determine:
    1. If it requires a Twitter media upload (respond with only 'Yes' or 'No')
    2. If yes, provide a detailed image generation prompt that would create an engaging image for this tweet
    
    Task: {task}
    
    Format your response exactly like this:
    Needs_Image: [Yes/No]
    Image_Prompt: [your prompt here if needed, otherwise leave blank]
    """
    
    response = llm.invoke(prompt)
    response_text = response.content.strip().split('\n')
    
    needs_image = False
    image_prompt = None
    
    for line in response_text:
        if line.startswith("Needs_Image:"):
            needs_image = line.split(': ')[1].lower() == 'yes'
        elif line.startswith("Image_Prompt:"):
            image_prompt = line.replace("Image_Prompt:", "").strip()
    
    return needs_image, image_prompt

def generate_and_save_image(prompt):
    """Generate image from text and save it as PNG."""
    try:
        logger.info(f"Generating image with prompt: {prompt}")
        
        response = requests.post(
            HF_API_URL,
            headers=HF_HEADERS,
            json={"inputs": prompt},
            timeout=300
        )
        
        if response.status_code != 200:
            logger.error(f"Image generation failed with status code: {response.status_code}")
            return None
            
        image = Image.open(io.BytesIO(response.content))
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        folder_path = "vinayak2/generated_images"
        os.makedirs(folder_path, exist_ok=True)
        filename = f"{folder_path}/generated_image_{timestamp}.png"
        
        image.save(filename, "PNG")
        logger.info(f"Image saved as: {filename}")
        return filename
        
    except Exception as e:
        logger.error(f"Error generating image: {str(e)}")
        return None

def get_required_actions(task, needs_image):
    """Determine required actions for a given task with edge case handling."""
    base_prompt = f""" 
    Given the following task, determine the required actions from the available actions list.
    Task: {task}
    Available Actions: {', '.join(all_actions)}
    
    IMPORTANT EDGE CASE HANDLING:
    1. For Google Docs: Always use GOOGLEDOCS_CREATE_DOCUMENT and then get sharing link - never attach documents directly
    2. For Calendar events: Always include GOOGLECALENDAR_CREATE_EVENT and GOOGLECALENDAR_FIND_FREE_SLOTS if time isn't specified
    3. For Drive files: Prioritize GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE to ensure proper sharing
    4. For emails: If attachments are mentioned, verify if links would be better
    5. For Twitter: Check if media upload is needed based on context
    
    FORMAT: Return ONLY the action names in a JSON array format like: ["ACTION1", "ACTION2"]
    Ensure that the actions are strictly from the provided Available Actions list.
    """
    
    if needs_image:
        base_prompt += "\nNote: This task requires TWITTER_MEDIA_UPLOAD_MEDIA for image handling."
    
    response = llm.invoke(base_prompt)
    print("this is the main output:", response)
    response_text = response.content
    
    # Extract actions using more robust pattern matching
    import re
    import json
    
    # Try to extract a JSON array first
    try:
        match = re.search(r'\[.*?\]', response_text, re.DOTALL)
        if match:
            actions_list = json.loads(match.group(0))
            # Filter to ensure actions are in all_actions
            valid_actions = [action for action in actions_list if action in all_actions]
            return valid_actions
    except:
        pass
    
    # Fallback: extract any action names that appear in the response
    valid_actions = []
    for action in all_actions:
        if action in response_text:
            valid_actions.append(action)
    
    return valid_actions

def generate_agent_instructions(task, required_actions):
    """Generate specific instructions for the agent based on task context and edge cases."""
    prompt = f"""
    Create detailed instructions for the agent handling this task:
    
    Task: {task}
    Required Actions: {', '.join(required_actions)}
    
    Include specific handling instructions for:
    
    1. Google Docs: Always generate sharing links instead of file attachments
    2. Google Calendar: 
       - Include start and end times with buffer
       - Add notifications 10 minutes before events
       - Specify time zone if not mentioned
    3. Google Drive:
       - Set appropriate sharing permissions (view/edit)
       - Organize files in logical folders
    4. Email:
       - Use link sharing for any documents instead of attachments
       - Ensure subject lines are descriptive
    5. Any other service-specific best practices
    
    Format as clear, step-by-step instructions.
    """
    
    response = llm.invoke(prompt)
    instructions = response.content.strip()
    return instructions

def process_social_media_task(task):
    """Process social media task with automatic image and caption generation if needed."""
    try:
        # First, clarify any ambiguous instructions
        original_task = task
        clarified_task = clarify_ambiguous_task(task)
        if clarified_task != task:
            logger.info(f"Task clarified from: '{task}' to: '{clarified_task}'")
            task = clarified_task

        # Analyze task requirements
        needs_image, image_prompt = analyze_task_requirements(task)
        logger.info(f"Task analysis - Needs image: {needs_image}, Prompt: {image_prompt}")

        # Generate image if needed
        image_path = None
        caption = None
        if needs_image and image_prompt:
            image_path = generate_and_save_image(image_prompt)
            if not image_path:
                logger.error("Failed to generate required image")
                return False, None
                
            # Generate spicy caption using Gemini
            caption = generate_spicy_caption(task, image_prompt)
            if not caption:
                logger.warning("Failed to generate caption, proceeding with original task")

        # Get required actions
        required_actions = get_required_actions(task, needs_image)
        logger.info(f"Required actions: {required_actions}")
        
        # Generate specific agent instructions
        agent_instructions = generate_agent_instructions(task, required_actions)
        logger.info(f"Generated agent instructions: {agent_instructions}")

        # Initialize Composio tools
        composio_toolset = ComposioToolSet()
        tools = composio_toolset.get_tools(actions=required_actions)

        # Create and initialize agent
        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )

        # Prepare final task with all details
        final_task = f"""
        Task: {task}
        
        IMPORTANT INSTRUCTIONS:
        {agent_instructions}
        
        """
        
        # Add image and caption if generated
        if image_path:
            final_task += f"\nIMAGE FILE: {image_path}"
            if caption:
                final_task += f"\nSUGGESTED CAPTION: {caption}"
                
        # Add edge case handling reminders
        final_task += """
        
        REMEMBER THESE IMPORTANT GUIDELINES:
        - For Google Docs: Always share links, NEVER send file attachments
        - For Calendar events: Always specify time, duration, and attendees
        - For Drive files: Always set appropriate sharing permissions
        - For Emails: Use clear subject lines and prefer links over attachments
        - For Twitter: Make content engaging and properly formatted
        """

        # Execute the task
        result = agent.run(final_task)
        logger.info(f"Task completed: {result}")
        
        # Check if the original task was clarified
        if original_task != task:
            result = f"NOTE: Your task was clarified for better execution.\nOriginal: '{original_task}'\nClarified: '{task}'\n\n{result}"
            
        return True, result

    except Exception as e:
        logger.error(f"Error processing task: {str(e)}")
        return False, str(e)

def handle_retry_with_feedback(task, error_message):
    """Handle task retry with feedback about what went wrong."""
    try:
        prompt = f"""
        This task failed with the following error:
        Error: {error_message}
        
        Analyze the task and suggest modifications to make it succeed:
        Task: {task}
        
        Provide:
        1. The likely cause of failure
        2. A modified version of the task that should work
        """
        
        response = llm.invoke(prompt)
        analysis = response.content.strip()
        
        # Extract modified task if possible
        modified_task = task
        for line in analysis.split('\n'):
            if "modified task" in line.lower() or "revised task" in line.lower():
                modified_task = line.split(":", 1)[1].strip() if ":" in line else line
                break
        
        return {
            "original_task": task,
            "error": error_message,
            "analysis": analysis,
            "suggested_task": modified_task
        }
        
    except Exception as e:
        logger.error(f"Error in retry handler: {str(e)}")
        return {
            "original_task": task,
            "error": error_message,
            "analysis": "Could not analyze the error",
            "suggested_task": task
        }

app = Flask(__name__)
CORS(app)

CORS(app)


from flask import jsonify
import google.generativeai as genai
import json

def detect_language(text, model):
    """Detects the language of the input text using Gemini."""
    prompt = f"""
    Identify the language of this text. If it's an Indian language, specify which one.
    Only return the language name, nothing else.
    
    Text: {text}
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()

def translate_task_to_original(task_description, original_language, model):
    """Translates a task description back to the original language."""
    prompt = f"""
    Translate this task description to {original_language}. 
    Maintain all specific details like dates, times, names, and numbers.
    Only return the translated text, nothing else.
    
    Text: {task_description}
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()

def translate_to_english(text, model):
    """Translates Indian language text to English while preserving key information."""
    prompt = f"""
    Translate the following text to English while preserving all key information,
    especially any mentions of dates, times, files, or action items:

    {text}

    Provide only the English translation, nothing else.
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()

import json

def analyze_tasks(text, model):
    json_structure = '''[
    {
        "agent": "agent_name",
        "task_description": "Detailed description of the task",
        "priority": "high/medium/low",
        "dependencies": [],
        "extracted_details": {
            "dates": [],
            "times": [],
            "people": [],
            "locations": []
        }
    }
]'''

    print("text is as follows:", text)
    print("model is as follows:", model)
    prompt = f"""
Analyze the following text and extract specific actionable tasks that can be assigned to our specialized agents.Try to get atleast 2-3 agents as we need to show in ui

### Input Text:
{text}

### Available Agents & Their Capabilities:
1. **Calendar Agent**
   - Schedule meetings and events
   - Find available time slots
   - Manage event attendees

2. **Gmail Agent**
   - Send emails
   - Fetch and read emails
   - Manage email threads

3. **Google Docs Agent**
   - Create new documents
   - Share and retrieve document content

4. **Google Drive Agent**
   - Create folders
   - Upload and share files
   - Manage file permissions

5. **Google Sheets Agent**
   - Create and update spreadsheets
   - Read spreadsheet content

6. **Twitter Agent**
   - Create posts (including images)
   - Follow/unfollow users
   - Retrieve user details

7. **YouTube Agent**
   - Search videos
   - Fetch video details
   - Access video captions

### Task Extraction Instructions:
- Identify tasks explicitly matching the agents' capabilities.
- For each task, provide:
  1. **Assigned Agent**
  2. **Detailed Task Description**
  3. **Relevant Details** (dates, times, people, locations, etc.)
  4. **Task Dependencies** (if applicable)

Return the response in valid JSON format with the following structure:
{json_structure}"""

    print("prompt is as follows:", prompt)
    response = model.generate_content(prompt)
    print("response from model is as follows:", response)
    
    try:
        # Extract just the JSON content from the response
        response_text = response.text
        # Find the JSON part between triple backticks if present
        if "```json" in response_text:
            json_start = response_text.find("```json\n") + 8
            json_end = response_text.rfind("```")
            response_text = response_text[json_start:json_end].strip()
        
        # Parse the cleaned JSON
        parsed_response = json.loads(response_text)
        return parsed_response
    except json.JSONDecodeError as e:
        return {
            "error": "Could not parse tasks",
            "raw_response": response.text,
            "parse_error": str(e)
        }
    except Exception as e:
        return {
            "error": "Unexpected error while processing tasks",
            "raw_response": response.text,
            "error_details": str(e)
        }

@app.route('/analyze_transcript', methods=['POST'])
def analyze_transcript():
    try:
        data = request.json
        transcript = data.get('transcript')
        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400
            
        # Initialize Gemini
        model = genai.GenerativeModel('gemini-pro')
        print("hello")
        # Detect original language
        original_language = detect_language(transcript, model)
        logger.info("Original language detected: %s", original_language)
        print("original language detected is as follows:",original_language)
        # Translate to English if not already in English
        english_text = transcript if original_language.lower() == 'english' else translate_to_english(transcript, model)
        logger.info("English translation: %s", english_text)
        print("english translation is as follows:",english_text)
        # Analyze the English text
        tasks = analyze_tasks(english_text, model)
        logger.info("Tasks identified: %s", tasks)
        print("tasks identified are as follows:",tasks)
        if isinstance(tasks, dict) and "error" in tasks:
            return jsonify({
                "error": "Task analysis failed",
                "details": tasks["error"],
                "original_transcript": transcript,
                "language": original_language,
                "english_translation": english_text
            }), 500
        
        # Enrich tasks with translations and additional context
        enriched_tasks = []
        for task in tasks:
            agent_type = task["agent"].lower().replace(" agent", "")
            
            # Get appropriate actions for this agent
            if agent_type == "calendar":
                actions = ['GOOGLECALENDAR_CREATE_EVENT', 'GOOGLECALENDAR_FIND_FREE_SLOTS']
            elif agent_type == "gmail":
                actions = ['GMAIL_SEND_EMAIL', 'GMAIL_FETCH_EMAILS']
            elif agent_type == "docs":
                actions = ['GOOGLEDOCS_CREATE_DOCUMENT', 'GOOGLEDOCS_GET_DOCUMENT_BY_ID']
            elif agent_type == "drive":
                actions = ['GOOGLEDRIVE_FIND_FILE', 'GOOGLEDRIVE_CREATE_FILE_FROM_TEXT', 
                          'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE']
            elif agent_type == "sheets":
                actions = ['GOOGLESHEETS_CREATE_GOOGLE_SHEET1', 'GOOGLESHEETS_BATCH_UPDATE']
            elif agent_type == "twitter":
                actions = ['TWITTER_MEDIA_UPLOAD_MEDIA', 'TWITTER_CREATION_OF_A_POST']
            elif agent_type == "youtube":
                actions = ['YOUTUBE_SEARCH_YOU_TUBE', 'YOUTUBE_VIDEO_DETAILS']
            else:
                actions = []
            
            # Translate task description back to original language if not English
            original_language_description = (
                task["task_description"] 
                if original_language.lower() == 'english'
                else translate_task_to_original(task["task_description"], original_language, model)
            )
            
            enriched_task = {
                **task,
                "task_description_original": original_language_description,
                "task_description_english": task["task_description"],
                "required_actions": actions,
                "endpoint": f"/process_{agent_type}_task",
                "validation_status": validate_task_for_agent(task["task_description"], agent_type)
            }
            enriched_tasks.append(enriched_task)
        
        return jsonify({
            "transcript_info": {
                "original_text": transcript,
                "detected_language": original_language,
                "english_translation": english_text
            },
            "tasks": {
                "count": len(enriched_tasks),
                "items": enriched_tasks
            },
            "metadata": {
                "processing_timestamp": datetime.now().isoformat(),
                "service_version": "1.0"
            }
        }), 200
        
    except Exception as e:
        logger.error("Error processing transcript: %s", str(e))
        return jsonify({
            "error": "Failed to process transcript",
            "details": str(e)
        }), 500

@app.route('/process_task', methods=['POST'])
def process_task():
    print("entry")
    data = request.json
    task = data.get('task')
    print(task)
    if not task:
        return jsonify({"error": "Task is required"}), 400

    success, result = process_social_media_task(task)
    if success:
        return jsonify({"result": result}), 200
    else:
        # Handle failure with retry suggestions
        retry_info = handle_retry_with_feedback(task, result)
        return jsonify({
            "error": "Task failed to complete",
            "original_task": retry_info["original_task"],
            "error_details": retry_info["error"],
            "analysis": retry_info["analysis"],
            "suggested_retry": retry_info["suggested_task"]
        }), 500

def validate_task_for_agent(task, agent_type):
    """Validate if the task is appropriate for the specified agent type."""
    prompt = f"""
    Determine if the following task is appropriate for the {agent_type} agent.
    
    Task: {task}
    
    Respond with "YES" if the task is appropriate, otherwise respond with "NO".
    """
    
    response = llm.invoke(prompt)
    response_text = response.content.strip()
    return response_text.upper() == "YES"

@app.route('/process_calendar_task', methods=['POST'])
def process_calendar_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "calendar"):
        return jsonify({"error": "This task is not appropriate for the calendar agent"}), 400

    required_actions = ['GOOGLECALENDAR_CREATE_EVENT', 'GOOGLECALENDAR_FIND_FREE_SLOTS']
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

@app.route('/process_gmail_task', methods=['POST'])
def process_gmail_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "gmail"):
        return jsonify({"error": "This task is not appropriate for the gmail agent"}), 400

    required_actions = ['GMAIL_SEND_EMAIL', 'GMAIL_FETCH_EMAILS']
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

@app.route('/process_docs_task', methods=['POST'])
def process_docs_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "docs"):
        return jsonify({"error": "This task is not appropriate for the docs agent"}), 400

    required_actions = ['GOOGLEDOCS_CREATE_DOCUMENT', 'GOOGLEDOCS_GET_DOCUMENT_BY_ID']
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

@app.route('/process_drive_task', methods=['POST'])
def process_drive_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "drive"):
        return jsonify({"error": "This task is not appropriate for the drive agent"}), 400

    required_actions = [
        'GOOGLEDRIVE_FIND_FILE', 'GOOGLEDRIVE_CREATE_FILE_FROM_TEXT', 'GOOGLEDRIVE_FIND_FOLDER',
        'GOOGLEDRIVE_CREATE_FOLDER', 'GOOGLEDRIVE_UPLOAD_FILE', 'GOOGLEDRIVE_ADD_FILE_SHARING_PREFERENCE'
    ]
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

@app.route('/process_sheets_task', methods=['POST'])
def process_sheets_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "sheets"):
        return jsonify({"error": "This task is not appropriate for the sheets agent"}), 400

    required_actions = [
        'GOOGLESHEETS_GET_SPREADSHEET_INFO', 'GOOGLESHEETS_CREATE_GOOGLE_SHEET1', 'GOOGLESHEETS_LOOKUP_SPREADSHEET_ROW,GOOGLESHEETS_BATCH_UPDATE'
    ]
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

@app.route('/process_twitter_task', methods=['POST'])
def process_twitter_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "twitter"):
        return jsonify({"error": "This task is not appropriate for the twitter agent"}), 400

    # Always generate a new image for Twitter task
    image_prompt = f"Generate an engaging image for the following task: {task}"
    image_path = generate_and_save_image(image_prompt)
    if not image_path:
        logger.error("Failed to generate required image")
        return jsonify({"error": "Failed to generate required image"}), 500

    # Get caption
    caption = generate_spicy_caption(task, image_prompt)
    
    # Add image path to task description
    enhanced_task = f"{task}\n\nUse the generated image at path: {image_path}"
    if caption:
        enhanced_task += f"\nSuggested caption: {caption}"

    required_actions = ['TWITTER_MEDIA_UPLOAD_MEDIA','TWITTER_CREATION_OF_A_POST','TWITTER_FOLLOW_USER','TWITTER_UNFOLLOW_USER','TWITTER_GET_USER_S_FOLLOWED_LISTS','TWITTER_FOLLOWERS_BY_USER_ID']
    success, result = process_task_with_specific_actions(enhanced_task, required_actions)

    return jsonify({"result": result, "image_path": image_path}), 200 if success else 500

@app.route('/process_youtube_task', methods=['POST'])
def process_youtube_task():
    data = request.json
    task = data.get('task')
    if not task:
        return jsonify({"error": "Task is required"}), 400

    if not validate_task_for_agent(task, "youtube"):
        return jsonify({"error": "This task is not appropriate for the youtube agent"}), 400

    required_actions = ['YOUTUBE_SEARCH_YOU_TUBE', 'YOUTUBE_VIDEO_DETAILS','YOUTUBE_LIST_CAPTION_TRACK','YOUTUBE_VIDEO_DETAILS','YOUTUBE_LOAD_CAPTIONS','YOUTUBE_SEARCH_YOU_TUBE']
    success, result = process_task_with_specific_actions(task, required_actions)
    return jsonify({"result": result}), 200 if success else 500

def process_task_with_specific_actions(task, required_actions):
    """Process task with specified actions."""
    try:
        # Clarify task
        clarified_task = clarify_ambiguous_task(task)
        if clarified_task != task:
            task = clarified_task

        # Generate agent instructions
        agent_instructions = generate_agent_instructions(task, required_actions)

        # Initialize Composio tools
        composio_toolset = ComposioToolSet()
        tools = composio_toolset.get_tools(actions=required_actions)

        # Create and initialize agent
        agent = initialize_agent(
            tools,
            llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
            verbose=True
        )

        # Prepare final task with all details
        final_task = f"""
        Task: {task}
        
        IMPORTANT INSTRUCTIONS:
        {agent_instructions}
        """

        # Execute the task
        result = agent.run(final_task)
        return True, result

    except Exception as e:
        logger.error(f"Error processing task: {str(e)}")
        return False, str(e)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
