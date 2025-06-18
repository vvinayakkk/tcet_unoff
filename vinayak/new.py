from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import base64
import pymongo
from bson.objectid import ObjectId
import os
import datetime

app = Flask(__name__)
CORS(app)

# MongoDB setup
mongo_uri = "mongodb+srv://harshitbhanushali22:DmqjI9LFL3VHH5EC@cluster0.ywfh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(mongo_uri)
db = client["imagebot"]
conversations = db["conversations"]

# Gemini API setup
genai_client = genai.Client(api_key="AIzaSyDlONrBUFjXGjRJ9Q2EcXaANSszSB6wwyU")
model = "gemini-2.0-flash-exp-image-generation"

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    conversation_id = data.get('conversationId')
    message = data.get('message')
    image_data = data.get('image')  # base64 image if provided
    
    # Create a new conversation if none exists
    if not conversation_id:
        conversation = {
            "messages": [],
            "created_at": datetime.datetime.now()
        }
        result = conversations.insert_one(conversation)
        conversation_id = str(result.inserted_id)
    
    # Store user message
    user_message = {
        "role": "user",
        "content": message,
        "timestamp": datetime.datetime.now()
    }
    
    # Add image to message if provided
    if image_data:
        # Remove data URL prefix if present
        if "base64," in image_data:
            image_data = image_data.split("base64,")[1]
        
        user_message["image"] = image_data
    
    # Add message to conversation
    conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$push": {"messages": user_message}}
    )
    
    # Retrieve conversation history
    conversation = conversations.find_one({"_id": ObjectId(conversation_id)})
    history = []
    if conversation and "messages" in conversation:
        for msg in conversation["messages"]:
            if "content" in msg:
                history.append(msg["content"])  # Extract only the content field
    
    # Process with Gemini
    try:
        contents = history + [message]  # Include history and current message as strings
        
        # Add image to request if provided
        if image_data:
            image_bytes = BytesIO(base64.b64decode(image_data))
            pil_image = Image.open(image_bytes)
            contents.append(pil_image)  # Append the image as an object
        
        response = genai_client.models.generate_content(
            model=model,
            contents=contents,  # Ensure contents is a list of strings or images
            config=types.GenerateContentConfig(
                response_modalities=['Text', 'Image']
            )
        )
        
        # Process response
        ai_message = {
            "role": "assistant",
            "content": "",
            "timestamp": datetime.datetime.now()
        }
        
        for part in response.candidates[0].content.parts:
            if part.text is not None:
                ai_message["content"] = part.text
            elif part.inline_data is not None:
                # Convert image to base64
                image_bytes = BytesIO(part.inline_data.data)
                image = Image.open(image_bytes)
                buffered = BytesIO()
                image.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
                ai_message["image"] = img_str
        
        # Store AI response
        conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$push": {"messages": ai_message}}
        )
        
        return jsonify({
            "success": True,
            "conversationId": conversation_id,
            "response": ai_message
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "conversationId": conversation_id
        }), 500

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    all_conversations = list(conversations.find({}, {"messages": {"$slice": 1}}))
    for conv in all_conversations:
        conv["_id"] = str(conv["_id"])
    
    return jsonify({
        "success": True,
        "conversations": all_conversations
    })

@app.route('/api/conversation/<conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    conversation = conversations.find_one({"_id": ObjectId(conversation_id)})
    if conversation:
        conversation["_id"] = str(conversation["_id"])
        return jsonify({
            "success": True,
            "conversation": conversation
        })
    else:
        return jsonify({
            "success": False,
            "error": "Conversation not found"
        }), 404

if __name__ == '__main__':
    app.run(debug=True)