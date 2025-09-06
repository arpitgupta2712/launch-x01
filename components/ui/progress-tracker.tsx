"use client";

import React from 'react';

import { useProgressTracking } from '@/lib/hooks/use-progress-tracking';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Badge } from './badge';
import { Card } from './card';

interface ProgressTrackerProps {
  operationId: string | null;
  onComplete?: () => void;
}

export function ProgressTracker({ operationId, onComplete }: ProgressTrackerProps) {
  const { progress, error } = useProgressTracking(operationId);

  // Call onComplete when operation finishes
  React.useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'timeout')) {
      onComplete?.();
    }
  }, [progress, onComplete]);

  if (!operationId) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          Waiting for operation to start...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border-destructive">
        <div className="text-destructive">
          <strong>Error:</strong> {error}
        </div>
      </Card>
    );
  }

  if (!progress) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
          <div className="text-muted-foreground">Loading progress...</div>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'timeout': return 'destructive';
      case 'running': return 'brand';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600';
      case 'warn': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Email Report Generation</h3>
        <Badge variant={getStatusColor(progress.status)}>
          {progress.status.toUpperCase()}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress.progress}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Progress Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-muted-foreground">Processed:</div>
          <div className="font-medium">{progress.current} of {progress.total}</div>
        </div>
        <div className="space-y-1">
          <div className="text-muted-foreground">Duration:</div>
          <div className="font-medium">{progress.duration}s</div>
        </div>
      </div>

      {/* Operation Details */}
      {progress.data && (
        <div className="text-sm space-y-2">
          <div className="space-y-1">
            <div className="text-muted-foreground">Operation:</div>
            <div className="font-medium">{progress.data.operation}</div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Date Range:</div>
            <div className="font-medium">
              {progress.data.startDate} to {progress.data.endDate}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {progress.status === 'failed' && progress.error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md space-y-2">
          <div className="text-destructive font-medium">Operation Failed</div>
          <div className="text-destructive/80 text-sm">{progress.error}</div>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'completed' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md space-y-2">
          <div className="text-green-800 font-medium">✅ Report Generated Successfully!</div>
          <div className="text-green-700 text-sm">
            Your email report has been generated and sent to your email address.
          </div>
        </div>
      )}

      {/* Operation Logs */}
      {progress.logs && progress.logs.length > 0 && (
        <Accordion type="single" collapsible>
          <AccordionItem value="logs">
            <AccordionTrigger>
              <span>Operation Logs ({progress.logs.length})</span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {progress.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground text-xs mt-0.5 min-w-[60px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-mono text-xs ${getLogLevelColor(log.level)}`}>
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </Card>
  );
}
