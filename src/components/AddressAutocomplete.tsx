import React, { useEffect, useRef } from 'react';
import { Label } from './ui/label';
import { MapPin } from 'lucide-react';

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  countryCode?: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string, components?: AddressComponents) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  success?: boolean;
  className?: string;
  showIcon?: boolean;
  userCountryCode?: string; // Kept for API compatibility
}

export function AddressAutocomplete({
  id = 'address-input',
  label,
  value,
  onChange,
  placeholder = 'Enter address...',
  required = false,
  disabled = false,
  error,
  helperText,
  success = false,
  className = '',
  showIcon = true,
  userCountryCode = 'IN',
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value changes to input
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Handle manual typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Get outline color based on state
  const getOutlineClass = () => {
    if (disabled) {
      return 'outline-[color:var(--border-secondary,#d1d5db)]';
    }
    if (error) {
      return 'outline-[color:var(--interaction-red-base,#ef4444)] focus-within:outline-[color:var(--interaction-red-base,#ef4444)] focus-within:outline-2';
    }
    if (success) {
      return 'outline-[color:var(--interaction-green-base,#10b981)] focus-within:outline-[color:var(--interaction-green-base,#10b981)] focus-within:outline-2';
    }
    return 'outline-[color:var(--border-primary,#e5e7eb)] focus-within:outline-[color:var(--brand-orange-base,#f97316)] focus-within:outline-2';
  };

  // Get text color based on state
  const getTextColor = () => {
    if (disabled) {
      return 'text-[color:var(--content-dark-tertiary,#9ca3af)]';
    }
    return 'text-[color:var(--content-dark-primary,#111827)] dark:text-[color:var(--content-light-primary,#f9fafb)]';
  };

  // Get icon color based on state
  const getIconColor = () => {
    if (disabled) {
      return 'text-[color:var(--content-dark-tertiary,#9ca3af)]';
    }
    if (error) {
      return 'text-[color:var(--interaction-red-base,#ef4444)]';
    }
    if (success) {
      return 'text-[color:var(--interaction-green-base,#10b981)]';
    }
    return 'text-[color:var(--content-dark-secondary,#6b7280)]';
  };

  return (
    <div className={`inline-flex flex-col justify-start items-start gap-2 ${className}`}>
      {label && (
        <div className="self-stretch flex flex-col justify-center items-start">
          <Label htmlFor={id} className="justify-start text-[color:var(--content-dark-primary,#111827)] dark:text-[color:var(--content-light-primary,#f9fafb)] text-sm">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
        </div>
      )}

      <div className={`self-stretch px-3 py-2.5 rounded outline outline-1 outline-offset-[-1px] ${getOutlineClass()} inline-flex justify-start items-center gap-3 transition-all bg-background`}>
        {showIcon && (
          <MapPin className={`w-5 h-5 flex-shrink-0 ${getIconColor()}`} />
        )}

        <div className="flex-1">
          <input
            ref={inputRef}
            id={id}
            type="text"
            defaultValue={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full bg-transparent border-0 outline-none ${getTextColor()} text-sm placeholder:text-[color:var(--content-dark-tertiary,#9ca3af)] disabled:cursor-not-allowed`}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          />
        </div>
      </div>

      {/* Helper Text */}
      {helperText && (
        <div
          id={`${id}-helper`}
          className={`justify-start text-xs ${error
            ? 'text-[color:var(--interaction-red-base,#ef4444)]'
            : success
              ? 'text-[color:var(--interaction-green-base,#10b981)]'
              : 'text-[color:var(--content-dark-tertiary,#6b7280)]'
            }`}
        >
          {helperText}
        </div>
      )}

      {/* Error message */}
      {error && !helperText && (
        <p id={`${id}-error`} className="text-xs text-[color:var(--interaction-red-base,#ef4444)]">
          {error}
        </p>
      )}
    </div>
  );
}

