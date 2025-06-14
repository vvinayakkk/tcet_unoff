from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain_google_genai import ChatGoogleGenerativeAI
from composio_langchain import ComposioToolSet
from langchain.prompts import PromptTemplate
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langchain_groq import ChatGroq
from datetime import datetime, timedelta
from langchain.prompts import MessagesPlaceholder
from langchain.schema.messages import SystemMessage
from langchain import hub
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from apscheduler.schedulers.background import BackgroundScheduler
from pathlib import Path
from dateutil import parser
import os
import json
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Constants
CSV_FILE_PATH = 'notion_mock_tasks.csv'
TEMPLATES_DIR = Path('templates')
ANALYSIS_FILE = 'analysis_results.json'

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize LangChain components
def initialize_llm_and_agents():
    """Initialize LLM and agent components with proper prompt"""
    try:
        # Initialize LLM
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            groq_api_key=os.getenv("GROQ_API_KEY")
        )
        
        # Initialize Gemini
        gemini = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        
        # Initialize Composio tools
        composio_toolset = ComposioToolSet(api_key=os.getenv("COMPOSIO_API_KEY"))
        tools = composio_toolset.get_tools(['NOTION_INSERT_ROW_DATABASE'])
        
        # Get the default agent prompt from LangChain hub
        prompt = hub.pull("hwchase17/openai-functions-agent")
        
        # Create system message
        system_message = SystemMessage(
            content="You are a helpful assistant that creates tasks in Notion. Be precise and follow the given format."
        )
        
        # Add system message to the prompt messages
        prompt.messages = [system_message] + list(prompt.messages)
        
        # Create the agent with the prompt
        agent = create_openai_functions_agent(
            llm=llm,
            tools=tools,
            prompt=prompt
        )
        
        # Create the executor
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True
        )
        
        return llm, gemini, agent_executor
        
    except Exception as e:
        logger.error(f"Error initializing agents: {str(e)}")
        raise

# Response schemas for task extraction
response_schemas = [
    ResponseSchema(
        name="name",
        description="The name or title of the task. Should be clear and concise."
    ),
    ResponseSchema(
        name="deadline",
        description="The deadline date in DD-MM-YYYY format. Convert relative dates based on current date."
    ),
    ResponseSchema(
        name="status",
        description="The current status of the task. Must be one of: ['Not Started', 'In Progress', 'Completed']"
    ),
    ResponseSchema(
        name="priority",
        description="The priority level of the task. Must be one of: ['High', 'Medium', 'Low']"
    ),
    ResponseSchema(
        name="category",
        description="The category of the task. Must be one of: ['Development', 'Design', 'Marketing', 'Documentation', 'Testing', 'Operations', 'Other']"
    )
]

output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

def get_current_context():
    """Get current date and time context"""
    now = datetime.now()
    return {
        'current_date': now.strftime('%d-%m-%Y'),
        'current_day': now.strftime('%A'),
        'current_time': now.strftime('%H:%M')
    }

def extract_task_info(email_body, gemini):
    """Extract task information from email body"""
    try:
        context = get_current_context()
        
        extraction_prompt = PromptTemplate(
            template="""
            Extract task information from this email:
            {email_body}
            
            Current Context:
            - Date: {current_date}
            - Day: {current_day}
            - Time: {current_time}
            
            {format_instructions}
            """,
            input_variables=["email_body", "current_date", "current_day", "current_time"],
            partial_variables={"format_instructions": output_parser.get_format_instructions()}
        )
        
        prompt_input = extraction_prompt.format(
            email_body=email_body,
            **context
        )
        
        response = gemini.invoke(prompt_input)
        extracted_data = output_parser.parse(response.content)
        logger.info(f"Successfully extracted task info: {extracted_data['name']}")
        return extracted_data
        
    except Exception as e:
        logger.error(f"Error extracting task info: {str(e)}")
        raise

def save_to_csv(task_data):
    """Save task data to CSV file"""
    try:
        df = pd.DataFrame([task_data])
        df.to_csv(CSV_FILE_PATH, mode='a', header=not os.path.exists(CSV_FILE_PATH), index=False)
        logger.info(f"Successfully saved task to CSV: {task_data['name']}")
    except Exception as e:
        logger.error(f"Error saving to CSV: {str(e)}")
        raise

def generate_task_analysis():
    """Generate comprehensive task analysis"""
    try:
        if not os.path.exists(CSV_FILE_PATH):
            logger.warning("No tasks found in CSV file")
            return None

        df = pd.read_csv(CSV_FILE_PATH)
        
        # Parse dates
        df['Deadline'] = pd.to_datetime(df['Deadline'], format='%d-%m-%Y', errors='coerce')
        df = df.dropna(subset=['Deadline'])
        
        df['Days_to_Deadline'] = (df['Deadline'] - pd.Timestamp.now()).dt.days

        # Generate graphs
        graphs = generate_enhanced_graphs(df)
        
        # Generate insights
        insights = {
            'total_tasks': len(df),
            'urgent_tasks': len(df[df['Days_to_Deadline'] <= 3]),
            'overdue_tasks': len(df[df['Days_to_Deadline'] < 0]),
            'tasks_by_status': df['Status'].value_counts().to_dict(),
            'tasks_by_priority': df['Priority'].value_counts().to_dict(),
            'tasks_by_category': df['Category'].value_counts().to_dict()
        }
        
        return {'graphs': graphs, 'insights': insights}
        
    except Exception as e:
        logger.error(f"Error generating task analysis: {str(e)}")
        raise

