export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select';
    value: string;
    options?: string[]; // Para campos select
}

export interface FormData {
    fields: FormField[];
}

export interface TranscriptResponse {
    text: string;
}

export interface LLMResponse {
    formData: FormData;
    confidence: number;
}