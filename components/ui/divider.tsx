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
        chevron: "h-8 relative overflow-hidden",
        zigzag: "h-6 relative overflow-hidden", 
        diamond: "h-8 relative overflow-hidden",
        arrow: "h-6 relative overflow-hidden",
        geometric: "h-12 relative",
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
      case "chevron":
        return (
          <div className="absolute inset-0 flex items-center">
            <svg
              viewBox="0 0 1200 32"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path
                d="M0,16 L40,0 L80,16 L120,0 L160,16 L200,0 L240,16 L280,0 L320,16 L360,0 L400,16 L440,0 L480,16 L520,0 L560,16 L600,0 L640,16 L680,0 L720,16 L760,0 L800,16 L840,0 L880,16 L920,0 L960,16 L1000,0 L1040,16 L1080,0 L1120,16 L1160,0 L1200,16 L1200,32 L0,32 Z"
                className="fill-primary"
              />
            </svg>
          </div>
        );

      case "zigzag":
        return (
          <div className="absolute inset-0 flex items-center">
            <svg
              viewBox="0 0 1200 24"
              preserveAspectRatio="none"
              className="w-full h-full"
            >
              <path
                d="M0,12 L30,0 L60,12 L90,0 L120,12 L150,0 L180,12 L210,0 L240,12 L270,0 L300,12 L330,0 L360,12 L390,0 L420,12 L450,0 L480,12 L510,0 L540,12 L570,0 L600,12 L630,0 L660,12 L690,0 L720,12 L750,0 L780,12 L810,0 L840,12 L870,0 L900,12 L930,0 L960,12 L990,0 L1020,12 L1050,0 L1080,12 L1110,0 L1140,12 L1170,0 L1200,12 L1200,24 L0,24 Z"
                className="fill-primary"
              />
            </svg>
          </div>
        );

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

      case "geometric":
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-6">
              <div className="w-6 h-6 rotate-45 bg-primary/30 border-2 border-primary" />
              <div className="w-16 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <div className="w-4 h-4 bg-primary rotate-12" />
              <div className="w-16 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <div className="w-6 h-6 rotate-45 bg-primary/30 border-2 border-primary" />
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
