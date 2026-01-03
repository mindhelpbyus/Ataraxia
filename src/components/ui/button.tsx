import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 font-['Inter']",
  {
    variants: {
      variant: {
        // Primary - Orange brand color with white text
        default: 
          "bg-[var(--action-primary-base)] text-[var(--content-light-primary)] hover:bg-[var(--action-primary-hover)] active:bg-[var(--action-primary-active)] disabled:bg-[var(--action-primary-disabled)] disabled:text-[var(--content-light-disable)]",
        
        // Secondary - Gray background with dark text
        secondary:
          "bg-[var(--action-secondary-base-2)] text-[var(--content-dark-primary)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)] disabled:bg-[var(--action-secondary-disabled)] disabled:text-[var(--content-dark-disable)]",
        
        // Outline - White background with border
        outline:
          "bg-[var(--action-secondary-base)] border border-[var(--action-outline-base)] text-[var(--content-dark-primary)] hover:bg-[var(--action-secondary-hover)] hover:border-[var(--action-outline-hover)] active:bg-[var(--action-secondary-active)] active:border-[var(--action-outline-active)] disabled:border-[var(--action-outline-disabled)] disabled:text-[var(--content-dark-disable)]",
        
        // Destructive - Red outline with red text
        destructive:
          "border border-[var(--action-destructive-base)] text-[var(--action-destructive-base)] hover:bg-[var(--background-red)] hover:border-[var(--action-destructive-hover)] hover:text-[var(--action-destructive-hover)] active:bg-[var(--background-red)] active:border-[var(--action-destructive-active)] active:text-[var(--action-destructive-active)] disabled:border-[var(--background-red)] disabled:text-[var(--action-destructive-disabled)]",
        
        // Ghost - Transparent background
        ghost:
          "text-[var(--content-dark-primary)] hover:bg-[var(--action-secondary-hover)] active:bg-[var(--action-secondary-active)] disabled:text-[var(--content-dark-disable)]",
        
        // Link - Underlined text
        link: 
          "text-[var(--action-primary-base)] underline-offset-4 underline hover:text-[var(--action-primary-hover)] disabled:text-[var(--content-dark-disable)]",
      },
      size: {
        // Large - 18px text, py-3 px-4
        lg: "h-12 px-4 py-3 text-lg leading-7 has-[>svg]:px-3.5",
        
        // Medium (default) - 16px text, py-2 px-4
        default: "h-10 px-4 py-2 text-base leading-6 has-[>svg]:px-3",
        
        // Small - 14px text, py-2 px-3
        sm: "h-9 gap-1 px-3 py-2 text-sm leading-5 has-[>svg]:px-2.5",
        
        // Extra Small - 12px text, py-2 px-3
        xs: "h-8 gap-1 px-3 py-2 text-xs leading-4 has-[>svg]:px-2.5",
        
        // Icon Large - 24px x 24px icon, p-3
        "icon-lg": "size-12 p-3",
        
        // Icon Medium - 20px x 20px icon, p-2.5
        "icon": "size-10 p-2.5",
        
        // Icon Small - 16px x 16px icon, p-2
        "icon-sm": "size-9 p-2",
        
        // Icon Extra Small - 14px x 14px icon, p-2
        "icon-xs": "size-8 p-2",
      },
      shape: {
        // Standard rounded corners
        default: "rounded",
        
        // Pill-shaped (fully rounded) - typically for icon buttons
        pill: "rounded-[100px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>((
  {
    className,
    variant,
    size,
    shape,
    asChild = false,
    ...props
  },
  ref
) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = "Button";

export { Button, buttonVariants };
