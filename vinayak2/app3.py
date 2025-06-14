import os
from dotenv import load_dotenv
from langchain.agents import initialize_agent, AgentType
from langchain_google_genai import ChatGoogleGenerativeAI
from composio_langchain import ComposioToolSet, App
from composio.client.collections import TriggerEventData
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

# Set API keys
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")  # Google Gemini API key
os.environ["COMPOSIO_API_KEY"] = os.getenv("COMPOSIO_API_KEY")  # Composio API key

# Initialize Gemini LLM
llm = ChatGoogleGenerativeAI(model="gemini-pro")

# Initialize Composio Toolset
composio_toolset = ComposioToolSet()

# Add Gmail app to Composio Toolset
tools=composio_toolset.get_tools(apps=[App.gmail])

# Initialize Langchain agent
agent = initialize_agent(
    tools,
    llm=llm,
    agent_type=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True,
)

# Composio listener for Gmail triggers
listener = composio_toolset.create_trigger_listener()

@listener.callback(filters={"trigger_name": "gmail_new_gmail_message"})
def handle_gmail_message(event: TriggerEventData):
    """
    Callback function to handle new Gmail messages.
    """
    payload = event.payload
    subject = payload.get("subject", "No Subject")
    sender = payload.get("from", "Unknown Sender")
    body = payload.get("body", "No Body")

    # Print email details to CLI
    logging.info(f"New Email Received:\nFrom: {sender}\nSubject: {subject}\nBody: {body}")

    # Use Gemini to generate a response (optional)
    response = llm.invoke(f"Summarize this email: {body}")
    logging.info(f"Gemini Summary: {response}")

    # Example: Use Composio to send an email notification
    try:
        agent.run(
            f"Send an email to {os.getenv('EMAIL_RECEIVER')} with the subject 'New Email Notification' "
            f"and body 'You have received a new email from {sender} with the subject: {subject}'."
        )
        logging.info("Email notification sent successfully.")
    except Exception as e:
        logging.error(f"Failed to send email notification: {e}")

def main():
    """
    Main function to start the Composio listener.
    """
    logging.info("Starting Composio listener for Gmail triggers...")
    listener.listen()

if __name__ == "__main__":
    main()