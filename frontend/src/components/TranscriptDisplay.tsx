import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  isLoading: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isLoading }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 mb-4">
      <h2 className="text-xl font-semibold mb-2">Transcripción</h2>
      {isLoading ? (
        <div className="animate-pulse h-20 bg-gray-200 rounded"></div>
      ) : transcript ? (
        <div className="p-3 bg-white border rounded max-h-60 overflow-y-auto">
          {transcript}
        </div>
      ) : (
        <p className="text-gray-500">La transcripción aparecerá aquí</p>
      )}
    </div>
  );
};

export default TranscriptDisplay;