def generate_enhanced_graphs(df):
    """Generate enhanced visualization graphs"""
    if df.empty:
        return {}

    graphs = {}
    
    # Distribution Sunburst
    fig_distribution = px.sunburst(
        df,
        path=['Category', 'Priority', 'Status'],
        values='Days_to_Deadline',
        color='Priority',
        color_discrete_map={'High': '#ff4d4d', 'Medium': '#ffd966', 'Low': '#63c765'}
    )
    
    # Timeline
    fig_timeline = px.scatter(
        df,
        x='Deadline',
        y='Category',
        color='Priority',
        symbol='Status',
        hover_data=['Name']
    )
    
    # Convert figures to HTML
    graphs = {
        'distribution': fig_distribution.to_html(full_html=False, include_plotlyjs=False),
        'timeline': fig_timeline.to_html(full_html=False, include_plotlyjs=False)
    }
    
    return graphs

@app.route('/api/analysis')
def get_analysis():
    """Get the latest task analysis insights from stored results"""
    try:
        analysis = load_analysis_results()
        if not analysis:
            # If stored analysis doesn't exist, generate new one
            analysis = generate_task_analysis()
            store_analysis_results(analysis)
        return jsonify(analysis.get('insights_json', {})), 200
    except Exception as e:
        logger.error(f"Error getting analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/tasks', methods=['POST'])
def create_task():
    """Create a new task from email body"""
    try:
        data = request.json
        if 'email_body' not in data:
            return jsonify({'error': 'Missing email_body in request'}), 400
        
        # Initialize components
        _, gemini, agent_executor = initialize_llm_and_agents()
        
        # Extract task information
        extracted_info = extract_task_info(data['email_body'], gemini)
        
        # Save to CSV
        save_to_csv(extracted_info)
        
        # Create Notion task
        notion_prompt = f"""
        Create a new task in Notion with these details:
        Name: {extracted_info['name']}
        Deadline: {extracted_info['deadline']}
        Status: {extracted_info['status']}
        Priority: {extracted_info['priority']}
        Category: {extracted_info['category']}
        Database ID: {os.getenv('NOTION_DATABASE_ID')}
        """
        
        result = agent_executor.invoke({"input": notion_prompt})
        
        # Log the result for debugging
        logger.info(f"Notion task creation result: {result}")
        
        return jsonify({
            'message': 'Task created successfully',
            'extracted_info': extracted_info,
            'notion_result': result
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/recent', methods=['GET'])
def get_recent_tasks():
    """Get the 5 most recently added tasks"""
    try:
        if not os.path.exists(CSV_FILE_PATH):
            return jsonify({'error': 'No tasks found'}), 404
        
        df = pd.read_csv(CSV_FILE_PATH)
        last_five = df.tail(5).to_dict('records')
        
        return jsonify({
            'count': len(last_five),
            'tasks': last_five
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching recent tasks: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_name>', methods=['GET'])
def get_task_by_name(task_name):
    """Get task details by task name"""
    try:
        if not os.path.exists(CSV_FILE_PATH):
            return jsonify({'error': 'No tasks found'}), 404
        
        df = pd.read_csv(CSV_FILE_PATH)
        task = df[df['Name'].str.lower() == task_name.lower()]
        
        if task.empty:
            return jsonify({'error': 'Task not found'}), 404
        
        task_details = task.to_dict('records')[0]
        
        return jsonify(task_details), 200
        
    except Exception as e:
        logger.error(f"Error fetching task by name: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/dashboard')
def dashboard():
    """Render the dashboard template"""
    try:
        analysis = generate_task_analysis()
        if not analysis:
            return "No data available", 404
        
        return render_template(
            'dashboard.html',
            graphs=analysis['graphs'],
            insights=analysis['insights'],
            last_updated=datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        
    except Exception as e:
        logger.error(f"Error rendering dashboard: {str(e)}")
        return str(e), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(
    func=generate_task_analysis,
    trigger="interval",
    hours=6,
    id='task_analysis_job'
)

def initialize_app():
    """Initialize application components"""
    try:
        # Create necessary directories
        TEMPLATES_DIR.mkdir(exist_ok=True)
        
        # Initialize CSV file if it doesn't exist
        if not os.path.exists(CSV_FILE_PATH):
            pd.DataFrame(columns=['Name', 'Deadline', 'Status', 'Priority', 'Category']).to_csv(CSV_FILE_PATH, index=False)
        
        # Start the scheduler
        scheduler.start()
        
        logger.info("Application initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing application: {str(e)}")
        raise



if __name__ == '__main__':
    initialize_app()
    app.run(debug=True, port=8080)