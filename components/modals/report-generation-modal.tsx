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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
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
import { UploadPrompt } from '../ui/upload-prompt';

interface ReportGenerationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StepLogs {
  emailReports: Array<{ message: string; timestamp: string; level: string }>;
  bucketFiles: Array<{ message: string; timestamp: string; level: string }>;
  fileUpload: Array<{ message: string; timestamp: string; level: string }>;
  processing: Array<{ message: string; timestamp: string; level: string }>;
}

type Step = 'selection' | 'emailReports' | 'bucketFiles' | 'fileUpload' | 'processing';

export function ReportGenerationModal({ open, onOpenChange }: ReportGenerationModalProps) {
  const { signIn, isLoading: authLoading, error: authError, clearError: clearAuthError, setError: setAuthError, operationId, clearOperationId, venueCount, estimatedDuration } = useAuth();
  const { currentOperation, setCurrentOperation, isOperationRunning } = useOperation();
  const { addToast } = useToast();

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

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set());
  const [stepLogs, setStepLogs] = useState<StepLogs>({
    emailReports: [],
    bucketFiles: [],
    fileUpload: [],
    processing: [],
  });

  // File management state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [processingStep, setProcessingStep] = useState<Step | null>(null);

  // Check if there's a running operation when modal opens
  useEffect(() => {
    if (open && currentOperation && isOperationRunning) {
      setCurrentStep('processing');
      setCompletedSteps(new Set(['emailReports', 'bucketFiles', 'fileUpload']));
    }
  }, [open, currentOperation, isOperationRunning]);

  // Step definitions
  const steps = [
    { id: 'selection', title: 'Choose', description: 'Select Option', status: (currentStep === 'selection' ? 'current' : 'completed') as 'current' | 'completed' | 'pending' | 'error' },
    { id: 'emailReports', title: 'Email', description: 'Generate Reports', status: (currentStep === 'emailReports' ? 'current' : completedSteps.has('emailReports') ? 'completed' : 'pending') as 'current' | 'completed' | 'pending' | 'error' },
    { id: 'bucketFiles', title: 'Bucket', description: 'Process Files', status: (currentStep === 'bucketFiles' ? 'current' : completedSteps.has('bucketFiles') ? 'completed' : 'pending') as 'current' | 'completed' | 'pending' | 'error' },
    { id: 'fileUpload', title: 'Upload', description: 'Upload & Process', status: (currentStep === 'fileUpload' ? 'current' : completedSteps.has('fileUpload') ? 'completed' : 'pending') as 'current' | 'completed' | 'pending' | 'error' },
    { id: 'processing', title: 'Process', description: 'Generate', status: (currentStep === 'processing' ? 'current' : completedSteps.has('processing') ? 'completed' : 'pending') as 'current' | 'completed' | 'pending' | 'error' },
  ];

  // Helper functions
  const addStepLog = (step: keyof StepLogs, message: string, level: string = 'info') => {
    setStepLogs(prev => ({
      ...prev,
      [step]: [...prev[step], { message, timestamp: new Date().toISOString(), level }]
    }));
  };

  const markStepCompleted = (step: Step) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  // Step selection handlers
  const handleSelectEmailReports = () => {
    setCurrentStep('emailReports');
    // Only add log if not already started
    if (stepLogs.emailReports.length === 0) {
      addStepLog('emailReports', 'User selected email reports generation', 'info');
    }
  };

  const handleSelectBucketFiles = () => {
    setCurrentStep('bucketFiles');
    // Only add log if not already started
    if (stepLogs.bucketFiles.length === 0) {
      addStepLog('bucketFiles', 'User selected bucket files processing', 'info');
    }
  };

  const handleSelectFileUpload = () => {
    setCurrentStep('fileUpload');
    // Only add log if not already started
    if (stepLogs.fileUpload.length === 0) {
      addStepLog('fileUpload', 'User selected file upload', 'info');
    }
  };

  // Authentication handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();

    if (!formData.email || !formData.password || !formData.startDate || !formData.endDate) {
      return;
    }

    addStepLog('emailReports', 'Starting authentication...', 'info');
    
    const result = await signIn({
      email: formData.email,
      password: formData.password,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    if (result.success) {
      addStepLog('emailReports', 'Authentication successful', 'info');
      markStepCompleted('emailReports');
      
      if (result.operationId) {
        addStepLog('emailReports', `Operation started with ID: ${result.operationId}`, 'info');
        setProcessingStep('emailReports');
        setShowProgress(true);
      } else {
        // Close modal on successful sign in (no progress tracking needed)
        onOpenChange(false);
        // Reset form with default dates
        const { startDate, endDate } = getPreviousMonthDates();
        setFormData({
          email: '',
          password: '',
          startDate,
          endDate,
        });
      }
    } else {
      addStepLog('emailReports', 'Authentication failed', 'error');
    }
  };

  // File management handlers
  const handleExistingFileSelect = (fileName: string) => {
    setSelectedExistingFile(fileName);
    addStepLog('bucketFiles', `Selected existing file: ${fileName}`, 'info');
    markStepCompleted('bucketFiles');
    setCurrentStep('processing');
  };

  const handleUploadNewFile = () => {
    addStepLog('bucketFiles', 'User chose to upload new file', 'info');
    setCurrentStep('fileUpload');
  };

  const handleUploadSuccess = (fileName: string | string[]) => {
    const fileNames = Array.isArray(fileName) ? fileName : [fileName];
    setUploadedFileName(fileNames.join(', '));
    setUploadError(null);
    addStepLog('fileUpload', `File(s) uploaded successfully: ${fileNames.join(', ')}`, 'info');
    markStepCompleted('fileUpload');
    setCurrentStep('processing');
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadedFileName(null);
    addStepLog('fileUpload', `Upload failed: ${error}`, 'error');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    // Don't clear state - allow users to navigate freely between steps
    // setSelectedExistingFile(null);
    // setUploadedFileName(null);
    // setUploadError(null);
  };

  // Processing handlers
  const handleProcessReports = async () => {
    setIsProcessing(true);
    setProcessingError(null);
    addStepLog('processing', 'Starting report processing...', 'info');

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.processReports}`, {
        method: 'POST',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        const operationId = data.operationId || data.data?.operationId;
        if (operationId && typeof operationId === 'string') {
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
          addStepLog('processing', `Processing started for ${data.venueCount || 0} venues`, 'info');
          
          addToast({
            title: 'Processing Started',
            description: `Report processing has begun. Processing ${data.venueCount || 0} venues.`,
            type: 'info',
            duration: 3000,
          });
        } else {
          addStepLog('processing', 'Processing completed immediately', 'info');
          addToast({
            title: 'Processing Complete',
            description: 'Report processing completed successfully.',
            type: 'success',
          });
          onOpenChange(false);
        }
      } else {
        const errorMessage = data.message || 'Failed to start report processing';
        setProcessingError(errorMessage);
        addStepLog('processing', `Processing failed: ${errorMessage}`, 'error');
        addToast({
          title: 'Processing Failed',
          description: errorMessage,
          type: 'error',
        });
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setProcessingError(errorMessage);
      addStepLog('processing', `Network error: ${errorMessage}`, 'error');
      addToast({
        title: 'Network Error',
        description: errorMessage,
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    clearAuthError();
    clearOperationId();
    setUploadedFileName(null);
    setSelectedExistingFile(null);
    setUploadError(null);
    setProcessingError(null);
    setShowProgress(false);
    setProcessingStep(null);
    setStepLogs({
      emailReports: [],
      bucketFiles: [],
      fileUpload: [],
      processing: [],
    });
    if (!isOperationRunning) {
      setCurrentStep('selection');
      setCompletedSteps(new Set());
    }
  };

  const handleProgressComplete = React.useCallback(() => {
    // Don't auto-close anymore - let user manually close after reading logs
    // This gives users full control over when to close the modal
    if (currentOperation && currentOperation.status === 'completed') {
      const processedCount = currentOperation.data?.processedLocations?.length || currentOperation.current;
      addStepLog('processing', `Processing completed successfully. Processed ${processedCount} venues.`, 'info');
      markStepCompleted('processing');
      addToast({
        title: 'Processing Complete',
        description: `Successfully processed ${processedCount} ${currentOperation.data?.operation === 'bookingsProcess' ? 'files' : 'venues'}.`,
        type: 'success',
        duration: 5000,
      });
      
      // If email reports were completed, mark it as completed and encourage next step
      if (processingStep === 'emailReports') {
        markStepCompleted('emailReports');
        // After a short delay, show option to continue to next step
        setTimeout(() => {
          setShowProgress(false);
          setProcessingStep(null);
          setCurrentStep('selection');
          addToast({
            title: 'Email Reports Complete!',
            description: 'You can now process existing files or upload new ones.',
            type: 'success',
            duration: 10000,
          });
        }, 3000); // Give user 3 seconds to see the completion
      }
    }
  }, [currentOperation, addToast, processingStep]);

  const handleProgressError = React.useCallback((errorMessage: string) => {
    addStepLog('processing', `Processing error: ${errorMessage}`, 'error');
    addToast({
      title: 'Processing Failed',
      description: errorMessage,
      type: 'error',
      duration: 5000,
    });
    setProcessingError(errorMessage);
    
    // If progress tracking shows authentication failed, show error and reset
    if (errorMessage.includes('Authentication failed') || errorMessage.includes('credentials do not match')) {
      setShowProgress(false);
      // Set the error message to be displayed in the form
      setAuthError(errorMessage);
    }
  }, [addToast, setAuthError]);

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-destructive';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };


  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-[600px] space-y-6 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Generate Reports</SheetTitle>
          <SheetDescription>
            {showProgress
              ? "Your report is being generated. Please wait while we process your request."
              : currentStep === 'processing' 
                ? "Your reports are being processed. Please wait while we handle your request."
                : currentStep === 'selection'
                  ? "Choose how you want to generate reports."
                  : currentStep === 'emailReports'
                    ? "Enter your credentials and select a date range to generate email reports."
                    : currentStep === 'bucketFiles'
                      ? "Select an existing file from the bucket to process."
                      : currentStep === 'fileUpload'
                        ? "Upload a new booking file to process."
                        : "Confirm your selection and start processing."
            }
          </SheetDescription>
        </SheetHeader>

        <Divider variant="glow" size="lg" />

        {/* Step Navigation */}
        <StepNavigation steps={steps} currentStep={currentStep} />

        {/* Step Content */}
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
        ) : currentStep === 'processing' && currentOperation ? (
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
            {/* Step 1: Selection */}
            {currentStep === 'selection' && (
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

            {/* Step 2: Email Reports Generation */}
            {currentStep === 'emailReports' && (
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
                      disabled={authLoading}
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
                      disabled={authLoading}
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
                        disabled={authLoading}
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
                        disabled={authLoading}
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
                    disabled={authLoading}
                    className="flex-1"
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={authLoading || !formData.email || !formData.password || !formData.startDate || !formData.endDate}
                    className="flex-1"
                  >
                    {authLoading ? 'Signing In...' : 'Request Report'}
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Bucket Files Processing */}
            {currentStep === 'bucketFiles' && (
              <>
                <BucketFilesSummary
                  onFileSelect={handleExistingFileSelect}
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
                </div>
              </>
            )}

            {/* Step 4: File Upload */}
            {currentStep === 'fileUpload' && (
              <FileUploader
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                onBack={handleBackToSelection}
                uploadError={uploadError}
                maxFileSize={50}
                allowedTypes={['.xlsx', '.xls', '.csv']}
                title="Upload Booking Files to DB"
                description="Upload your .xls booking file or files to process booking reports to db. The file will be validated and stored securely."
                showCard={true}
                showBackButton={true}
              />
            )}

          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
