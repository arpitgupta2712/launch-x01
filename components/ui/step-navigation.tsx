"use client";

import { 
  AlertCircle, 
  Check, 
  ChevronRight,
  Loader2,
  Sparkles,
  Target,
  Trophy,
  Zap
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  icon?: React.ElementType;
}

interface StepNavigationProps {
  steps: Step[];
  currentStep: string;
  className?: string;
  onStepClick?: (stepId: string) => void;
  compact?: boolean;
}

export function StepNavigation({ 
  steps, 
  className,
  onStepClick,
  compact = false
}: Omit<StepNavigationProps, 'currentStep'>) {
  const [hoveredStep, setHoveredStep] = React.useState<string | null>(null);
  
  // Default icons for steps if not provided
  const defaultIcons = [Target, Zap, Sparkles, Trophy];
  
  return (
    <div className={cn("w-full p-4", className)}>
      <div className="relative">
        {/* Background line */}
        <div className={cn("absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted-foreground/20 via-primary/20 to-muted-foreground/20", 
          compact ? "left-4" : "left-6")} />
        
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isError = step.status === 'error';
          const isPending = step.status === 'pending';
          const isHovered = hoveredStep === step.id;
          const StepIcon = step.icon || defaultIcons[index % defaultIcons.length];
          
          return (
            <div
              key={step.id}
              className={cn(
                "relative flex items-start transition-all duration-300",
                compact ? "gap-4 pb-4 last:pb-0" : "gap-4 pb-8 last:pb-0",
                {
                  "scale-[1.02]": isHovered,
                  "cursor-pointer": onStepClick && (isCompleted || isCurrent),
                  "opacity-60": isPending && !isHovered,
                }
              )}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              onClick={() => onStepClick && (isCompleted || isCurrent) && onStepClick(step.id)}
            >
              {/* Progress line overlay */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute bottom-0 w-0.5 transition-all duration-500",
                    compact ? "left-4 top-8" : "left-6 top-12",
                    {
                      "bg-gradient-to-b from-accent to-accent/50": isCompleted,
                      "bg-gradient-to-b from-primary to-transparent animate-pulse": isCurrent,
                    }
                  )}
                />
              )}
              
              {/* Step indicator */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 transition-all duration-300 shadow-lg",
                    compact ? "w-8 h-8" : "w-12 h-12",
                    {
                      "bg-gradient-to-br from-accent to-accent/80 border-accent text-accent-foreground shadow-accent/30": isCompleted,
                      "bg-gradient-to-br from-primary to-primary/80 border-primary text-primary-foreground shadow-primary/30 animate-pulse": isCurrent,
                      "bg-gradient-to-br from-destructive to-destructive/80 border-destructive text-destructive-foreground shadow-destructive/30": isError,
                      "bg-background border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50": isPending,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={3} />
                  ) : isError ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <StepIcon className="w-5 h-5" />
                      <div className="absolute inset-0 animate-ping">
                        <StepIcon className="w-5 h-5 opacity-40" />
                      </div>
                    </div>
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Step number badge */}
                <div
                  className={cn(
                    "absolute -top-1 -right-1 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                    compact ? "w-4 h-4" : "w-5 h-5",
                    {
                      "bg-accent text-accent-foreground": isCompleted,
                      "bg-primary text-primary-foreground": isCurrent,
                      "bg-destructive text-destructive-foreground": isError,
                      "bg-muted text-muted-foreground": isPending,
                    }
                  )}
                >
                  {index + 1}
                </div>
              </div>
              
              {/* Step content */}
              <div className={cn("flex-1 min-w-0", compact ? "pt-0" : "pt-1")}>
                <div className="flex items-center gap-2">
                  <h3
                    className={cn(
                      "font-semibold transition-colors duration-300",
                      compact ? "text-xs" : "text-sm",
                      {
                        "text-accent": isCompleted,
                        "text-primary": isCurrent,
                        "text-destructive": isError,
                        "text-muted-foreground": isPending,
                      }
                    )}
                  >
                    {step.title}
                  </h3>
                  {isCurrent && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  )}
                  {isHovered && (isCompleted || isCurrent) && onStepClick && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground animate-in slide-in-from-left-1" />
                  )}
                </div>
                
                {step.description && !compact && (
                  <p
                    className={cn(
                      "text-xs mt-1 transition-all duration-300",
                      {
                        "text-muted-foreground": !isError,
                        "text-destructive/80": isError,
                      }
                    )}
                  >
                    {step.description}
                  </p>
                )}
                
                {/* Progress indicator for current step */}
                {isCurrent && (
                  <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-gradient-to-r from-primary to-primary/60 rounded-full animate-pulse" />
                  </div>
                )}
                
                {/* Success message for completed */}
                {isCompleted && isHovered && (
                  <div className="mt-2 text-[10px] text-accent/80 font-medium animate-in fade-in slide-in-from-bottom-1">
                    ✓ Completed
                  </div>
                )}
                
                {/* Error details */}
                {isError && (
                  <div className="mt-2 text-[10px] text-destructive/80 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Action required
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Example usage component for demonstration
export default function StepNavigationDemo() {
  const steps: Step[] = [
    {
      id: 'step1',
      title: 'Setup Project',
      description: 'Initialize and configure',
      status: 'completed',
      icon: Target
    },
    {
      id: 'step2',
      title: 'Build Components',
      description: 'Create UI elements',
      status: 'current',
      icon: Zap
    },
    {
      id: 'step3',
      title: 'Add Interactions',
      description: 'Make it interactive',
      status: 'pending',
      icon: Sparkles
    },
    {
      id: 'step4',
      title: 'Deploy',
      description: 'Ship to production',
      status: 'pending',
      icon: Trophy
    }
  ];
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="bg-card border rounded-lg shadow-sm">
        <StepNavigation 
          steps={steps} 
          onStepClick={(stepId) => console.log('Clicked:', stepId)}
        />
      </div>
    </div>
  );
}