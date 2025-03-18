import { LLMResponse } from '../types';

const API_URL = 'http://localhost:3000';

export const llmService = {
  async processText(text: string): Promise<LLMResponse> {
    const response = await fetch(`${API_URL}/llm/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error('Error al procesar el texto con LLM');
    }
    
    return response.json();
  }
};