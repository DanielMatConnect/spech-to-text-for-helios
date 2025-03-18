import { Injectable } from '@nestjs/common';
import { openAIConfig } from '../common/config';
import axios from 'axios';

@Injectable()
export class OpenApiService {
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiUrl = openAIConfig.url;
    this.model = openAIConfig.model;
  }

  async generateCompletion(prompt: string) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
        format: "json",
        temperature: 0.1,
      });

      // Asegurarse de que tenemos una respuesta válida
      if (!response.data || !response.data.response) {
        throw new Error('Invalid response format from LLM');
      }

      return response.data;
    } catch (error) {
      console.error('Raw error:', error);
      throw new Error(`Error generating completion: ${error.message}`);
    }
  }

  async generateChat(messages: Array<{ role: string; content: string }>) {
    try {
      const response = await axios.post(`${this.apiUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
        format: "json",
        temperature: 0.1,
      });

      return response.data;
    } catch (error) {
      console.error('Raw error:', error);
      throw new Error(`Error in chat generation: ${error.message}`);
    }
  }
}
