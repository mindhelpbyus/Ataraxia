"use client";

import * as React from "react";
import { cn } from "./utils";

const Switch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { onCheckedChange?: (checked: boolean) => void }>(
  ({ className, checked, onCheckedChange, onChange, disabled, ...props }, ref) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Call standard onChange if provided
      if (onChange) {
        onChange(e);
      }
      // Call adapter for Radix-style onCheckedChange
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <label className={cn(
        "relative inline-flex items-center cursor-pointer no-tap-highlight",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}>
        <input
          type="checkbox"
          className="peer sr-only"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          {...props}
        />
        <div className={cn(
          // Base Track
          "w-11 h-6 rounded-full peer transition-colors duration-200 ease-in-out border-2 box-border",

          // Unchecked State (Default)
          "bg-white border-orange-200",

          // Checked State
          "peer-checked:bg-orange-500 peer-checked:border-orange-500",

          // Focus Ring
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 peer-focus:ring-offset-2",

          // Thumb (Using :after pseudo-element)
          "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
          "after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm",

          // Thumb Colors
          "after:bg-orange-400", // Unchecked
          "peer-checked:after:bg-white", // Checked

          // Checked Thumb Position
          // 44px (width) - 4px (border) = 40px internal. 
          // Thumb is 16px. 
          // Left is 2px. Total used left space = 2px + 16px = 18px.
          // Remaining space = 40px - 16px = 24px.
          // Translate X should be 20px (Translate 5 rem? No, Tailwind 5 is 1.25rem = 20px).
          "peer-checked:after:translate-x-5"
        )}></div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };