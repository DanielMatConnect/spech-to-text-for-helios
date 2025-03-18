import React, { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import TranscriptDisplay from './components/TranscriptDisplay';
import DynamicForm from './components/DynamicForm';
import { FormData, LLMResponse } from './types';

import './App.css';

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isProcessingTranscript, setIsProcessingTranscript] = useState<boolean>(false);
  const [isProcessingForm] = useState(false);

  const handleTranscriptReceived = (text: string) => {
    setTranscript(text);
  };

  const handleFormDataReceived = (response: LLMResponse) => {
    setFormData(response.formData);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    if (formData) {
      const updatedFields = formData.fields.map((field) =>
        field.id === fieldId ? { ...field, value } : field
      );
      setFormData({ ...formData, fields: updatedFields });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Procesamiento de Audio con IA</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <AudioRecorder
          onTranscriptReceived={handleTranscriptReceived}
          onFormDataReceived={handleFormDataReceived}
          isProcessing={isProcessingTranscript}
          setIsProcessing={setIsProcessingTranscript}
        />
        
        <TranscriptDisplay
          transcript={transcript}
          isLoading={isProcessingTranscript}
        />
        
        <DynamicForm
          formData={formData}
          isLoading={isProcessingForm}
          onFieldChange={handleFieldChange}
        />
      </div>
    </div>
  );
};

export default App;