"use client";

import React, { useState, useEffect } from 'react';

import { API_CONFIG } from '@/lib/api/config';
import { useOperation } from '@/lib/contexts/operation-context';
import { useToast } from './toast';

import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { BucketFilesSummary } from './bucket-files-summary';
import { FileUploader } from './file-uploader';
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
  const { currentOperation, setCurrentOperation, updateOperation, clearOperation, isOperationRunning } = useOperation();
  const { addToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'files' | 'upload' | 'confirm' | 'processing'>('files');

  // Check if there's a running operation when modal opens
  useEffect(() => {
    if (open && currentOperation && isOperationRunning) {
      setCurrentStep('processing');
    }
  }, [open, currentOperation?.id, isOperationRunning]);

  const clearError = () => setError(null);
  const clearUploadError = () => setUploadError(null);

  const handleUploadSuccess = (fileName: string) => {
    setUploadedFileName(fileName);
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadedFileName(null);
  };

  const handleExistingFileSelect = (fileName: string) => {
    setSelectedExistingFile(fileName);
    setCurrentStep('confirm');
  };

  const handleUploadNewFile = () => {
    setCurrentStep('upload');
  };

  const handleBackToFiles = () => {
    setCurrentStep('files');
    setSelectedExistingFile(null);
    setUploadedFileName(null);
    setUploadError(null);
  };

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
          // Create operation in global state
          const operation = {
            id: operationId,
            type: 'process' as const,
            status: 'pending' as const,
            progress: 0,
            total: data.venueCount || 0,
            current: 0,
            duration: 0,
            startTime: new Date().toISOString(),
            venueCount: data.venueCount,
            estimatedDuration: data.estimatedDuration,
            logs: [],
            fileName: selectedExistingFile || uploadedFileName || undefined,
          };
          
          setCurrentOperation(operation);
          setCurrentStep('processing');
          
          addToast({
            title: 'Processing Started',
            description: `Report processing has begun. Processing ${data.venueCount || 0} venues.`,
            type: 'info',
            duration: 3000,
          });
        } else {
          // If no operation ID, show success toast and close
          addToast({
            title: 'Processing Complete',
            description: 'Report processing completed successfully.',
            type: 'success',
          });
          onOpenChange(false);
        }
      } else {
        const errorMessage = data.message || 'Failed to start report processing';
        setError(errorMessage);
        addToast({
          title: 'Processing Failed',
          description: errorMessage,
          type: 'error',
        });
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      addToast({
        title: 'Network Error',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    clearError();
    clearUploadError();
    setUploadedFileName(null);
    setSelectedExistingFile(null);
    // Don't reset currentStep if operation is running - allow resume
    if (!isOperationRunning) {
      setCurrentStep('files');
    }
  };

  const handleProgressComplete = React.useCallback(() => {
    // Show success toast only once
    if (currentOperation && currentOperation.status === 'completed') {
      const processedCount = currentOperation.data?.processedLocations?.length || currentOperation.current;
      addToast({
        title: 'Processing Complete',
        description: `Successfully processed ${processedCount} ${currentOperation.data?.operation === 'bookingsProcess' ? 'files' : 'venues'}.`,
        type: 'success',
        duration: 5000,
      });
    }
  }, [currentOperation?.id, currentOperation?.status, addToast]);

  const handleProgressError = React.useCallback((errorMessage: string) => {
    // Show error toast
    addToast({
      title: 'Processing Failed',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
    setError(errorMessage);
  }, [addToast]);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] space-y-6">
        <SheetHeader>
          <SheetTitle>Process Reports</SheetTitle>
          <SheetDescription>
            {currentStep === 'processing' 
              ? "Your reports are being processed. Please wait while we handle your request."
              : currentStep === 'files'
                ? "Choose to process existing files or upload new ones."
                : currentStep === 'upload'
                  ? "Upload a new booking file to process."
                  : "Confirm your selection and start processing."
            }
          </SheetDescription>
        </SheetHeader>
        
        {currentStep === 'processing' && currentOperation ? (
          <div className="space-y-4">
            <ProgressTracker 
              operationId={currentOperation.id} 
              venueCount={currentOperation.venueCount}
              estimatedDuration={currentOperation.estimatedDuration}
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
            {/* Step 1: Files Summary */}
            {currentStep === 'files' && (
              <>
                <BucketFilesSummary
                  onFileSelect={handleExistingFileSelect}
                  onRefresh={() => {}}
                />
                
                <Card className="p-6 space-y-4">
                  <div className="text-center space-y-3">
                    <Badge variant="outline" className="w-fit">
                      📤 Or Upload New File
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Don't see the file you want to process? Upload a new one.
                    </p>
                    <Button
                      onClick={handleUploadNewFile}
                      variant="outline"
                      className="w-full"
                    >
                      Upload New File
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {/* Step 2: File Upload */}
            {currentStep === 'upload' && (
              <>
                <Card className="p-6 space-y-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-fit">
                      📁 Upload Booking File
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Upload your Excel or CSV booking file to process reports. The file will be validated and stored securely.
                    </p>
                  </div>
                  <FileUploader
                    onUploadSuccess={(fileName) => {
                      handleUploadSuccess(fileName);
                      setCurrentStep('confirm');
                    }}
                    onUploadError={handleUploadError}
                    maxFileSize={50}
                    allowedTypes={['.xlsx', '.xls', '.csv']}
                  />
                  {uploadError && (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      {uploadError}
                    </Badge>
                  )}
                </Card>

                <Button
                  onClick={handleBackToFiles}
                  variant="outline"
                  className="w-full"
                >
                  ← Back to Files
                </Button>
              </>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 'confirm' && (
              <>
                <Card className="p-6 space-y-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-fit">
                      ✅ Ready to Process
                    </Badge>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">
                        File Selected: {selectedExistingFile || uploadedFileName}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <div className="space-y-3">
                    <Badge variant="outline" className="w-fit">
                      ⚠️ Important Notice
                    </Badge>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>This operation will:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Process the selected booking file: {selectedExistingFile || uploadedFileName}</li>
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

                <div className="flex space-x-2">
                  <Button
                    onClick={handleBackToFiles}
                    variant="outline"
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button
                    onClick={handleProcessReports}
                    disabled={isLoading}
                    className="flex-1"
                    variant="default"
                  >
                    {isLoading ? 'Starting Process...' : 'Start Processing'}
                  </Button>
                </div>
              </>
            )}

            {/* Footer for files and upload steps */}
            {(currentStep === 'files' || currentStep === 'upload') && (
              <SheetFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="h-10"
                >
                  Cancel
                </Button>
              </SheetFooter>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
