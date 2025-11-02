import React, { forwardRef } from 'react';

/**
 * Input Component - Dark Theme
 * 
 * Input field สำหรับ form ต่างๆ
 * ออกแบบให้เข้ากับ Dark theme และมี focus state เป็นสีม่วง
 * 
 * Props:
 * - label: ป้ายชื่อ input
 * - error: ข้อความ error
 * - helperText: ข้อความช่วยเหลือ
 * - leftIcon: ไอคอนด้านซ้าย
 * - rightIcon: ไอคอนด้านขวา
 * - fullWidth: เต็มความกว้าง
 * - ...props: HTML input attributes อื่นๆ
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-text-primary mb-2">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            className={`
              w-full
              px-4
              py-3
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              bg-background-secondary
              border-2
              ${error ? 'border-error' : 'border-background-tertiary'}
              rounded-xl
              text-text-primary
              placeholder:text-text-tertiary
              focus:outline-none
              focus:border-purple-500
              focus:ring-2
              focus:ring-purple-500/20
              disabled:opacity-50
              disabled:cursor-not-allowed
              transition-all
              duration-200
              ${className}
            `}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper text or error message */}
        {(helperText || error) && (
          <p
            className={`
              mt-2
              text-sm
              ${error ? 'text-error' : 'text-text-secondary'}
            `}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
