"use client";

import { 
  ArrowRight,
  BarChart3,
  CloudUpload,
  Database,
  FolderOpen, 
  Inbox,
  Mail, 
  Sparkles,
  Upload, 
  Zap
} from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface ReportMethod {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  bgIcon: React.ElementType;
  onClick: () => void;
  recommended?: boolean;
}

interface ReportProcessorProps {
  onSelectEmailReports: () => void;
  onSelectBucketFiles: () => void;
  onSelectFileUpload: () => void;
  className?: string;
}

export function ReportProcessor({ 
  onSelectEmailReports, 
  onSelectBucketFiles, 
  onSelectFileUpload,
  className,
}: ReportProcessorProps) {
  const [hoveredMethod, setHoveredMethod] = React.useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);

  const methods: ReportMethod[] = [
    {
      id: 'email',
      title: 'Email Reports',
      description: 'Auto-generate from email data',
      icon: Mail,
      bgIcon: Inbox,
      onClick: onSelectEmailReports,
      recommended: true
    },
    {
      id: 'bucket',
      title: 'Cloud Storage',
      description: 'Process existing bucket files',
      icon: FolderOpen,
      bgIcon: Database,
      onClick: onSelectBucketFiles
    },
    {
      id: 'upload',
      title: 'Direct Upload',
      description: 'Upload & process instantly',
      icon: Upload,
      bgIcon: CloudUpload,
      onClick: onSelectFileUpload,
    }
  ];

  const handleMethodClick = (method: ReportMethod) => {
    setSelectedMethod(method.id);
    setTimeout(() => {
      method.onClick();
    }, 200);
  };

  return (
    <div className={cn("w-full max-w-[600px]", className)}>
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-muted">
        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center items-center gap-2">
            <div className="relative">
              <BarChart3 className="w-5 h-5 text-primary" />
              <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
              Report Generation Hub
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose your preferred data source
          </p>
        </div>
        
        {/* Method Cards */}
        <div className="space-y-3">
          {methods.map((method, index) => {
            const isHovered = hoveredMethod === method.id;
            const isSelected = selectedMethod === method.id;
            const MethodIcon = method.icon;
            const BgIcon = method.bgIcon;
            
            return (
              <div
                key={method.id}
                className="relative"
                style={{ 
                  animationDelay: `${index * 100}ms` 
                }}
              >
                {method.recommended && (
                  <div className="absolute -top-2 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] px-2 py-0.5 shadow-lg">
                      <Zap className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                <Button
                  onClick={() => handleMethodClick(method)}
                  variant="outline"
                  onMouseEnter={() => setHoveredMethod(method.id)}
                  onMouseLeave={() => setHoveredMethod(null)}
                   className={cn(
                     "w-full h-auto p-4 relative overflow-hidden transition-all duration-300 group",
                     "hover:shadow-lg hover:scale-[1.02] hover:border-primary/50 hover:bg-primary/5",
                     "bg-gradient-to-br from-background to-background/80",
                     {
                       "ring-2 ring-primary ring-offset-2 scale-[1.02]": isSelected,
                       "border-primary/30": method.recommended
                     }
                   )}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <BgIcon className="absolute -right-4 -bottom-4 w-32 h-32 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <div className="flex items-start gap-4">
                      {/* Icon Container */}
                      <div className="relative flex-shrink-0">
                         <div className={cn(
                           "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                           "bg-gradient-to-br from-primary/20 to-primary/10",
                           "group-hover:from-primary/40 group-hover:to-primary/30",
                           "group-hover:rotate-3 group-hover:scale-110"
                         )}>
                          <MethodIcon className={cn(
                            "w-6 h-6 text-primary transition-transform duration-300",
                            isHovered && "scale-110"
                          )} />
                        </div>
                        {isHovered && (
                          <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/20 animate-ping" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                             <div className={cn(
                               "font-semibold text-sm flex items-center gap-2 transition-colors duration-300",
                               isHovered ? "text-primary" : "text-foreground"
                             )}>
                               {method.title}
                               <ArrowRight className={cn(
                                 "w-3 h-3 transition-all duration-300",
                                 isHovered ? "translate-x-1 opacity-100 text-primary" : "translate-x-0 opacity-0 text-muted-foreground"
                               )} />
                             </div>
                            <div className={cn(
                              "text-xs mt-0.5 transition-colors duration-300",
                              isHovered ? "text-primary/80" : "text-muted-foreground"
                            )}>
                              {method.description}
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                    
                    {/* Progress indicator for selected state */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse" />
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Floating Status Indicator */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Ready</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Example usage component for demonstration
export default function ReportProcessorDemo() {
  return (
    <div className="min-h-screen bg-background p-8 flex items-center justify-center">
      <ReportProcessor
        onSelectEmailReports={() => console.log('Email reports selected')}
        onSelectBucketFiles={() => console.log('Bucket files selected')}
        onSelectFileUpload={() => console.log('File upload selected')}
      />
    </div>
  );
}