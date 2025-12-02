import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-[var(--color-text-light)] mb-2"
      >
        {label}
        {required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        className={`
          w-full px-4 py-3 rounded-lg
          bg-[#151D2C] border
          text-[var(--color-text-light)]
          placeholder:text-white/40
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent
          transition duration-300
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#0f1620]
          ${error ? 'border-red-500' : 'border-white/20'}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-500"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;

