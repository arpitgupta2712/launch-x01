"use client";

import React from 'react';

import { useProgressPersistence } from '@/lib/hooks/use-progress-persistence';
import { useProgressTracking } from '@/lib/hooks/use-progress-tracking';

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Item, ItemDescription, ItemIcon, ItemTitle } from '../ui/item';

interface ProgressTrackerProps {
  operationId: string | null;
  venueCount?: number | null;
  estimatedDuration?: number | null;
  onComplete?: () => void;
  onError?: (errorMessage: string) => void;
}

export function ProgressTracker({ operationId, venueCount, onComplete, onError }: ProgressTrackerProps) {
  const { progress, error } = useProgressTracking(operationId, venueCount);
  const { saveProgressSummary } = useProgressPersistence();
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

  // Get venue name from venueNames mapping or fallback to location name/ID
  const getVenueName = (location: { id: string; name: string }) => {
    if (progress?.data?.venueNames?.[location.id]) {
      return progress.data.venueNames[location.id];
    }
    // Fallback to location name if available, otherwise show truncated ID
    return location.name || `Venue ${location.id.substring(0, 8)}...`;
  };

  // Extract currently processing venue from logs with better parsing
  const getCurrentVenue = () => {
    if (!progress?.logs) return null;
    
    // Look for the most recent processing log
    const processingLogs = progress.logs.filter(log => 
      log.message.includes("🏢 Processing bookings for:") ||
      log.message.includes("Processing bookings for:") ||
      log.message.includes("Processing venue:")
    );
    
    if (processingLogs.length > 0) {
      const latestLog = processingLogs[processingLogs.length - 1];
      // Try multiple patterns to extract venue name
      const patterns = [
        /🏢 Processing bookings for: (.+?)(?:\s*\(|$)/,
        /Processing bookings for: (.+?)(?:\s*\(|$)/,
        /Processing venue: (.+?)(?:\s*\(|$)/
      ];
      
      for (const pattern of patterns) {
        const match = latestLog.message.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }
    return null;
  };

  // Extract all processed venues from logs with better parsing
  const getProcessedVenues = React.useCallback(() => {
    if (!progress?.logs) return [];
    
    const processedVenues: Array<{name: string, status: 'success' | 'failed', timestamp: string}> = [];
    
    progress.logs.forEach(log => {
      // Success patterns
      if (log.message.includes("✅ File processed successfully:") || 
          log.message.includes("File processed successfully:")) {
        const patterns = [
          /for: ([^(]+)/,
          /for ([^(]+)/,
          /venue: ([^(]+)/,
          /Processing ([^(]+) completed/
        ];
        
        for (const pattern of patterns) {
          const match = log.message.match(pattern);
          if (match) {
            processedVenues.push({
              name: match[1].trim(),
              status: 'success',
              timestamp: log.timestamp
            });
            break;
          }
        }
      }
      
      // Failure patterns
      if (log.message.includes("❌ Failed to process") || 
          log.message.includes("Failed to process") ||
          log.message.includes("Error processing")) {
        const patterns = [
          /for: ([^(]+)/,
          /for ([^(]+)/,
          /venue: ([^(]+)/,
          /Processing ([^(]+) failed/
        ];
        
        for (const pattern of patterns) {
          const match = log.message.match(pattern);
          if (match) {
            processedVenues.push({
              name: match[1].trim(),
              status: 'failed',
              timestamp: log.timestamp
            });
            break;
          }
        }
      }
    });
    
    // Remove duplicates and sort by timestamp
    const uniqueVenues = processedVenues.reduce((acc, venue) => {
      if (!acc.find(v => v.name === venue.name)) {
        acc.push(venue);
      }
      return acc;
    }, [] as typeof processedVenues);
    
    return uniqueVenues.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [progress?.logs]);


  // Call onComplete when operation finishes (only once)
  React.useEffect(() => {
    if (progress && (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'timeout')) {
      if (!hasCalledComplete.current) {
        hasCalledComplete.current = true;
        
        // Save progress summary to localStorage
        if (operationId) {
          const processedVenues = getProcessedVenues();
          saveProgressSummary({
            id: operationId,
            operation: progress.data?.operation || 'unknown',
            status: progress.status,
            total: progress.total,
            processed: progress.data?.processedLocations?.length || progress.current,
            duration: progress.duration,
            startTime: progress.startTime,
            endTime: progress.endTime || new Date().toISOString(),
            error: progress.error,
            venueNames: progress.data?.venueNames,
            processedLocations: progress.data?.processedLocations,
            processedVenuesFromLogs: processedVenues.map(v => v.name), // Add venue names extracted from logs
          });
        }
        
        onComplete?.();
        
        // If operation failed with authentication error, notify parent
        if (progress.status === 'failed' && progress.error && onError) {
          onError(progress.error);
        }
      }
    }
  }, [progress, onComplete, onError, operationId, saveProgressSummary, getProcessedVenues]);

  // Debug: Log progress data to understand the structure
  React.useEffect(() => {
    if (progress) {
      console.log('Progress data:', {
        current: progress.current,
        total: progress.total,
        processedLocations: progress.data?.processedLocations?.length,
        venueNames: progress.data?.venueNames,
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
      case 'completed': return 'accent';
      case 'failed': return 'destructive';
      case 'timeout': return 'destructive';
      case 'running': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <Card className="p-6 space-y-6 relative overflow-hidden">
      
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
            className={`h-3 rounded-full transition-all duration-300 ease-out ${
              progress.status === 'completed' ? 'bg-accent' : 'bg-primary'
            }`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Current Venue Processing - Enhanced */}
      {progress.data?.operation === 'bookingsProcess' && (
        <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-lg">🏢</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-muted-foreground mb-1">Currently processing:</div>
              <div className="font-semibold text-primary truncate">
                {getCurrentVenue() || `Venue ${progress.current + 1} of ${progress.total}`}
              </div>
              {getCurrentVenue() && (
                <div className="text-xs text-muted-foreground mt-1">
                  Processing in progress...
                </div>
              )}
            </div>
            {progress.status === 'running' && (
              <div className="flex-shrink-0">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processed Venues List - Enhanced */}
      {progress.data?.operation === 'bookingsProcess' && getProcessedVenues().length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-muted-foreground">
                Processed Venues ({getProcessedVenues().length})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  {getProcessedVenues().filter(v => v.status === 'success').length} done
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-muted-foreground">
                  {getProcessedVenues().filter(v => v.status === 'failed').length} failed
                </span>
              </div>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {getProcessedVenues().map((venue, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background/50 rounded border">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      venue.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium truncate">{venue.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge 
                      variant={venue.status === 'success' ? 'accent' : 'destructive'} 
                      size="sm"
                      className="text-xs"
                    >
                      {venue.status === 'success' ? '✓' : '✗'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(venue.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Info - AdminStats Style */}
      <div className="relative z-10">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
            <span className="text-muted-foreground">Processed</span>
            <span className={`font-bold ${progress.status === 'completed' ? 'text-accent' : 'text-primary'}`}>
              {progress.status === 'completed' 
                ? (progress.data?.processedLocations?.length || progress.total)
                : progress.current} of {progress.total}
            </span>
            <span className="text-muted-foreground">
              {progress.data?.operation === 'bookingsProcess' ? 'files' : 'venues'} in
            </span>
            <span className={`font-bold ${progress.status === 'completed' ? 'text-accent' : 'text-primary'}`}>
              {progress.duration}s
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Display */}
      {progress.data && progress.data.startDate && progress.data.endDate && (
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
          <Badge variant="accent" className="w-full justify-center py-2 font-bold">
            {progress.data?.operation === 'bookingsProcess' ? 'Booking Files Processed Successfully' : 
             progress.data?.operation === 'process' ? 'Reports Processed Successfully' : 'Report Generated Successfully'}
          </Badge>
          
          {/* Processed Locations */}
          {progress.data?.processedLocations && progress.data.processedLocations.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <ItemTitle className="text-sm text-muted-foreground">Processed Venues</ItemTitle>
                {progress.data?.venueNames && Object.keys(progress.data.venueNames).length > 0 && (
                  <Badge variant="secondary" size="sm" className="text-xs">
                    Enhanced Names
                  </Badge>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto border rounded-lg p-2 bg-muted/10">
                <div className="grid grid-cols-1 gap-2">
                  {progress.data.processedLocations.slice(0, 10).map((location, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="justify-between"
                    >
                      <span>{getVenueName(location)}</span>
                      <Badge 
                        variant={location.status === 'success' ? 'accentReverse' : 'secondary'} 
                        size="sm"
                      >
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

    </Card>
  );
}
