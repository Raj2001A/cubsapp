import React, { useState, useEffect, useRef } from 'react';
import { validateField } from '../../utils/validation';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date' | 'number' | 'select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  pattern?: string;
  helpText?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  icon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  className = '',
  autoComplete,
  min,
  max,
  pattern,
  helpText,
  validateOnChange = false,
  validateOnBlur = true,
  icon,
}) => {
  const [localError, setLocalError] = useState<string | null>(error || null);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  // Update local error when prop changes
  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  // Handle validation
  const validate = () => {
    if (!validateOnBlur && !validateOnChange) return;
    
    const validationError = validateField(label, value, required);
    setLocalError(validationError);
    return validationError;
  };

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e);
    setTouched(true);
    if (validateOnChange) {
      validate();
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (onBlur) onBlur(e);
    setTouched(true);
    if (validateOnBlur) {
      validate();
    }
  };

  // Common props for input and select
  const commonProps = {
    id,
    name,
    disabled,
    required,
    'aria-required': required,
    'aria-invalid': !!localError,
    'aria-describedby': `${helpText ? descriptionId : ''} ${localError ? errorId : ''}`.trim() || undefined,
    onBlur: handleBlur,
    ref: inputRef as any,
    className: `block w-full rounded-md border ${
      localError && touched ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500' : 
      'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
    } shadow-sm px-3 py-2 ${disabled ? 'bg-gray-100 text-gray-500' : ''} ${className}`,
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}{required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        
        {helpText && (
          <span id={descriptionId} className="text-xs text-gray-500">
            {helpText}
          </span>
        )}
      </div>

      {type === 'select' ? (
        <select
          {...commonProps}
          onChange={handleChange}
          value={value}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            {...commonProps}
            type={type}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            min={min}
            max={max}
            pattern={pattern}
            className={`${icon ? 'pl-10' : ''} ${commonProps.className}`}
          />
        </div>
      )}

      {localError && touched && (
        <p id={errorId} className="mt-2 text-sm text-red-600" role="alert">
          {localError}
        </p>
      )}
    </div>
  );
};

export default FormInput;
