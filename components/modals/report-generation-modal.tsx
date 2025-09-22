"use client";

import { CheckCircle, FileChartColumn, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';
import { useAuth } from '@/lib/contexts/auth-context';
import { useOperation } from '@/lib/contexts/operation-context';
import { useProgressPersistence } from '@/lib/hooks/use-progress-persistence';

interface ProgressSummary {
  id: string;
  operation: string;
  status: 'completed' | 'failed' | 'timeout';
  total: number;
  processed: number;
  duration: number;
  startTime: string;
  endTime: string;
  venueNames?: Record<string, string>;
  processedLocations?: Array<{
    id: string;
    name: string;
    status: string;
    timestamp: string;
  }>;
  processedVenuesFromLogs?: string[];
  error?: string;
}

import { BucketFilesSummary } from '../features/bucket-summary';
import { FileUploader } from '../features/file-uploader';
import { ReportProcessor } from '../features/report-processor';
import { ProgressTracker } from '../feedback/progress-tracker';
import { useToast } from '../feedback/toast';
import { Input } from '../forms/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

interface ReportGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionType = 'emailReports' | 'bucketFiles' | 'fileUpload' | null;

export function ReportGenerationModal({ open, onOpenChange }: ReportGenerationModalProps) {
  const { signIn, isLoading: authLoading, error: authError, clearError: clearAuthError, setError: setAuthError } = useAuth();
  const { currentOperation, setCurrentOperation, isOperationRunning } = useOperation();
  const { addToast } = useToast();
  const { recentSummaries, clearProgressSummary } = useProgressPersistence();

  // Only clear errors when modal opens, preserve state
  useEffect(() => {
    if (open) {
      setUploadError(null);
      setProcessingError(null);
      clearAuthError();
    }
  }, [open, clearAuthError]);

  // Simplified state management
  const [selectedAction, setSelectedAction] = useState<ActionType>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // File management state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<string | null>(null);
  
  // Form data for authentication
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const firstDay = new Date(previousYear, previousMonth, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      email: '',
      password: '',
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay),
    };
  });

  // Check if there's a running operation when modal opens
  useEffect(() => {
    if (open && currentOperation && isOperationRunning) {
      setSelectedAction('emailReports'); // Assume email reports if operation is running
    }
  }, [open, currentOperation, isOperationRunning]);


  // Input change handler
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (authError) clearAuthError();
  };

  // Action selection handlers
  const handleSelectEmailReports = () => {
    setSelectedAction('emailReports');
    clearAuthError();
  };

  const handleSelectBucketFiles = () => {
    setSelectedAction('bucketFiles');
    setSelectedExistingFile('all'); // Automatically set to process all files
  };

  const handleSelectFileUpload = () => {
    setSelectedAction('fileUpload');
  };

  const handleBackToSelection = () => {
    console.log('handleBackToSelection called'); // Debug log
    setSelectedAction(null);
    setSelectedExistingFile(null);
    setUploadedFileName(null);
    setUploadError(null);
    setProcessingError(null);
    clearAuthError();
    setCurrentOperation(null); // Clear the current operation to go back to selection
  };

  const handleRefresh = () => {
    console.log('handleRefresh called'); // Debug log
    // Complete reset to initial state
    setSelectedAction(null);
    setSelectedExistingFile(null);
    setUploadedFileName(null);
    setUploadError(null);
    setProcessingError(null);
    clearAuthError();
    setCurrentOperation(null);
    clearProgressSummary();
    // Close and reopen modal
    onOpenChange(false);
    setTimeout(() => onOpenChange(true), 100);
  };

  // Authentication handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingError(null);
    clearAuthError();

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      
      if (result.success && result.operationId) {
        // Start progress tracking for email reports
        const operation = {
          id: result.operationId,
          type: 'email' as const,
          status: 'running' as const,
          progress: 0,
          current: 0,
          total: result.venueCount || 0,
          duration: 0,
          startTime: new Date().toISOString(),
          venueCount: result.venueCount || 0,
          estimatedDuration: result.estimatedDuration,
          logs: [],
          data: {
            operation: 'emailReports',
            startDate: formData.startDate,
            endDate: formData.endDate,
          },
        };
        
        setCurrentOperation(operation);
        addToast({
          title: 'Email Reports Started',
          description: `Generating reports for ${result.venueCount || 0} venues.`,
          type: 'info',
          duration: 5000,
        });
      } else {
        setAuthError('Authentication failed');
      }
    } catch {
      setAuthError('Authentication failed');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleUploadSuccess = (fileName: string | string[]) => {
    const fileNames = Array.isArray(fileName) ? fileName : [fileName];
    setUploadedFileName(fileNames.join(', '));
    setUploadError(null);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadedFileName(null);
  };

  // Process reports handler
  const handleProcessReports = async () => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      let response;
      
      if (selectedAction === 'bucketFiles' && selectedExistingFile) {
        // Process all files in bucket
        response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processReports}`, {
          method: 'POST',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
          body: JSON.stringify({
            source: 'bucket',
            processAll: true,
          }),
        });
      } else if (selectedAction === 'fileUpload' && uploadedFileName) {
        // Process uploaded file(s)
        response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processReports}`, {
          method: 'POST',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
          body: JSON.stringify({
            fileName: uploadedFileName,
            source: 'upload',
            processAll: true,
          }),
        });
      } else {
        throw new Error('No file selected for processing');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.operationId) {
        const operation = {
          id: data.operationId,
          type: 'process' as const,
          status: 'running' as const,
          progress: 0,
          current: 0,
          total: data.venueCount || 0,
          duration: 0,
          startTime: new Date().toISOString(),
          venueCount: data.venueCount || 0,
          estimatedDuration: data.estimatedDuration,
          logs: [],
          fileName: selectedExistingFile || uploadedFileName || undefined,
          data: {
            operation: 'bookingsProcess',
          },
        };
        
        setCurrentOperation(operation);
        addToast({
          title: 'Processing Started',
          description: `Processing ${data.venueCount || 0} venues.`,
          type: 'info',
          duration: 5000,
        });
      } else {
        throw new Error(data.message || 'Processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Processing failed';
      setProcessingError(errorMessage);
      addToast({
        title: 'Processing Failed',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Progress completion handler
  const handleProgressComplete = React.useCallback(() => {
    const processedCount = currentOperation?.current || 0;
    const totalCount = currentOperation?.total || 0;
    const duration = currentOperation?.duration || 0;
    const operation = currentOperation?.data?.operation;
    
    // Update the operation status to completed
    if (currentOperation) {
      setCurrentOperation({
        ...currentOperation,
        status: 'completed',
        endTime: new Date().toISOString()
      });
    }
    
    addToast({
      title: 'Processing Complete',
      description: `Successfully processed ${processedCount} of ${totalCount} ${operation === 'bookingsProcess' ? 'files' : 'venues'} in ${duration}s. Check the modal for detailed summary.`,
      type: 'success',
      duration: 10000, // Longer duration to give time to read
    });
    
    // Don't auto-dismiss - let user manually close or start new operation
  }, [currentOperation, addToast, setCurrentOperation]);

  const handleProgressError = React.useCallback((errorMessage: string) => {
    setProcessingError(errorMessage);
    addToast({
      title: 'Processing Error',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
  }, [addToast]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="w-full sm:max-w-[600px] max-h-[85vh] overflow-y-auto top-1/2 left-1/2 right-auto bottom-auto -translate-x-1/2 -translate-y-1/2"
        hideClose
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileChartColumn className="h-5 w-5 text-primary" />
            Hudle Reports
          </SheetTitle>
          <SheetDescription>
            {currentOperation && isOperationRunning 
              ? "Your reports are being processed. Please wait while we handle your request."
              : "Email Reports and upload booking files to generate reports."
            }
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">

          {/* Main Content */}
          {currentOperation && isOperationRunning ? (
            <div className="space-y-6">
              <ProgressTracker
                operationId={currentOperation.id}
                venueCount={currentOperation.venueCount}
                estimatedDuration={currentOperation.estimatedDuration}
                onComplete={handleProgressComplete}
                onError={handleProgressError}
              />
            </div>
          ) : currentOperation && !isOperationRunning ? (
            <div className="space-y-6">
              <ProgressTracker
                operationId={currentOperation.id}
                venueCount={currentOperation.venueCount}
                estimatedDuration={currentOperation.estimatedDuration}
                onComplete={handleProgressComplete}
                onError={handleProgressError}
              />
              
              {/* Back Button for Completed Operations */}
              <div className="flex justify-center gap-3 pt-4">
                <Button
                  onClick={handleBackToSelection}
                  variant="outline"
                  className="h-10 px-6"
                >
                  ← Start New Operation
                </Button>
                <Button
                  onClick={handleRefresh}
                  variant="secondary"
                  className="h-10 px-6 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selection Step */}
              {!selectedAction && (
                <div className="space-y-2">
                  <ReportProcessor
                    onSelectEmailReports={handleSelectEmailReports}
                    onSelectBucketFiles={handleSelectBucketFiles}
                    onSelectFileUpload={handleSelectFileUpload}
                  />

                  <SheetFooter className="pt-4"></SheetFooter>
                </div>
              )}

              {/* Email Reports Generation */}
              {selectedAction === 'emailReports' && (
                <form onSubmit={handleAuthSubmit} className="space-y-6">
                  <Card className="p-6 space-y-6">
                    {/* Email Field */}
                    <div className="space-y-3">
                      <Badge variant="outline" className="w-fit">
                        Username
                      </Badge>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter Hudle Partner email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        disabled={authLoading || isProcessing}
                        variant="outline"
                        inputSize="xl"
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-3">
                      <Badge variant="outline" className="w-fit">
                        Password
                      </Badge>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        disabled={authLoading || isProcessing}
                        variant="outline"
                        inputSize="xl"
                      />
                    </div>

                    {/* Date Range Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-fit">
                          Start Date
                        </Badge>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          required
                          disabled={authLoading || isProcessing}
                          variant="outline"
                          inputSize="xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Badge variant="outline" className="w-fit">
                          End Date
                        </Badge>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          required
                          disabled={authLoading || isProcessing}
                          variant="outline"
                          inputSize="xl"
                        />
                      </div>
                    </div>

                    {/* Error Display */}
                    {authError && (
                      <Badge variant="destructive" className="w-full justify-center py-2">
                        Authentication Failed
                      </Badge>
                    )}
                  </Card>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToSelection}
                      disabled={authLoading || isProcessing}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={authLoading || isProcessing || !formData.email || !formData.password || !formData.startDate || !formData.endDate}
                      className="flex-1"
                    >
                      {authLoading || isProcessing ? 'Generating...' : 'Generate Reports'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Bucket Files Processing */}
              {selectedAction === 'bucketFiles' && (
                <div className="space-y-6">
                  <BucketFilesSummary
                    onRefresh={() => {}}
                  />

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToSelection}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleProcessReports}
                      disabled={isProcessing || !selectedExistingFile}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Process All Files'}
                    </Button>
                  </div>
                </div>
              )}

              {/* File Upload */}
              {selectedAction === 'fileUpload' && (
                <div className="space-y-6">
                  <FileUploader
                    onUploadSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                    showCard={true}
                    showBackButton={false}
                    title="Upload Files"
                    description="Drag and drop your files here or click to browse"
                  />

                  {uploadError && (
                    <Badge variant="destructive" className="w-full justify-center py-2">
                      {uploadError}
                    </Badge>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToSelection}
                      className="flex-1"
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleProcessReports}
                      disabled={isProcessing || !uploadedFileName}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Process All Files'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Processing Error Display */}
              {processingError && (
                <Badge variant="destructive" className="w-full justify-center py-2">
                  {processingError}
                </Badge>
              )}
            </div>
          )}


          {/* Recent Operations Summary */}
          {recentSummaries.length > 0 && !currentOperation && (
            <div className="mt-6">
              <Card className="p-4 border-accent/20 bg-accent/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <h3 className="font-medium text-sm">Recent Operations</h3>
                    <Badge variant="outline" size="sm" className="text-xs">
                      {recentSummaries.length} operations
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearProgressSummary}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentSummaries
                    .filter((summary, index, self) => 
                      index === self.findIndex(s => s.id === summary.id)
                    )
                    .slice(0, 3)
                    .map((summary, index) => (
                    <div key={`${summary.id}-${index}`} className="p-3 bg-background/50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {summary.operation === 'bookingsProcess' ? 'File Processing' : 
                             summary.operation === 'emailReports' ? 'Email Reports' : 
                             summary.operation}
                          </Badge>
                          <Badge 
                            variant={summary.status === 'completed' ? 'accent' : 'destructive'} 
                            className="text-xs"
                          >
                            {summary.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date((summary as ProgressSummary & { storedAt?: string }).storedAt || summary.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Processed:</span>
                          <span className="font-medium">
                            {summary.processed} of {summary.total} {summary.operation === 'bookingsProcess' ? 'files' : 'venues'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{summary.duration}s</span>
                        </div>
                      </div>
                      {summary.processedVenuesFromLogs && summary.processedVenuesFromLogs.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Recent Venues:</div>
                          <div className="flex flex-wrap gap-1">
                            {summary.processedVenuesFromLogs.slice(0, 3).map((venue, venueIndex) => (
                              <Badge key={`${summary.id}-venue-${venueIndex}`} variant="secondary" size="sm" className="text-xs">
                                {venue}
                              </Badge>
                            ))}
                            {summary.processedVenuesFromLogs.length > 3 && (
                              <Badge variant="outline" size="sm" className="text-xs">
                                +{summary.processedVenuesFromLogs.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      {summary.error && (
                        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                          {summary.error}
                        </div>
                      )}
                    </div>
                  ))}
                  {recentSummaries.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      ... and {recentSummaries.length - 3} more operations
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}