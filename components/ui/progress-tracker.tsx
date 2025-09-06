"use client";

import React from 'react';

import { useProgressTracking } from '@/lib/hooks/use-progress-tracking';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Badge } from './badge';
import { Beam } from './beam';
import { Card } from './card';
import { Divider } from './divider';
import { Item, ItemDescription, ItemIcon, ItemTitle } from './item';

interface ProgressTrackerProps {
  operationId: string | null;
  onComplete?: () => void;
}

export function ProgressTracker({ operationId, onComplete }: ProgressTrackerProps) {
  const { progress, error } = useProgressTracking(operationId);

  // Filter logs to show only important/summarized information
  const getFilteredLogs = (logs: Array<{ message: string; timestamp: string; level: string }>) => {
    if (!logs) return [];
    
    // Keywords that indicate important logs
    const importantKeywords = [
      'summary', 'complete', 'finished', 'success', 'error', 'failed',
      'total', 'duration', 'rate', 'export', 'batch', 'process'
    ];
    
    // Filter logs that contain important keywords or are error/warn level
    return logs.filter(log => {
      const message = log.message.toLowerCase();
      const isImportant = importantKeywords.some(keyword => message.includes(keyword));
      const isErrorOrWarn = log.level === 'error' || log.level === 'warn';
      return isImportant || isErrorOrWarn;
    });
  };

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

  const filteredLogs = getFilteredLogs(progress.logs || []);

  return (
    <Card className="p-6 space-y-6 relative overflow-hidden">
      {/* Background Effect */}
      {progress.status === 'completed' && (
        <Beam tone="brand" className="absolute inset-0 pointer-events-none" />
      )}
      
      {/* Progress Header */}
      <div className="flex items-center justify-between relative z-10">
        <ItemTitle className="text-lg">Email Report Generation</ItemTitle>
        <Badge variant={getStatusColor(progress.status)} className="animate-pulse">
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
      <div className="grid grid-cols-2 gap-4 relative z-10">
        <Item className="p-3 bg-muted/30 rounded-lg">
          <ItemTitle className="text-xs text-muted-foreground">Processed</ItemTitle>
          <ItemDescription className="text-sm font-semibold">
            {progress.current} of {progress.total}
          </ItemDescription>
        </Item>
        <Item className="p-3 bg-muted/30 rounded-lg">
          <ItemTitle className="text-xs text-muted-foreground">Duration</ItemTitle>
          <ItemDescription className="text-sm font-semibold">
            {progress.duration}s
          </ItemDescription>
        </Item>
      </div>

      {/* Operation Details */}
      {progress.data && (
        <div className="space-y-3 relative z-10">
          <Divider variant="glow" size="sm" />
          <Item className="p-3 bg-muted/20 rounded-lg">
            <ItemTitle className="text-xs text-muted-foreground">Operation</ItemTitle>
            <ItemDescription className="text-sm font-medium">
              {progress.data.operation}
            </ItemDescription>
          </Item>
          <Item className="p-3 bg-muted/20 rounded-lg">
            <ItemTitle className="text-xs text-muted-foreground">Date Range</ItemTitle>
            <ItemDescription className="text-sm font-medium">
              {progress.data.startDate} to {progress.data.endDate}
            </ItemDescription>
          </Item>
        </div>
      )}

      {/* Error Message */}
      {progress.status === 'failed' && progress.error && (
        <div className="relative z-10">
          <Item className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <ItemIcon className="text-destructive">
              <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                <span className="text-xs">⚠</span>
              </div>
            </ItemIcon>
            <ItemTitle className="text-destructive">Operation Failed</ItemTitle>
            <ItemDescription className="text-destructive/80">
              {progress.error}
            </ItemDescription>
          </Item>
        </div>
      )}

      {/* Success Message */}
      {progress.status === 'completed' && (
        <div className="relative z-10">
          <Item className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <ItemIcon className="text-green-600">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm">✓</span>
              </div>
            </ItemIcon>
            <ItemTitle className="text-green-800">Report Generated Successfully!</ItemTitle>
            <ItemDescription className="text-green-700">
              Your email report has been generated and sent to your email address.
            </ItemDescription>
          </Item>
        </div>
      )}

      {/* Operation Logs */}
      {filteredLogs.length > 0 && (
        <div className="relative z-10">
          <Accordion type="single" collapsible>
            <AccordionItem value="logs">
              <AccordionTrigger>
                <span>Important Logs ({filteredLogs.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {filteredLogs.map((log, index) => (
                    <Item key={index} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <ItemIcon className="mt-0.5">
                          <Badge 
                            variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'secondary' : 'outline'}
                            size="sm"
                            className="text-xs"
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                        </ItemIcon>
                        <div className="flex-1 space-y-1">
                          <ItemDescription className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </ItemDescription>
                          <ItemDescription className={`text-sm ${getLogLevelColor(log.level)}`}>
                            {log.message}
                          </ItemDescription>
                        </div>
                      </div>
                    </Item>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </Card>
  );
}
