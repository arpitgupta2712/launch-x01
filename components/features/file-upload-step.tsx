"use client";

import React from 'react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FileUploader } from './file-uploader';

interface FileUploadStepProps {
  onUploadSuccess: (fileName: string) => void;
  onUploadError: (error: string) => void;
  onBack: () => void;
  uploadError?: string | null;
  maxFileSize?: number;
  allowedTypes?: string[];
  title?: string;
  description?: string;
  className?: string;
}

export function FileUploadStep({
  onUploadSuccess,
  onUploadError,
  onBack,
  uploadError,
  maxFileSize = 50,
  allowedTypes = ['.xlsx', '.xls', '.csv'],
  title = "Upload Booking Files to DB",
  description = "Upload your .xls booking file or files to process booking reports to db. The file will be validated and stored securely.",
  className
}: FileUploadStepProps) {
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
        <FileUploader
          onUploadSuccess={onUploadSuccess}
          onUploadError={onUploadError}
          maxFileSize={maxFileSize}
          allowedTypes={allowedTypes}
        />
        {uploadError && (
          <Badge variant="destructive" className="w-full justify-center py-2">
            {uploadError}
          </Badge>
        )}
      </Card>

      <Button
        onClick={onBack}
        variant="outline"
        className="w-full"
      >
        ← Back to Files
      </Button>
    </>
  );
}
