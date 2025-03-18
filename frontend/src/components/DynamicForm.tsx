import React from 'react';
import { FormData } from '../types';

interface DynamicFormProps {
  formData: FormData | null;
  isLoading: boolean;
  onFieldChange: (fieldId: string, value: string) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ formData, isLoading, onFieldChange }) => {
  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Formulario</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!formData || formData.fields.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Formulario</h2>
        <p className="text-gray-500">Los campos del formulario aparecerán aquí</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Formulario</h2>
      <form className="space-y-4">
        {formData.fields.map((field) => (
          <div key={field.id} className="mb-4">
            <label htmlFor={field.id} className="block mb-2 font-medium">
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.id}
                value={field.value}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Selecciona una opción</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.id}
                value={field.value}
                onChange={(e) => onFieldChange(field.id, e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Guardar
        </button>
      </form>
    </div>
  );
};

export default DynamicForm;