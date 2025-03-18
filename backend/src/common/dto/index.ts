export class TranscriptDto {
    text: string;
}

export class FormFieldDto {
    id: string;
    label: string;
    type: 'text' | 'number' | 'email' | 'date' | 'select';
    value: string;
    options?: string[];
}

export class FormDataDto {
    fields: FormFieldDto[];
}

export class LLMResponseDto {
    formData: FormDataDto;
    confidence: number;
}