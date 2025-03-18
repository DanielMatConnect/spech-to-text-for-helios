import { TranscriptResponse } from '../types';

const API_URL = 'http://localhost:3000';

export const audioService = {
  async transcribeAudio(audioFile: File): Promise<TranscriptResponse> {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await fetch(`${API_URL}/audio/transcribe`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Error al transcribir el audio');
    }
    
    return response.json();
  }
};