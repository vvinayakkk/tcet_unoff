
from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb+srv://harshitbhanushali22:DmqjI9LFL3VHH5EC@cluster0.ywfh9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
db = client['TCET2']
tasks_collection = db['tasks']

@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id parameter is required"}), 400

        # Convert string user_id to ObjectId
        user_id_obj = ObjectId(user_id)
        tasks = list(tasks_collection.find({"user_id": user_id_obj}))

        # Convert ObjectIds to strings for JSON serialization
        for task in tasks:
            task['_id'] = str(task['_id'])
            if 'agent_id' in task:
                task['agent_id'] = str(task['agent_id'])
            task['user_id'] = str(task['user_id'])

        return jsonify(tasks), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)


