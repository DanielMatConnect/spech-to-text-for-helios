export class TranscriptDto {
    text: string;
}

export interface FormFieldConfig {
    visible: boolean;
    name: string;
    label: string;
    required: boolean;
}

export interface VehicleFormConfig {
    year: FormFieldConfig;
    make: FormFieldConfig;
    model: FormFieldConfig;
    color: FormFieldConfig;
    plate: FormFieldConfig;
    vin: FormFieldConfig;
    [key: string]: FormFieldConfig;
}

export interface FormConfig {
    vehicle?: VehicleFormConfig;
    firstname?: FormFieldConfig;
    lastname?: FormFieldConfig;
    othername?: FormFieldConfig;
    phone1?: FormFieldConfig;
    phone2?: FormFieldConfig;
    situation?: FormFieldConfig;
    destination?: FormFieldConfig;
    [key: string]: FormFieldConfig | VehicleFormConfig | undefined;
}

export class FormFieldDto {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select';
    value: string;
    required: boolean;
    options?: string[];
}

export class FormDataDto {
    fields: FormFieldDto[];
}

export class LLMResponseDto {
    formData: FormDataDto;
    confidence: number;
}