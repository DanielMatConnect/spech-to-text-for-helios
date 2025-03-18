import { Injectable, Logger } from '@nestjs/common';
import { openAIConfig } from '../common/config';
import axios from 'axios';

@Injectable()
export class OpenApiService {
  private readonly logger = new Logger(OpenApiService.name);
  private readonly apiUrl: string;
  private readonly model: string;

  constructor() {
    this.apiUrl = openAIConfig.url;
    this.model = openAIConfig.model;
    this.logger.log(
      `Initialized OpenAPI service with URL: ${this.apiUrl} and model: ${this.model}`,
    );
  }

  async generateCompletion(prompt: string) {
    try {
      this.logger.debug('Starting completion generation', {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 100) + '...',
      });

      const response = await axios.post(`${this.apiUrl}/api/generate`, {
        model: this.model,
        prompt,
        stream: false,
        format: 'json',
        temperature: 0.1,
      });

      // Asegurarse de que tenemos una respuesta válida
      if (!response.data || !response.data.response) {
        this.logger.error('Invalid LLM response format', {
          responseData: response.data,
        });
        throw new Error('Invalid response format from LLM');
      }

      this.logger.debug('Successfully generated completion', {
        responseLength: response.data.response.length,
        success: true,
      });
      this.logger.debug('Response', JSON.parse(response.data.response));

      return response.data;
    } catch (error) {
      this.logger.error('Failed to generate completion', {
        error: error.message,
        stack: error.stack,
        promptLength: prompt.length,
      });
      throw new Error(`Error generating completion: ${error.message}`);
    }
  }

  async generateChat(messages: Array<{ role: string; content: string }>) {
    try {
      this.logger.debug('Starting chat generation', {
        messageCount: messages.length,
        lastRole: messages[messages.length - 1]?.role,
        lastMessagePreview:
          messages[messages.length - 1]?.content.substring(0, 100) + '...',
      });

      const response = await axios.post(`${this.apiUrl}/api/chat`, {
        model: this.model,
        messages,
        stream: false,
        format: 'json',
        temperature: 0.1,
      });

      if (!response.data) {
        this.logger.error('Invalid chat response format', {
          responseData: response.data,
        });
        throw new Error('Invalid response format from LLM');
      }

      this.logger.debug('Successfully generated chat response', {
        responseLength: response.data.response?.length,
        success: true,
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to generate chat response', {
        error: error.message,
        stack: error.stack,
        messageCount: messages.length,
      });
      throw new Error(`Error in chat generation: ${error.message}`);
    }
  }
}
