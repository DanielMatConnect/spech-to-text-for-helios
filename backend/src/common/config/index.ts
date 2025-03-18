import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Configuración de OpenAI
export const openAIConfig = {
  url: process.env.OPENAI_URL || 'http://localhost:11434',
  model: process.env.OPENAI_MODEL || 'llama3',
};
