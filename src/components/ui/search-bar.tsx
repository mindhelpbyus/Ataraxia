import React, { forwardRef } from 'react';
import { MagnifyingGlass, Command } from '@phosphor-icons/react';

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showKeyboardShortcut?: boolean;
  shortcutKey?: string;
  onSearch?: (value: string) => void;
}

/**
 * SearchBar Component - Matches Ataraxia Design System
 * 
 * Features:
 * - Search icon on the left
 * - Keyboard shortcut badges on the right (⌘/Ctrl + F)
 * - Multiple states: base, hover, focus, filled
 * - Auto-formats with proper styling
 * 
 * States:
 * - Base: Gray outline with search icon
 * - Hover: Darker gray outline
 * - Focus: Orange outline with blinking cursor
 * - Filled: Primary text color
 * 
 * Usage:
 * ```tsx
 * <SearchBar
 *   placeholder="Search"
 *   showKeyboardShortcut
 *   onSearch={(value) => console.log(value)}
 * />
 * ```
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'Search',
      showKeyboardShortcut = true,
      shortcutKey = 'F',
      disabled = false,
      className = '',
      value = '',
      onChange,
      onSearch,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    // Determine outline color based on state
    const getOutlineClass = () => {
      if (disabled) {
        return 'outline-[color:var(--interaction-outline-disabled,#e5e7eb)] bg-[color:var(--interaction-secondary-disabled,#f9fafb)]';
      }
      return 'outline-[color:var(--interaction-outline-base,#d1d5db)] hover:outline-[color:var(--interaction-outline-hover,#9ca3af)] focus-within:outline-[color:var(--interaction-outline-active,#F97316)] focus-within:outline-2';
    };

    // Text color: filled = primary, empty = tertiary
    const getTextColor = () => {
      if (disabled) {
        return 'text-[color:var(--content-dark-disable,#d1d5db)]';
      }
      return value
        ? 'text-[color:var(--content-dark-primary,#111827)]'
        : 'text-[color:var(--content-dark-tertiary,#6b7280)]';
    };

    const getIconColor = () => {
      if (disabled) {
        return 'text-[color:var(--content-dark-disable,#d1d5db)]';
      }
      return 'text-[color:var(--content-dark-tertiary,#6b7280)]';
    };

    // Detect OS for keyboard shortcut
    const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const commandKey = isMac ? '⌘' : 'Ctrl';

    return (
      <div
        className={`px-3 py-2.5 rounded outline outline-1 outline-offset-[-1px] ${getOutlineClass()} inline-flex justify-between items-center transition-all ${className}`}
      >
        {/* Left Side: Icon + Input */}
        <div className="flex justify-start items-center gap-3 flex-1">
          <MagnifyingGlass className={`w-5 h-5 ${getIconColor()}`} weight="regular" />
          
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`flex-1 bg-transparent border-0 outline-none ${getTextColor()} text-sm placeholder:text-[color:var(--content-dark-tertiary,#9ca3af)] disabled:cursor-not-allowed`}
            {...props}
          />
        </div>

        {/* Right Side: Keyboard Shortcuts */}
        {showKeyboardShortcut && !disabled && (
          <div className="flex justify-start items-center gap-2 ml-2">
            {/* Command/Ctrl Key */}
            <div className="w-5 h-5 bg-[color:var(--background-tertiary,#f3f4f6)] rounded-sm flex justify-center items-center">
              {isMac ? (
                <Command className="w-4 h-4 text-[color:var(--content-dark-secondary,#4b5563)]" weight="regular" />
              ) : (
                <div className="text-[color:var(--content-dark-secondary,#4b5563)] text-xs font-medium">
                  ⌃
                </div>
              )}
            </div>
            
            {/* F Key */}
            <div className="w-5 h-5 bg-[color:var(--background-tertiary,#f3f4f6)] rounded-sm flex justify-center items-center">
              <div className="text-[color:var(--content-dark-secondary,#4b5563)] text-base font-medium leading-6">
                {shortcutKey}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
