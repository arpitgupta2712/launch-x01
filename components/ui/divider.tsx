import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const dividerVariants = cva(
  "relative flex items-center justify-center w-full my-8",
  {
    variants: {
      variant: {
        default: "h-px bg-gradient-to-r from-transparent via-border to-transparent",
        primary: "h-px bg-gradient-to-r from-transparent via-primary to-transparent",
        brand: "h-px bg-gradient-to-r from-transparent via-brand to-transparent",
        accent: "h-px bg-gradient-to-r from-transparent via-accent to-transparent",
        glow: "h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_8px_rgba(220,255,0,0.3)]",
        diamond: "h-8 relative overflow-hidden",
        arrow: "h-6 relative overflow-hidden",
      },
      size: {
        sm: "my-4",
        default: "my-8",
        lg: "my-12",
        xl: "my-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
}

function Divider({ className, variant, size, label, ...props }: DividerProps) {
  const renderDivider = () => {
    switch (variant) {

      case "diamond":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rotate-45 bg-primary animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </div>
        );

      case "arrow":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-0 h-0 border-l-[8px] border-l-primary border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      data-slot="divider"
      className={cn(dividerVariants({ variant, size, className }))}
      {...props}
    >
      {renderDivider()}
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-background px-4 py-1 text-sm font-medium text-muted-foreground border border-border rounded-full">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export { Divider, dividerVariants };
