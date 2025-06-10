from flask import Flask, request, jsonify
from flask_cors import CORS
from gtts import gTTS
import os
from openai import OpenAI
from dotenv import load_dotenv
import tempfile
import base64
from pydub import AudioSegment
import io
import subprocess

load_dotenv()

app = Flask(__name__)
CORS(app)

client = OpenAI(api_key=os.getenv('API_KEY'))

def generate_lip_sync(face_image_path, audio_path, output_path):
    wav2lip_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Wav2Lip'))
    checkpoint_path = os.path.join(wav2lip_dir, 'Wav2Lip-SD-NOGAN.pt')  # or Wav2Lip.pth if you use that
    inference_path = os.path.join(wav2lip_dir, 'inference.py')
    command = [
        'python', inference_path,
        '--checkpoint_path', checkpoint_path,
        '--face', face_image_path,
        '--audio', audio_path,
        '--outfile', output_path
    ]
    subprocess.run(command, check=True)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message')

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful AI tutor. Provide clear, concise, and educational responses."},
                {"role": "user", "content": user_message}
            ]
        )
        ai_response = response.choices[0].message.content

        # Convert AI response to speech
        tts = gTTS(text=ai_response, lang='en', slow=False)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_audio:
            tts.save(temp_audio.name)
        temp_audio_path = temp_audio.name

        # Prepare audio for frontend
        audio = AudioSegment.from_mp3(temp_audio_path)
        audio_bytes = io.BytesIO()
        audio.export(audio_bytes, format='mp3')
        audio_base64 = base64.b64encode(audio_bytes.getvalue()).decode('utf-8')

        # Try to generate lip-synced video, but don't fail if it doesn't work
        video_base64 = None
        try:
            face_image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'Amrutha.jpg'))
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
                output_video_path = temp_video.name

            generate_lip_sync(face_image_path, temp_audio_path, output_video_path)

            with open(output_video_path, 'rb') as video_file:
                video_base64 = base64.b64encode(video_file.read()).decode('utf-8')
            os.unlink(output_video_path)
        except Exception as ve:
            print("Wav2Lip failed, but continuing:", ve)
            video_base64 = None

        os.unlink(temp_audio_path)

        return jsonify({
            'response': ai_response,
            'audio': audio_base64,
            'video': video_base64
        })

    except Exception as e:
        print("Error in /api/chat:", e)
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            audio_file.save(temp_audio.name)
        temp_audio_path = temp_audio.name  # Save the path outside the with block

        with open(temp_audio_path, 'rb') as audio:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio
            )
        os.unlink(temp_audio_path)
        return jsonify({'text': transcript.text})

    except Exception as e:
        print("Error in /api/speech-to-text:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 