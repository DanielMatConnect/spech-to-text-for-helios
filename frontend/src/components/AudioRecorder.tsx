import React, { useState, useRef } from 'react';
import { audioService } from '../services/audioService';
import { llmService } from '../services/llmService';
import { LLMResponse } from '../types';

interface AudioRecorderProps {
  onTranscriptReceived: (transcript: string) => void;
  onFormDataReceived: (formData: LLMResponse) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptReceived,
  onFormDataReceived,
  isProcessing,
  setIsProcessing
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        setAudioFile(file);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAudioFile(event.target.files[0]);
    }
  };

  const processAudio = async () => {
    if (!audioFile) return;
    
    try {
      setIsProcessing(true);
      
      // Step 1: Convert audio to text
      const transcript = await audioService.transcribeAudio(audioFile);
      onTranscriptReceived(transcript.text);
      
      // Step 2: Process text with LLM and get form data
      const formData = await llmService.processText(transcript.text);
      onFormDataReceived(formData);
      
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Grabación de Audio</h2>
      
      <div className="flex gap-4 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Iniciar Grabación
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Detener Grabación
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-2">O sube un archivo de audio:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="w-full p-2 border rounded"
        />
      </div>
      
      {audioFile && (
        <div className="mb-4">
          <p>Archivo: {audioFile.name}</p>
          <button
            onClick={processAudio}
            disabled={isProcessing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {isProcessing ? 'Procesando...' : 'Procesar Audio'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;