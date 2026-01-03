"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Base styles matching design system
        "peer inline-flex h-6 w-12 shrink-0 items-center gap-2",
        "rounded-full p-1",
        "transition-all outline-none",
        
        // Checked state (ON) - Orange background
        "data-[state=checked]:bg-[var(--interaction-primary-base,#F97316)]",
        
        // Unchecked state (OFF) - White background
        "data-[state=unchecked]:bg-[var(--interaction-secondary-base,#FFFFFF)]",
        
        // Outline
        "outline outline-1 outline-offset-[-1px]",
        "outline-[var(--interaction-outline-base,#D9DFEB)]",
        
        // Focus state
        "focus-visible:outline-[var(--interaction-outline-active,#6D7076)]",
        
        // Disabled state
        "disabled:bg-[var(--interaction-secondary-disabled,#F7F9FB)]",
        "disabled:outline-[var(--interaction-outline-disabled,#E8ECF3)]",
        "disabled:cursor-not-allowed",
        
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full",
          "transition-transform",
          
          // Checked state - White thumb, moved to right
          "data-[state=checked]:bg-[var(--interaction-secondary-base,#FFFFFF)]",
          "data-[state=checked]:translate-x-6",
          
          // Unchecked state - Orange thumb, at left
          "data-[state=unchecked]:bg-[var(--interaction-primary-base,#F97316)]",
          "data-[state=unchecked]:translate-x-0",
          
          // Disabled state
          "disabled:bg-[var(--action-outline-hover,#A3A7B0)]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };