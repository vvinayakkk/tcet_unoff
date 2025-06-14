# app.py
from flask import Flask, request, jsonify
import requests
import json
import re
import time
from datetime import datetime
import logging
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Instagram GraphQL API endpoint for public data
INSTAGRAM_GRAPHQL_URL = "https://www.instagram.com/graphql/query/"

def get_headers():
    """Generate headers that mimic a browser request"""
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.instagram.com/",
        "X-IG-App-ID": "936619743392459",  # Instagram's web app ID
        "X-Requested-With": "XMLHttpRequest"
    }

def get_user_id(username):
    """Get the Instagram user ID from a username"""
    try:
        response = requests.get(f"https://www.instagram.com/{username}/", headers=get_headers())
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch profile page: Status {response.status_code}")
            return None
            
        # Extract the JSON data embedded in the HTML response
        json_match = re.search(r'window\._sharedData = (.+?);</script>', response.text)
        if not json_match:
            logger.error("Failed to extract shared data from Instagram response")
            return None
            
        shared_data = json.loads(json_match.group(1))
        
        # Extract user ID from shared data
        try:
            user_id = shared_data['entry_data']['ProfilePage'][0]['graphql']['user']['id']
            return user_id
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to extract user ID: {str(e)}")
            return None
            
    except Exception as e:
        logger.error(f"Error in get_user_id: {str(e)}")
        return None

@app.route('/api/instagram/profile', methods=['GET'])
def get_profile_data():
    """Get public profile data for an Instagram account"""
    username = request.args.get('username')
    print("username:", username)
    
    if not username:
        return jsonify({"error": "Username parameter is required"}), 400
        
    try:
        # First, fetch the profile page to extract metadata
        response = requests.get(f"https://www.instagram.com/{username}/", headers=get_headers())
    
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch profile. Status: {response.status_code}"}), response.status_code
            
        # Extract the JSON data embedded in the HTML response
        json_match = re.search(r'window\._sharedData = (.+?);</script>', response.text)
        print("json_match:", json_match)
        if not json_match:
            return jsonify({"error": "Failed to extract data from Instagram response"}), 500
            
        shared_data = json.loads(json_match.group(1))
        print("shared_data:", shared_data)
        try:
            print("shared_data:", shared_data)
            # Extract user data from shared data
            user_data = shared_data['entry_data']['ProfilePage'][0]['graphql']['user']
            print("user_data:", user_data)
            # Format profile data
            profile_data = {
                "username": user_data.get('username', ''),
                "full_name": user_data.get('full_name', ''),
                "biography": user_data.get('biography', ''),
                "profile_pic_url": user_data.get('profile_pic_url_hd', user_data.get('profile_pic_url', '')),
                "external_url": user_data.get('external_url', ''),
                "is_private": user_data.get('is_private', False),
                "is_verified": user_data.get('is_verified', False),
                "media_count": user_data.get('edge_owner_to_timeline_media', {}).get('count', 0),
                "followers_count": user_data.get('edge_followed_by', {}).get('count', 0),
                "following_count": user_data.get('edge_follow', {}).get('count', 0)
            }
            
            return jsonify(profile_data)
            
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to extract profile data: {str(e)}")
            return jsonify({"error": "Failed to extract profile data"}), 500
            
    except Exception as e:
        logger.error(f"Error fetching profile data: {str(e)}")
        return jsonify({"error": f"Error fetching profile data: {str(e)}"}), 500

@app.route('/api/instagram/posts', methods=['GET'])
def get_posts_data():
    """Get public posts data for an Instagram account"""
    username = request.args.get('username')
    limit = request.args.get('limit', default=12, type=int)
    
    if not username:
        return jsonify({"error": "Username parameter is required"}), 400
        
    try:
        # Get user ID first
        user_id = get_user_id(username)
        if not user_id:
            return jsonify({"error": "Could not retrieve user ID"}), 404
            
        # Query variables
        variables = {
            "id": user_id,
            "first": limit  # Number of posts to fetch
        }
        
        # Query hash for user media
        query_hash = "69cba40317214236af40e7efa697781d"  # This may need periodic updates
        
        # Construct request URL
        url = f"{INSTAGRAM_GRAPHQL_URL}?query_hash={query_hash}&variables={json.dumps(variables)}"
        
        # Make the request
        response = requests.get(url, headers=get_headers())
        
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch posts. Status: {response.status_code}"}), response.status_code
            
        data = response.json()
        
        # Extract media edges from the response
        try:
            edges = data['data']['user']['edge_owner_to_timeline_media']['edges']
            
            # Process each post
            posts = []
            for edge in edges:
                node = edge['node']
                
                post = {
                    "id": node.get('id', ''),
                    "shortcode": node.get('shortcode', ''),
                    "display_url": node.get('display_url', ''),
                    "thumbnail_url": node.get('thumbnail_src', ''),
                    "is_video": node.get('is_video', False),
                    "likes_count": node.get('edge_liked_by', {}).get('count', 0),
                    "comments_count": node.get('edge_media_to_comment', {}).get('count', 0),
                    "caption": node.get('edge_media_to_caption', {}).get('edges', [{}])[0].get('node', {}).get('text', '') if node.get('edge_media_to_caption', {}).get('edges') else '',
                    "timestamp": node.get('taken_at_timestamp', 0),
                    "location": node.get('location', {}).get('name', '') if node.get('location') else '',
                    "accessibility_caption": node.get('accessibility_caption', '')
                }
                
                posts.append(post)
                
            return jsonify(posts)
            
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to extract posts data: {str(e)}")
            return jsonify({"error": "Failed to extract posts data"}), 500
            
    except Exception as e:
        logger.error(f"Error fetching posts data: {str(e)}")
        return jsonify({"error": f"Error fetching posts data: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)