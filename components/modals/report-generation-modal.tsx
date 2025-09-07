"use client";

import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

import { API_CONFIG } from '@/lib/api/config';
import { useAuth } from '@/lib/contexts/auth-context';
import { useOperation } from '@/lib/contexts/operation-context';

import { BucketFilesSummary } from '../features/bucket-summary';
import { FileUploader } from '../features/file-uploader';
import { ReportProcessor } from '../features/report-processor';
import { ProgressTracker } from '../feedback/progress-tracker';
import { useToast } from '../feedback/toast';
import { Input } from '../forms/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Divider } from '../ui/divider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { StepNavigation } from '../ui/step-navigation';

interface ReportGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionType = 'emailReports' | 'bucketFiles' | 'fileUpload' | null;

export function ReportGenerationModal({ open, onOpenChange }: ReportGenerationModalProps) {
  const { signIn, isLoading: authLoading, error: authError, clearError: clearAuthError, setError: setAuthError, operationId, clearOperationId, venueCount, estimatedDuration } = useAuth();
  const { currentOperation, setCurrentOperation, isOperationRunning } = useOperation();
  const { addToast } = useToast();

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

  // Helper function to get previous month's first and last day (IST timezone)
  const getPreviousMonthDates = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get previous month
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // First day of previous month
    const firstDay = new Date(previousYear, previousMonth, 1);
    
    // Last day of previous month (first day of current month minus 1 day)
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // Format dates in local timezone (IST) as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      startDate: formatDate(firstDay),
      endDate: formatDate(lastDay)
    };
  };

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
    setSelectedAction(null);
    setSelectedExistingFile(null);
    setUploadedFileName(null);
    setUploadError(null);
    setProcessingError(null);
    clearAuthError();
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
    } catch (error) {
      setAuthError('Authentication failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // File management handlers
  const handleExistingFileSelect = (fileName: string) => {
    setSelectedExistingFile(fileName);
  };

  const handleUploadNewFile = () => {
    setSelectedAction('fileUpload');
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed';
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
    addToast({
      title: 'Processing Complete',
      description: `Successfully processed ${processedCount} ${currentOperation?.data?.operation === 'bookingsProcess' ? 'files' : 'venues'}.`,
      type: 'success',
      duration: 5000,
    });
    
    // Return to selection after completion
    setTimeout(() => {
      setSelectedAction(null);
      setSelectedExistingFile(null);
      setUploadedFileName(null);
      setUploadError(null);
      setProcessingError(null);
      setCurrentOperation(null);
    }, 10000);
  }, [currentOperation, addToast]);

  const handleProgressError = React.useCallback((errorMessage: string) => {
    setProcessingError(errorMessage);
    addToast({
      title: 'Processing Error',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
  }, [addToast]);

  // Close handler
  const handleClose = () => {
    if (isOperationRunning) {
      addToast({
        title: 'Operation in Progress',
        description: 'Cannot close modal while operation is running.',
        type: 'warning',
        duration: 5000,
      });
      return;
    }
    
    setSelectedAction(null);
    setSelectedExistingFile(null);
    setUploadedFileName(null);
    setUploadError(null);
    setProcessingError(null);
    clearAuthError();
    clearOperationId();
    onOpenChange(false);
  };

  // Determine current step for navigation
  const getCurrentStep = () => {
    if (!selectedAction) return 'selection';
    if (currentOperation && isOperationRunning) return 'processing';
    return selectedAction;
  };

  // Step definitions for navigation - simplified and more intuitive
  const getStepStatus = (stepId: string) => {
    const current = getCurrentStep();
    
    if (stepId === 'selection') {
      return current === 'selection' ? 'current' : 'completed';
    }
    
    if (stepId === 'processing') {
      return current === 'processing' ? 'current' : (currentOperation ? 'completed' : 'pending');
    }
    
    // For action steps (emailReports, bucketFiles, fileUpload)
    if (selectedAction === stepId) {
      return currentOperation ? 'completed' : 'current';
    }
    
    return 'pending';
  };

  const steps = [
    { 
      id: 'selection', 
      title: 'Choose', 
      description: 'Select Option', 
      status: getStepStatus('selection') as 'current' | 'completed' | 'pending' | 'error' 
    },
    { 
      id: 'emailReports', 
      title: 'Email', 
      description: 'Generate Reports', 
      status: getStepStatus('emailReports') as 'current' | 'completed' | 'pending' | 'error' 
    },
    { 
      id: 'bucketFiles', 
      title: 'Bucket', 
      description: 'Process Files', 
      status: getStepStatus('bucketFiles') as 'current' | 'completed' | 'pending' | 'error' 
    },
    { 
      id: 'fileUpload', 
      title: 'Upload', 
      description: 'Upload & Process', 
      status: getStepStatus('fileUpload') as 'current' | 'completed' | 'pending' | 'error' 
    },
    { 
      id: 'processing', 
      title: 'Process', 
      description: 'Generate', 
      status: getStepStatus('processing') as 'current' | 'completed' | 'pending' | 'error' 
    },
  ];

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Generate Reports
          </SheetTitle>
          <SheetDescription>
            {currentOperation && isOperationRunning 
              ? "Your reports are being processed. Please wait while we handle your request."
              : "Choose how you'd like to generate your reports."
            }
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          {/* Step Navigation */}
          <div className="mb-6">
            <StepNavigation steps={steps} currentStep={getCurrentStep()} />
          </div>

          <Divider className="my-6" />

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
          ) : (
            <div className="space-y-6">
              {/* Selection Step */}
              {!selectedAction && (
                <div className="space-y-6">
                  <ReportProcessor
                    onSelectEmailReports={handleSelectEmailReports}
                    onSelectBucketFiles={handleSelectBucketFiles}
                    onSelectFileUpload={handleSelectFileUpload}
                  />

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
        </div>
      </SheetContent>
    </Sheet>
  );
}