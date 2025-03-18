import { Injectable } from '@nestjs/common';
import { FormDataDto, LLMResponseDto } from 'src/common/dto';
import { OpenApiService } from 'src/open-api/open-api.service';

interface FormField {
  visible: boolean;
  name: string;
  label: string;
  required: boolean;
}

// Tipo específico para el vehículo
interface VehicleSchema {
  [key: string]: FormField;
}

// Tipo base para el esquema del formulario
interface BaseFormSchema {
  vehicle?: VehicleSchema;
}

// Tipo final que combina el base con los campos dinámicos
interface FormSchema extends BaseFormSchema {
  [key: string]: FormField | VehicleSchema | undefined;
}

const SERVICE_TYPE_FIELDS_ROAD: FormSchema = {
	vehicle: {
		year: { visible: true, name: 'year', label: 'Year', required: true },
		make: { visible: true, name: 'make', label: 'Make', required: true },
		model: { visible: true, name: 'model', label: 'Model', required: true },
		color: { visible: true, name: 'color', label: 'color', required: true },
		plate: { visible: true, name: 'plate', label: 'Plate', required: true },
		vin: { visible: true, name: 'vin', label: 'VIN', required: true },
	},
	firstname: { visible: true, name: 'firstname', label: 'First Name', required: true },
	lastname: { visible: true, name: 'lastname', label: 'Last Name', required: true },
	othername: { visible: true, name: 'othername', label: 'Other Name', required: false },
	phone1: { visible: true, name: 'phone1', label: 'Phone', required: true },
	phone2: { visible: true, name: 'phone2', label: 'Phone 2', required: false },
	situation: { visible: true, name: 'situation', label: 'Situation', required: true },
	destination: { visible: false, name: 'destination', label: 'Destination', required: false },
};


@Injectable()
export class LLMService {
  constructor(private readonly openApiService: OpenApiService) {}

  async processText(text: string): Promise<LLMResponseDto> {
    try {
      const prompt = this.buildPrompt(text, SERVICE_TYPE_FIELDS_ROAD);
      
      const response = await this.openApiService.generateCompletion(prompt);
      
      // Intentar encontrar y parsear solo el JSON de la respuesta
      let extractedData = {};
      try {
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[0]);
        } else {
          console.error('No JSON found in response:', response.response);
        }
      } catch (e) {
        console.error('Error parsing LLM response:', e);
        console.error('Raw response:', response.response);
        extractedData = {};
      }

      const formData: FormDataDto = {
        fields: this.convertToFormFields(extractedData, SERVICE_TYPE_FIELDS_ROAD)
      };

      return {
        formData,
        confidence: response.confidence || 0.85,
      };
    } catch (error) {
      console.error('Error en el procesamiento del LLM:', error);
      throw new Error('Error al procesar el texto con LLM');
    }
  }

  private buildPrompt(text: string, formSchema: FormSchema): string {
    return `You are a helpful assistant that extracts specific information from text. Your task is to extract information and return it ONLY as a JSON object.

Text to analyze: "${text}"

Expected JSON structure:
{
  ${this.buildJsonStructure(formSchema)}
}

IMPORTANT INSTRUCTIONS:
1. Return ONLY the JSON object, with NO additional text or explanations
2. Use EXACTLY the field names shown above
3. Use empty strings ("") for information not found in the text
4. For vehicle information, include all details mentioned
5. Ensure proper capitalization for names
6. Keep original formatting for numbers and special characters

RESPONSE FORMAT MUST BE VALID JSON.`;
  }

  private buildJsonStructure(schema: FormSchema): string {
    let structure: string[] = [];
    
    if (schema.vehicle) {
      structure.push(`"vehicle": {
        ${Object.entries(schema.vehicle)
          .filter(([_, field]) => field.visible)
          .map(([key, field]) => `"${key}": "value" // ${field.label}${field.required ? ' (Required)' : ''}`)
          .join(',\n        ')}
      }`);
    }

    Object.entries(schema)
      .filter(([key, field]) => 
        key !== 'vehicle' && 
        field !== undefined &&
        'visible' in field && 
        field.visible
      )
      .forEach(([key, field]) => {
        structure.push(`"${key}": "value" // ${(field as FormField).label}${(field as FormField).required ? ' (Required)' : ''}`);
      });

    return structure.join(',\n      ');
  }

  private convertToFormFields(extractedData: any, schema: FormSchema): any[] {
    const fields: any[] = [];

    // Procesar campos del vehículo
    if (schema.vehicle && extractedData.vehicle) {
      Object.entries(schema.vehicle).forEach(([key, field]) => {
        if (field.visible) {
          fields.push({
            id: field.name,
            label: field.label,
            type: 'text',
            value: extractedData.vehicle[key] || '',
            required: field.required
          });
        }
      });
    }

    // Procesar otros campos
    Object.entries(schema).forEach(([key, field]) => {
      if (key !== 'vehicle' && typeof field === 'object' && 'visible' in field && field.visible) {
        fields.push({
          id: field.name,
          label: field.label,
          type: 'text',
          value: extractedData[key] || '',
          required: field.required
        });
      }
    });

    return fields;
  }
}