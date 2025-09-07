"use client";

import { AlertCircle,CheckCircle, File, Upload, X } from 'lucide-react';
import React, { useRef,useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface FileUploaderProps {
  onUploadSuccess?: (fileName: string | string[]) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  onBack?: () => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  title?: string;
  description?: string;
  uploadError?: string | null;
  showCard?: boolean;
  showBackButton?: boolean;
  className?: string;
  multiple?: boolean; // Allow multiple file selection
}

interface UploadResponse {
  success: boolean;
  message?: string;
  fileName?: string;
  error?: string;
  details?: string;
  code?: string;
}

export function FileUploader({ 
  onUploadSuccess, 
  onUploadError, 
  onUploadProgress,
  onBack,
  maxFileSize = 50,
  allowedTypes = ['.xlsx', '.xls', '.csv'],
  title = "Upload Booking Files to DB",
  description = "Upload your .xls booking file or files to process booking reports to db. The file will be validated and stored securely.",
  uploadError,
  showCard = false,
  showBackButton = false,
  className = "",
  multiple = true
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedTypes.some(type => fileName.endsWith(type));
    
    if (!hasValidExtension) {
      return `Only ${allowedTypes.join(', ')} files are allowed`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate all files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        validationErrors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join('; '));
      setUploadStatus('error');
      onUploadError?.(validationErrors.join('; '));
      return;
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setErrorMessage('');
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const uploadPromises = selectedFiles.map((file, index) => {
        return new Promise<{ success: boolean; fileName: string; error?: string }>((resolve) => {
          const formData = new FormData();
          formData.append('file', file);

          const xhr = new XMLHttpRequest();

          // Track upload progress for individual files
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const fileProgress = Math.round((event.loaded / event.total) * 100);
              const totalProgress = Math.round(((index * 100) + fileProgress) / selectedFiles.length);
              setUploadProgress(totalProgress);
              onUploadProgress?.(totalProgress);
            }
          });

          // Handle response
          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const response: UploadResponse = JSON.parse(xhr.responseText);
              if (response.success) {
                resolve({ success: true, fileName: response.fileName || file.name });
              } else {
                resolve({ success: false, fileName: file.name, error: response.error || 'Upload failed' });
              }
            } else {
              const response: UploadResponse = JSON.parse(xhr.responseText);
              resolve({ success: false, fileName: file.name, error: response.error || `Upload failed with status ${xhr.status}` });
            }
          });

          // Handle errors
          xhr.addEventListener('error', () => {
            resolve({ success: false, fileName: file.name, error: 'Network error during upload' });
          });

          // Start upload
          xhr.open('POST', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.uploadBookingFile}`);
          xhr.send(formData);
        });
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      
      setIsUploading(false);
      
      const successfulUploads = results.filter(r => r.success);
      const failedUploads = results.filter(r => !r.success);

      if (failedUploads.length === 0) {
        // All uploads successful
        setUploadStatus('success');
        const fileNames = successfulUploads.map(r => r.fileName);
        onUploadSuccess?.(fileNames.length === 1 ? fileNames[0] : fileNames);
      } else if (successfulUploads.length === 0) {
        // All uploads failed
        setUploadStatus('error');
        const errorMsg = failedUploads.map(r => `${r.fileName}: ${r.error}`).join('; ');
        setErrorMessage(errorMsg);
        onUploadError?.(errorMsg);
      } else {
        // Some uploads successful, some failed
        setUploadStatus('error');
        const errorMsg = `Partial success: ${successfulUploads.length}/${selectedFiles.length} files uploaded. Failed: ${failedUploads.map(r => r.fileName).join(', ')}`;
        setErrorMessage(errorMsg);
        onUploadError?.(errorMsg);
        // Still call success callback for the successful files
        const fileNames = successfulUploads.map(r => r.fileName);
        onUploadSuccess?.(fileNames.length === 1 ? fileNames[0] : fileNames);
      }

    } catch (error) {
      setIsUploading(false);
      setUploadStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(errorMsg);
      onUploadError?.(errorMsg);
    }
  };

  const handleRemoveFile = (index?: number) => {
    if (index !== undefined) {
      // Remove specific file
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      // Remove all files
      setSelectedFiles([]);
    }
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;

    // Validate all files
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        validationErrors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validationErrors.length > 0) {
      setErrorMessage(validationErrors.join('; '));
      setUploadStatus('error');
      onUploadError?.(validationErrors.join('; '));
      return;
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setErrorMessage('');
      setUploadStatus('idle');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'uploading':
        return <Upload className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return <Upload className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-muted-foreground/20';
    }
  };

  const uploaderContent = (
    <div className={`space-y-4 ${className}`}>
      {/* File Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${getStatusColor()}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          multiple={multiple}
          className="hidden"
        />
        
        {selectedFiles.length === 0 ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Drop your booking {multiple ? 'files' : 'file'} here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary hover:underline"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports {allowedTypes.join(', ')} files up to {maxFileSize}MB
                {multiple && ' (multiple files supported)'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <File className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile()}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* File List */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded text-xs">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <File className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadStatus === 'uploading' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadStatus === 'error' && errorMessage && (
        <Badge variant="destructive" className="w-full justify-center py-2">
          {errorMessage}
        </Badge>
      )}

      {/* Success Message */}
      {uploadStatus === 'success' && (
        <Badge variant="default" className="w-full justify-center py-2">
          {selectedFiles.length > 1 ? `${selectedFiles.length} files uploaded successfully!` : 'File uploaded successfully!'}
        </Badge>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
        </Button>
      )}
    </div>
  );

  if (showCard) {
    return (
      <>
        <Card className={`p-6 space-y-4 ${className || ''}`}>
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit">
              {title}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          {uploaderContent}
          {uploadError && (
            <Badge variant="destructive" className="w-full justify-center py-2">
              {uploadError}
            </Badge>
          )}
        </Card>

        {showBackButton && onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            ← Back to Files
          </Button>
        )}
      </>
    );
  }

  return uploaderContent;
}
