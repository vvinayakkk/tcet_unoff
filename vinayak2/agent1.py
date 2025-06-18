from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain.agents import AgentType, initialize_agent
from langchain_groq import ChatGroq
from composio_langchain import ComposioToolSet
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Load environment variables
load_dotenv()

# Check if environment variables are set
if not os.getenv("GROQ_API_KEY") or not os.getenv("COMPOSIO_API_KEY"):
    raise ValueError("Please set GROQ_API_KEY and COMPOSIO_API_KEY in your environment or .env file")

# Initialize the LLM
llm = ChatGroq(model="llama-3.3-70b-versatile")

# Get Composio tools
composio_toolset = ComposioToolSet()
tools = composio_toolset.get_tools(actions=[
    'GMAIL_SEND_EMAIL', 
    'GMAIL_FETCH_EMAILS',
    'GOOGLEDOCS_CREATE_DOCUMENT', 
    'GOOGLEDOCS_GET_DOCUMENT_BY_ID',
    'TWITTER_CREATION_OF_A_POST',
    'GOOGLESHEETS_CREATE_GOOGLE_SHEET1', 
    'GOOGLESHEETS_GET_SPREADSHEET_INFO',
    'GOOGLECALENDAR_CREATE_EVENT', 
    'GOOGLECALENDAR_FIND_FREE_SLOTS', 
    'GOOGLECALENDAR_FIND_EVENT', 
    'GOOGLECALENDAR_QUICK_ADD'
])

# Create agent
agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

@app.route('/process_task', methods=['POST'])
def run_agent():
    data = request.json
    if not data or 'task' not in data:
        return jsonify({"error": "Task is required"}), 400
    
    task = data['task']
    try:
        # Run the agent with the task
        result = agent.run(task)
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)