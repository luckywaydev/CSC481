import React, { forwardRef } from 'react';

// Input field สำหรับ form
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label - ถ้ามี */}
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input field */}
        <input
          ref={ref}
          className={`
            w-full
            px-4
            py-3
            bg-background-secondary
            border-2
            ${error ? 'border-red-500' : 'border-background-tertiary'}
            rounded-xl
            text-text-primary
            placeholder:text-text-tertiary
            focus:outline-none
            focus:border-purple-500
            focus:ring-2
            focus:ring-purple-500/20
            disabled:opacity-50
            transition-all
            ${className}
          `}
          {...props}
        />

        {/* Error message - ถ้ามี */}
        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
