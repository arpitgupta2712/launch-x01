"use client";

import React, { useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { ProgressTracker } from './progress-tracker';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './sheet';

interface ProcessReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProcessReportsResponse {
  success: boolean;
  message?: string;
  operationId?: string;
  venueCount?: number;
  estimatedDuration?: number;
  data?: any;
}

export function ProcessReportsModal({ open, onOpenChange }: ProcessReportsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [venueCount, setVenueCount] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [showProgress, setShowProgress] = useState(false);

  const clearError = () => setError(null);
  const clearOperationId = () => setOperationId(null);

  const handleProcessReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processReports}`, {
        method: 'POST',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
        body: JSON.stringify({}),
      });

      const data: ProcessReportsResponse = await response.json();

      if (response.ok) {
        // Extract operation ID if present
        const operationId = data.operationId || data.data?.operationId;
        if (operationId) {
          setOperationId(operationId);
        }
        
        // Extract venue count and estimated duration if present
        const venueCount = data.venueCount;
        const estimatedDuration = data.estimatedDuration;
        if (venueCount !== undefined) {
          setVenueCount(venueCount);
        }
        if (estimatedDuration !== undefined) {
          setEstimatedDuration(estimatedDuration);
        }
        
        // Show progress tracking
        if (operationId) {
          setShowProgress(true);
        } else {
          // If no operation ID, close modal
          onOpenChange(false);
        }
      } else {
        const errorMessage = data.message || 'Failed to start report processing';
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    clearError();
    clearOperationId();
    setShowProgress(false);
    setVenueCount(null);
    setEstimatedDuration(null);
  };

  const handleProgressComplete = () => {
    // Don't auto-close - let user manually close after reading logs
  };

  const handleProgressError = (errorMessage: string) => {
    // If progress tracking shows an error, show error and reset
    setShowProgress(false);
    setError(errorMessage);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] space-y-6">
        <SheetHeader>
          <SheetTitle>Process Reports</SheetTitle>
          <SheetDescription>
            {showProgress 
              ? "Your reports are being processed. Please wait while we handle your request."
              : "This will trigger the report processing operation. Are you sure you want to continue?"
            }
          </SheetDescription>
        </SheetHeader>
        
        {showProgress ? (
          <div className="space-y-4">
            <ProgressTracker 
              operationId={operationId} 
              venueCount={venueCount}
              estimatedDuration={estimatedDuration}
              onComplete={handleProgressComplete}
              onError={handleProgressError}
            />
            <div className="pt-4 border-t">
              <Button
                onClick={handleClose}
                className="w-full h-10"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 space-y-6">
              {/* Warning Message */}
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  ⚠️ Important Notice
                </Badge>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>This operation will:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Process all pending reports in the system</li>
                    <li>Generate comprehensive data exports</li>
                    <li>Update system statistics and analytics</li>
                    <li>May take several minutes to complete</li>
                  </ul>
                  <p className="font-medium text-foreground">
                    Are you sure you want to proceed?
                  </p>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Badge variant="destructive" className="w-full justify-center py-2">
                  {error}
                </Badge>
              )}
            </Card>

            <SheetFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProcessReports}
                disabled={isLoading}
                className="h-10"
                variant="default"
              >
                {isLoading ? 'Starting Process...' : 'Start Processing'}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
