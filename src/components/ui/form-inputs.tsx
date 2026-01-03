/**
 * Ataraxia Design System - Form Input Components
 * 
 * Centralized export for all form input components following the design system.
 * Use these components throughout the application for consistent styling and behavior.
 * 
 * Components:
 * - InputField: Standard text input with icons, character count, and all states
 * - SearchBar: Search input with keyboard shortcuts
 * - TextareaField: Multi-line text input
 * - PhoneInput: International phone number input with country codes
 */

export { InputField, type InputFieldProps } from './input-field';
export { SearchBar, type SearchBarProps } from './search-bar';
export { TextareaField, type TextareaFieldProps } from './textarea-field';
export { PhoneInput, COUNTRY_CODES, validatePhoneNumber, formatPhoneForDisplay } from '../PhoneInput';
