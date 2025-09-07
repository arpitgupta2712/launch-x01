"use client";

import React from 'react';

import { useProgressTracking } from '@/lib/hooks/use-progress-tracking';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Badge } from '../ui/badge';
import { Beam } from '../ui/beam';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Divider } from '../ui/divider';
import { Item, ItemDescription, ItemIcon, ItemTitle } from '../ui/item';

interface ProgressTrackerProps {
  operationId: string | null;
  venueCount?: number | null;
  estimatedDuration?: number | null;
  onComplete?: () => void;
  onError?: (errorMessage: string) => void;
}

export function ProgressTracker({ operationId, venueCount, estimatedDuration, onComplete, onError }: ProgressTrackerProps) {
  const { progress, error } = useProgressTracking(operationId, venueCount);
  const hasCalledComplete = React.useRef(false);

  // Reset the completion flag when operation ID changes
  React.useEffect(() => {
    hasCalledComplete.current = false;
  }, [operationId]);

  // Format date to natural readable format (e.g., "1st August 2025")
  const formatNaturalDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day >= 11 && day <= 13) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

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
    }).map(log => ({
      ...log,
      // Remove emojis and clean up the message
      message: log.message
        .replace(/[📧🚀⚙️✅🏁📋📅⏱️🏆❌]/g, '') // Remove emojis
        .replace(/^\s*\[.*?\]\s*/, '') // Remove [uuid] prefixes
        .trim()
    }));
  };

  // Call onComplete when operation finishes (only once)
  React.useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'timeout')) {
      if (!hasCalledComplete.current) {
        hasCalledComplete.current = true;
        onComplete?.();
        
        // If operation failed with authentication error, notify parent
        if (progress.status === 'failed' && progress.error && onError) {
          onError(progress.error);
        }
      }
    }
  }, [progress?.status, onComplete, onError]);

  // Debug: Log progress data to understand the structure
  React.useEffect(() => {
    if (progress) {
      console.log('Progress data:', {
        current: progress.current,
        total: progress.total,
        processedLocations: progress.data?.processedLocations?.length,
        data: progress.data
      });
    }
  }, [progress]);

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
      case 'error': return 'text-destructive';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-primary';
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
        <ItemTitle className="text-lg">
          {progress.data?.operation === 'bookingsProcess' ? 'Booking Files Processing' : 
           progress.data?.operation === 'process' ? 'Report Processing' : 'Email Report Generation'}
        </ItemTitle>
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

      {/* Progress Info - AdminStats Style */}
      <div className="relative z-10">
        <div className="text-center p-4 bg-muted/20 rounded-lg">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Processed</span>
            <span className="text-primary font-bold">
              {progress.current} of {progress.total}
            </span>
            <span className="text-muted-foreground">
              {progress.data?.operation === 'bookingsProcess' ? 'files' : 'venues'} in
            </span>
            <span className="text-primary font-bold">
              {progress.duration}s
            </span>
            {estimatedDuration && (
              <>
                <span className="text-muted-foreground">(est.</span>
                <span className="text-primary font-bold">
                  {estimatedDuration}s
                </span>
                <span className="text-muted-foreground">)</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Display */}
      {progress.data && (
        <div className="relative z-10">
          <Badge variant="outline" className="w-full justify-center py-2">
            {formatNaturalDate(progress.data.startDate)} to {formatNaturalDate(progress.data.endDate)}
          </Badge>
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
        <div className="relative z-10 space-y-3">
          <Badge variant="default" className="w-full justify-center py-2">
            {progress.data?.operation === 'bookingsProcess' ? 'Booking Files Processed Successfully' : 
             progress.data?.operation === 'process' ? 'Reports Processed Successfully' : 'Report Generated Successfully'}
          </Badge>
          
          {/* Success Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-green-800">
                {progress.current || 0}
              </div>
              <div className="text-sm text-green-700">
                {progress.data?.operation === 'bookingsProcess' ? 'Files Processed Successfully' : 'Venues Processed Successfully'}
              </div>
              {progress.duration && (
                <div className="text-xs text-green-600">
                  Completed in {progress.duration}s
                </div>
              )}
            </div>
          </div>
          
          {/* Processed Locations */}
          {progress.data?.processedLocations && progress.data.processedLocations.length > 0 ? (
            <div className="space-y-2">
              <ItemTitle className="text-sm text-muted-foreground">Processed Venues</ItemTitle>
              <div className="max-h-32 overflow-y-auto border rounded-lg p-2 bg-muted/10">
                <div className="grid grid-cols-1 gap-2">
                  {progress.data.processedLocations.slice(0, 10).map((location, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="justify-between"
                    >
                      <span>{location.name}</span>
                      <Badge variant="secondary" size="sm">
                        {location.status}
                      </Badge>
                    </Badge>
                  ))}
                  {progress.data.processedLocations.length > 10 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      ... and {progress.data.processedLocations.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary" className="w-full justify-center py-2">
                No venues processed for the selected date range
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Operation Logs - Disabled for cleaner UI */}
      {false && filteredLogs.length > 0 && (
        <div className="relative z-10">
          <Divider variant="arrow" size="sm" />
          <Accordion type="single" collapsible>
            <AccordionItem value="logs">
              <AccordionTrigger className="w-full justify-between">
                <span>Important Logs ({filteredLogs.length})</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {filteredLogs.map((log, index) => (
                    <Card key={index} className="p-3">
                      <CardHeader className="p-0 pb-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={log.level === 'error' ? 'destructive' : log.level === 'warn' ? 'secondary' : 'outline'}
                            size="sm"
                            className="text-xs"
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                          <CardDescription className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <CardDescription className={`text-sm ${getLogLevelColor(log.level)}`}>
                          {log.message}
                        </CardDescription>
                      </CardContent>
                    </Card>
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
