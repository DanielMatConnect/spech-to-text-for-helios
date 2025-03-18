import { Injectable } from '@nestjs/common';
import { FormDataDto, LLMResponseDto } from 'src/common/dto';

@Injectable()
export class LLMService {
  async processText(text: string): Promise<LLMResponseDto> {
    try {
      // En un entorno real, aquí se llamaría a un LLM como GPT-4, Claude, etc.
      // Para este ejemplo, simularemos el procesamiento
      
      console.log(`Procesando texto con LLM: ${text}`);
      
      // Simular un pequeño retraso para ser realista
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Extracción de información básica del texto
      // En un entorno real, esto vendría de la API del LLM
      const extractedName = text.includes('Juan Pérez') ? 'Juan Pérez' : '';
      const extractedPhone = text.includes('555-123-4567') ? '555-123-4567' : '';
      
      // Fechas y horas
      const dateMatch = text.match(/próximo (lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i);
      const extractedDate = dateMatch ? dateMatch[0] : '';
      
      const timeMatch = text.match(/(\d{1,2})\s*(?::|AM|PM)/i);
      const extractedTime = timeMatch ? timeMatch[0] : '';
      
      // Tema de la cita
      const reasonMatch = text.match(/consultar\s+sobre\s+([^.]+)/i);
      const extractedReason = reasonMatch ? reasonMatch[1].trim() : '';
      
      // Formación de datos del formulario
      const formData: FormDataDto = {
        fields: [
          {
            id: 'name',
            label: 'Nombre',
            type: 'text',
            value: extractedName,
          },
          {
            id: 'phone',
            label: 'Teléfono',
            type: 'text',
            value: extractedPhone,
          },
          {
            id: 'date',
            label: 'Fecha',
            type: 'text',
            value: extractedDate,
          },
          {
            id: 'time',
            label: 'Hora',
            type: 'text',
            value: extractedTime,
          },
          {
            id: 'reason',
            label: 'Motivo',
            type: 'text',
            value: extractedReason,
          },
          {
            id: 'appointmentType',
            label: 'Tipo de Cita',
            type: 'select',
            value: 'consulta',
            options: ['consulta', 'seguimiento', 'presupuesto', 'otro'],
          },
        ],
      };
      
      return {
        formData,
        confidence: 0.85,
      };
    } catch (error) {
      console.error('Error en el procesamiento del LLM:', error);
      throw new Error('Error al procesar el texto con LLM');
    }
  }
}