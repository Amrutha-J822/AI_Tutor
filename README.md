# AI Tutor Project

This project implements a conversational AI tutor using OpenAI's GPT-4o model, speech-to-text, text-to-speech, and optional lip syncing with Wav2Lip.

## Features

- Real-time chat with AI tutor using GPT-4o
- Speech-to-text conversion for voice input
- Text-to-speech for AI responses
- Avatar display with optional lip-syncing (Wav2Lip)
- Modern React + TypeScript frontend
- Flask backend with OpenAI integration
- **Robust:** If lip sync fails, you still get text and audio responses

## Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API key
- (For lip sync) PyTorch, ffmpeg, and Wav2Lip dependencies

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory with your OpenAI API key:
```
API_KEY=your_openai_api_key_here
```

### Wav2Lip (Lip Sync) Setup (Optional but recommended)

1. From your project root, clone the Wav2Lip repo:
```bash
git clone https://github.com/Rudrabha/Wav2Lip.git
```

2. Enter the Wav2Lip directory and install dependencies:
```bash
cd Wav2Lip
pip install -r requirements.txt
pip install torch torchvision numpy opencv-python ffmpeg-python
```

3. Download the non-GAN model file from [Google Drive](https://drive.google.com/drive/folders/153HLrqlBNxzZcHi17PEvP09kkAfzRshM?usp=share_link):
   - Download `Wav2Lip-SD-NOGAN.pt` (or `Wav2Lip.pth` if you prefer)
   - Place it inside your `Wav2Lip` directory

4. Make sure you have `ffmpeg` installed and in your PATH.

5. Place your real-face avatar image as `backend/Amrutha.jpg`.

6. Go back to your project root:
```bash
cd ..
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the backend server (from the backend directory):
```bash
python app.py
```

2. Start the frontend development server (from the frontend directory):
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
.
├── backend/
│   ├── app.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── Wav2Lip/
│   ├── inference.py
│   └── Wav2Lip-SD-NOGAN.pt
└── assets/
    └── Amrutha.jpg
```

## Technologies Used

- Backend:
  - Flask
  - OpenAI API
  - gTTS
  - Flask-CORS
  - pydub
  - librosa
  - Wav2Lip (for lip sync, optional)

- Frontend:
  - React
  - TypeScript
  - styled-components
  - axios

## Notes

- If Wav2Lip or lip sync fails, the app will still return text and audio responses.
- Make sure to keep your OpenAI API key secure and never commit it to version control.
- The application requires microphone access for speech-to-text functionality.
- The avatar image should be a real face and placed in the backend directory as `Amrutha.jpg`.
- For more on Wav2Lip, see the [official repo](https://github.com/Rudrabha/Wav2Lip?tab=readme-ov-file). 