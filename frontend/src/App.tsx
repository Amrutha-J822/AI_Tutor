import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f5f5;
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const AvatarContainer = styled.div`
  width: 200px;
  height: 200px;
  margin-bottom: 2rem;
  position: relative;
`;

const MessageContainer = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: #f0f0f0;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { text: inputText, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: inputText
      });

      const aiMessage = { text: response.data.response, isUser: false };
      setMessages(prev => [...prev, aiMessage]);

      // Play the audio response
      if (response.data.audio) {
        const audio = new Audio(`data:audio/mp3;base64,${response.data.audio}`);
        setAudioUrl(audio.src);
        audio.play().catch(error => console.error('Error playing audio:', error));
      }
      // Set the video if present
      if (response.data.video) {
        setVideoUrl(response.data.video);
      } else {
        setVideoUrl(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { text: 'Sorry, there was an error processing your request.', isUser: false }]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await axios.post('http://localhost:5000/api/speech-to-text', formData);
          setInputText(response.data.text);
        } catch (error) {
          console.error('Error converting speech to text:', error);
          setInputText('Error converting speech to text. Please try typing instead.');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <AppContainer>
      <AvatarContainer>
        {videoUrl ? (
          <video
            src={`data:video/mp4;base64,${videoUrl}`}
            controls
            autoPlay
            style={{ width: '200px', height: '200px', borderRadius: '50%' }}
          />
        ) : (
          <img src="/assets/Amrutha.jpg" alt="AI Tutor" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        )}
      </AvatarContainer>

      <ChatContainer>
        {messages.map((message, index) => (
          <MessageContainer key={index} style={{ background: message.isUser ? '#e3f2fd' : '#f5f5f5' }}>
            {message.text}
          </MessageContainer>
        ))}
      </ChatContainer>

      <InputContainer>
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <Button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        <Button onClick={handleSendMessage}>Send</Button>
      </InputContainer>

      {audioUrl && (
        <audio src={audioUrl} controls style={{ marginTop: '1rem' }} />
      )}
    </AppContainer>
  );
};

export default App;