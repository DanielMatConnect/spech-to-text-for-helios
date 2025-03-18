import { Injectable, Logger } from '@nestjs/common';
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
		color: { visible: true, name: 'color', label: 'Color', required: true },
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
  private readonly logger = new Logger(LLMService.name);

  constructor(private readonly openApiService: OpenApiService) {
    this.logger.log('LLM Service initialized');
  }

  async processText(text: string): Promise<LLMResponseDto> {
    try {
      this.logger.debug('Processing text input', { textLength: text.length });
      
      const prompt = this.buildPrompt(text, SERVICE_TYPE_FIELDS_ROAD);
      const response = await this.openApiService.generateCompletion(prompt);
      
      const extractedData = this.parseResponse(response);
      
      const formData: FormDataDto = {
        fields: this.convertToFormFields(extractedData, SERVICE_TYPE_FIELDS_ROAD)
      };

      this.logger.debug('Successfully processed text', {
        fieldsExtracted: formData.fields.length,
        confidence: response.confidence || 0.85
      });

      return {
        formData,
        confidence: response.confidence || 0.85,
      };
    } catch (error) {
      this.logger.error('Error processing text', {
        error: error.message,
        stack: error.stack,
        textLength: text.length
      });
      throw new Error('Error al procesar el texto con LLM');
    }
  }

  private parseResponse(response: any): any {
    try {
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        this.logger.warn('No JSON found in response', { response: response.response });
        return {};
      }
    } catch (e) {
      this.logger.error('Error parsing LLM response', {
        error: e.message,
        response: response.response
      });
      return {};
    }
  }

  private buildPrompt(text: string, formSchema: FormSchema): string {
    return `You are a helpful assistant that extracts specific information from text in both English and Spanish. Your task is to extract information and return it ONLY as a JSON object.

Text to analyze: "${text}"

Expected JSON structure:
{
  ${this.buildJsonStructure(formSchema)}
}

IMPORTANT INSTRUCTIONS:
1. Return ONLY the JSON object, with NO additional text or explanations
2. Use EXACTLY the field names shown above
3. Use empty strings ("") for information not found in the text
4. For vehicle information:
   - Extract all mentioned details about the vehicle
   - Ensure proper formatting for plate numbers and VIN
   - Standardize color names in English (e.g., "white" instead of "blanco")
   - Use four-digit year format (e.g., "2015")
   - Capitalize make and model names
   - Handle Spanish vehicle terms (e.g., "placa" = plate, "modelo" = year/model)

5. For names:
   - firstname: Extract ONLY the first name (e.g., "Edinson" from "Edinson Daniel Mateus Ovalle")
   - lastname: Extract ONLY the last surname (e.g., "Ovalle" from "Edinson Daniel Mateus Ovalle")
   - othername: Extract middle names and first surname (e.g., "Daniel Mateus" from "Edinson Daniel Mateus Ovalle")
   - Ensure proper capitalization for all names
   - Handle Spanish naming conventions (multiple names and surnames)

6. For phone numbers:
   - Maintain original formatting including hyphens
   - phone1 is the primary/first mentioned contact number
   - phone2 is the secondary/alternative number
   - Format consistently as: XXX-XXX-XXXX

7. For situation (service requested):
   - Extract the specific service or assistance being requested
   - Common services in Spanish and English:
     * "servicio de grúa"/"grua" = "towing"
     * "batería"/"pase de corriente" = "battery jump"
     * "gasolina"/"combustible" = "fuel delivery"
     * "llanta"/"neumatico" = "tire change"
     * "llaves"/"cerrado" = "lockout assistance"
   - Include relevant details about the problem
   - Format as: "<service type>: <specific details>"
   - If multiple services mentioned, include all separated by semicolon
   - Translate service type to English but keep details in original language

EXAMPLES:
Input: "Hola, necesito servicio de grúa para mi Toyota Camry 2020 rojo, placa ABC123. No arranca el carro."
Output: {
  "vehicle": {
    "year": "2020",
    "make": "Toyota",
    "model": "Camry",
    "color": "red",
    "plate": "ABC123",
    "vin": ""
  },
  "firstname": "",
  "lastname": "",
  "othername": "",
  "phone1": "",
  "phone2": "",
  "situation": "towing: no arranca el carro"
}

Input: "Me llamo Juan Carlos Pérez Rodríguez, mi carro se quedó sin gasolina. Es un Honda Civic azul. Mi teléfono es 555-123-4567"
Output: {
  "vehicle": {
    "year": "",
    "make": "Honda",
    "model": "Civic",
    "color": "blue",
    "plate": "",
    "vin": ""
  },
  "firstname": "Juan",
  "lastname": "Rodríguez",
  "othername": "Carlos Pérez",
  "phone1": "555-123-4567",
  "phone2": "",
  "situation": "fuel delivery: carro sin gasolina"
}

Input: "hola buenos días necesito un servicio de grúa ya que mi situación es que me varé así que necesito un servicio de grúa mi vehículo es un Ford Fiesta blanco modelo 2015 de placa URW 199 mi nombre completo es Edinson Daniel Mateus Ovalle mi número de teléfono es el 316-698-9045 otro teléfono es 310-209-8282"
Output: {
  "vehicle": {
    "year": "2015",
    "make": "Ford",
    "model": "Fiesta",
    "color": "white",
    "plate": "URW199",
    "vin": ""
  },
  "firstname": "Edinson",
  "lastname": "Ovalle",
  "othername": "Daniel Mateus",
  "phone1": "316-698-9045",
  "phone2": "310-209-8282",
  "situation": "towing: vehículo varado"
}

RESPONSE FORMAT MUST BE VALID JSON.`;
  }

  private buildJsonStructure(schema: FormSchema): string {
    const structure: string[] = [];
    
    if (schema.vehicle) {
      structure.push(`"vehicle": {
        ${Object.entries(schema.vehicle)
          .filter(([_, field]) => field.visible)
          .map(([key, field]) => `"${key}": "" // ${field.label}${field.required ? ' (Required)' : ''}`)
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
        structure.push(`"${key}": "" // ${(field as FormField).label}${(field as FormField).required ? ' (Required)' : ''}`);
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