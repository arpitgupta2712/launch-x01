import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-input bg-transparent hover:border-primary/50 focus-visible:border-primary",
        glass:
          "glass-2 border-border/50 bg-card/20 backdrop-blur-sm hover:glass-3 focus-visible:glass-4 focus-visible:border-primary/50",
        glow:
          "border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 focus-visible:border-primary focus-visible:bg-primary/10 focus-visible:shadow-[0_0_8px_rgba(220,255,0,0.3)]",
        outline:
          "border-border bg-background hover:border-primary/50 focus-visible:border-primary",
        ghost:
          "border-transparent bg-transparent hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:border-primary/50",
      },
      inputSize: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-10 px-4 py-2",
        xl: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input, inputVariants };
