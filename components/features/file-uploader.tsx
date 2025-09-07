"use client";

import { AlertCircle,CheckCircle, File, Upload, X } from 'lucide-react';
import React, { useRef,useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface FileUploaderProps {
  onUploadSuccess?: (fileName: string) => void;
  onUploadError?: (error: string) => void;
  onUploadProgress?: (progress: number) => void;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  className?: string;
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
  maxFileSize = 50,
  allowedTypes = ['.xlsx', '.xls', '.csv'],
  className = ""
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setErrorMessage(validationError);
      setUploadStatus('error');
      onUploadError?.(validationError);
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
    setUploadStatus('idle');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
          onUploadProgress?.(progress);
        }
      });

      // Handle response
      xhr.addEventListener('load', () => {
        setIsUploading(false);
        
        if (xhr.status === 200) {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          if (response.success) {
            setUploadStatus('success');
            onUploadSuccess?.(response.fileName || selectedFile.name);
          } else {
            setUploadStatus('error');
            setErrorMessage(response.error || 'Upload failed');
            onUploadError?.(response.error || 'Upload failed');
          }
        } else {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          setUploadStatus('error');
          setErrorMessage(response.error || `Upload failed with status ${xhr.status}`);
          onUploadError?.(response.error || `Upload failed with status ${xhr.status}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setIsUploading(false);
        setUploadStatus('error');
        setErrorMessage('Network error during upload');
        onUploadError?.('Network error during upload');
      });

      // Start upload
      xhr.open('POST', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.uploadBookingFile}`);
      xhr.send(formData);

    } catch (error) {
      setIsUploading(false);
      setUploadStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setErrorMessage(errorMsg);
      onUploadError?.(errorMsg);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setUploadStatus('error');
        onUploadError?.(validationError);
        return;
      }
      setSelectedFile(file);
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

  return (
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
          className="hidden"
        />
        
        {!selectedFile ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              {getStatusIcon()}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Drop your booking file here, or{' '}
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
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <File className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedFile.name}</span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
          File uploaded successfully!
        </Badge>
      )}

      {/* Upload Button */}
      {selectedFile && uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : 'Upload File'}
        </Button>
      )}
    </div>
  );
}
