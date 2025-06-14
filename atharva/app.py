from flask import Flask, request, jsonify
from speechbrain.inference.classifiers import EncoderClassifier
from werkzeug.utils import secure_filename
import os
import subprocess
import logging
import requests
from flask_cors import CORS


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
# Update allowed extensions to include webm
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'wav', 'mp3', 'm4a', 'flac', 'ogg', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize the language identification model
language_id = None

def load_model():
    global language_id
    if language_id is None:
        language_id = EncoderClassifier.from_hparams(
            source="speechbrain/lang-id-voxlingua107-ecapa",
            savedir="tmp"
        )

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_language_name(lang_code_and_name):
    """Extract just the language name from the format 'code: Name'"""
    return lang_code_and_name.split(': ')[1] if ': ' in lang_code_and_name else lang_code_and_name

def convert_to_mp3(input_path):
    """Convert any audio format to mp3 using ffmpeg"""
    output_path = input_path.rsplit('.', 1)[0] + '.mp3'
    try:
        # Run ffmpeg command to convert to mp3
        cmd = ['ffmpeg', '-i', input_path, '-acodec', 'libmp3lame', '-ab', '192k', output_path, '-y']
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info(f"Converted {input_path} to {output_path}")
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion failed: {e.stderr.decode()}")
        raise Exception(f"Failed to convert audio: {e}")
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        raise

def detect_language(audio_path):
    """Detect language from audio file"""
    try:
        signal = language_id.load_audio(audio_path)
        prediction = language_id.classify_batch(signal)
        detected_language = extract_language_name(prediction[3][0])
        return detected_language
    except Exception as e:
        logger.error(f"Language detection error: {str(e)}")
        raise

def get_language_code(language_name):
    """Convert language name to code for transcription"""
    # Your existing language mappings dictionary here
    language_mappings = {
        'English': 'en',
        'Hindi': 'hi',
        'Marathi': 'mr',
        'Spanish': 'es',
        'French': 'fr',
        'German': 'de',
        'Chinese': 'zh',
        'Japanese': 'ja',
        'Korean': 'ko',
        'Russian': 'ru',
        'Italian': 'it',
        'Portuguese': 'pt',
        'Arabic': 'ar',
        'Bengali': 'bn',
        'Punjabi': 'pa',
        'Gujarati': 'gu',
        'Tamil': 'ta',
        'Telugu': 'te',
        'Malayalam': 'ml',
        'Urdu': 'ur',
        'Thai': 'th',
        'Turkish': 'tr',
        'Vietnamese': 'vi',
        'Persian': 'fa',
        'Greek': 'el',
        'Hebrew': 'he',
        'Dutch': 'nl',
        'Swedish': 'sv',
        'Polish': 'pl',
        'Danish': 'da',
        'Finnish': 'fi',
        'Hungarian': 'hu',
        'Czech': 'cs',
        'Romanian': 'ro',
        'Indonesian': 'id',
        'Filipino': 'tl',
        'Swahili': 'sw',
        'Afrikaans': 'af',
        'Ukrainian': 'uk',
        'Serbian': 'sr',
        'Bulgarian': 'bg',
        'Slovak': 'sk',
        'Lithuanian': 'lt',
        'Latvian': 'lv',
        'Estonian': 'et',
        # ... (rest of your mappings)
    }
    return language_mappings.get(language_name, 'en')

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'}), 400

    original_file = None
    converted_file = None
    
    try:
        # Save the uploaded file
        filename = secure_filename(file.filename)
        original_file = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(original_file)
        
        # Convert to mp3 if needed
        if not filename.lower().endswith('.mp3'):
            logger.info(f"Converting {filename} to MP3")
            converted_file = convert_to_mp3(original_file)
            processing_path = converted_file
        else:
            processing_path = original_file

        # Load model and detect language
        load_model()
        detected_language = detect_language(processing_path)
        language_code = get_language_code(detected_language)
        
        logger.info(f"Detected language: {detected_language} (code: {language_code})")

        # Make request to the transcription service
        transcription_url = "https://fb5c-34-105-97-21.ngrok-free.app/transcribe/"
        
        with open(processing_path, 'rb') as audio_file:
            files = {
                'file': audio_file
            }
            data = {
                'language': language_code
            }
            response = requests.post(transcription_url, files=files, data=data)

        # Add language detection info to response
        response_data = response.json()
        response_data['detected_language'] = detected_language
        response_data['language_code'] = language_code
        
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
        
    finally:
        # Clean up files
        try:
            if original_file and os.path.exists(original_file):
                os.remove(original_file)
            if converted_file and os.path.exists(converted_file):
                os.remove(converted_file)
        except Exception as cleanup_error:
            logger.error(f"Error during cleanup: {cleanup_error}")

if __name__ == '__main__':
    # Check if ffmpeg is installed
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        logger.info("FFmpeg is installed and working")
    except (subprocess.SubprocessError, FileNotFoundError):
        logger.error("FFmpeg is not installed or not in PATH. Please install FFmpeg to convert audio files.")
        print("ERROR: FFmpeg is required for audio conversion. Please install it before running this app.")
        print("  - Ubuntu/Debian: sudo apt-get install ffmpeg")
        print("  - macOS: brew install ffmpeg")
        print("  - Windows: Download from ffmpeg.org and add to PATH")
        exit(1)
        
    load_model()
    app.run(debug=True, port=4000)