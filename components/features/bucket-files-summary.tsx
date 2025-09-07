"use client";

import { Calendar, FileText, Hash, RefreshCw } from 'lucide-react';
import React, { useEffect,useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface BucketFile {
  fileName: string;
  uploadDate: string;
  size: number;
  lastModified: string;
}

interface BucketFilesSummaryProps {
  onFileSelect?: (fileName: string) => void;
  onRefresh?: () => void;
  className?: string;
}

interface ValidFilesResponse {
  success: boolean;
  files?: BucketFile[];
  error?: string;
  message?: string;
}

export function BucketFilesSummary({ onFileSelect, onRefresh, className = "" }: BucketFilesSummaryProps) {
  const [files, setFiles] = useState<BucketFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.listValidBookingFiles}`, {
        method: 'GET',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
      });

      const data: ValidFilesResponse = await response.json();

      if (data.success && data.files) {
        // Debug: Log the actual response to see the structure
        console.log('Bucket files response:', data.files);
        setFiles(data.files);
      } else {
        setError(data.error || 'Failed to fetch files');
      }
      } catch {
      setError('Network error while fetching files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleRefresh = () => {
    fetchFiles();
    onRefresh?.();
  };

  const getTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return { value: 0, unit: 'unknown' };
    
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return { value: 0, unit: 'unknown' };
    }
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return { value: diffMinutes, unit: 'minutes' };
    } else if (diffHours < 24) {
      return { value: diffHours, unit: 'hours' };
    } else {
      return { value: diffDays, unit: 'days' };
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading files...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center space-y-3">
          <Badge variant="destructive" className="w-full justify-center py-2">
            {error}
          </Badge>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium">Files in Bucket</h3>
        </div>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-6 space-y-2">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No files found in bucket</p>
          <p className="text-xs text-muted-foreground">Upload a file to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-bold text-primary">{files.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <span className="text-xl font-bold text-primary">
                  {files.length > 0 ? (() => {
                    const timeAgo = getTimeAgo(files[0].uploadDate || files[0].lastModified);
                    return timeAgo.value;
                  })() : 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {files.length > 0 ? (() => {
                  const timeAgo = getTimeAgo(files[0].uploadDate || files[0].lastModified);
                  if (timeAgo.unit === 'minutes') return 'Minutes';
                  if (timeAgo.unit === 'hours') return 'Hours ago';
                  if (timeAgo.unit === 'days') return 'Days ago';
                  return '';
                })() : 'Since Latest'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="space-y-3">
              <Button
                onClick={() => onFileSelect?.(files[0].fileName)}
                className="w-full"
                variant="default"
              >
                Process Bookings to DB
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
