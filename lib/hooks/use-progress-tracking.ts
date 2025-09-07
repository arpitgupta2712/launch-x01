"use client";

import { useCallback, useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

interface ProgressLog {
  message: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
}

interface ProgressData {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress: number; // 0-100 percentage
  total: number;
  current: number;
  duration: number; // seconds elapsed
  startTime: string;
  endTime?: string;
  logs: ProgressLog[];
  data?: {
    operation: string;
    startDate: string;
    endDate: string;
    processedLocations?: Array<{
      id: string;
      name: string;
      status: string;
      timestamp: string;
    }>;
  };
  error?: string;
}

interface ProgressResponse {
  success: boolean;
  progress: ProgressData;
}

export const useProgressTracking = (operationId: string | null, venueCount?: number | null) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTracking = useCallback(() => {
    if (!operationId) return;
    
    setIsLoading(true);
    setError(null);

    const pollProgress = async () => {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/api/progress/${operationId}`, {
          method: 'GET',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
        });
        
        const data: ProgressResponse = await response.json();

        if (data.success) {
          // Enhance progress data with venue count if available
          const enhancedProgress = {
            ...data.progress,
            // Use venue count from API response if available, otherwise use the provided venueCount
            total: data.progress.total || venueCount || data.progress.total,
            // Calculate progress percentage based on venue count if available
            progress: venueCount && data.progress.current 
              ? Math.min(100, Math.round((data.progress.current / venueCount) * 100))
              : data.progress.progress
          };
          
          setProgress(enhancedProgress);

          // Stop polling when complete
          if (data.progress.status === 'completed' || data.progress.status === 'failed' || data.progress.status === 'timeout') {
            setIsLoading(false);
            return;
          }
        } else {
          setError('Failed to fetch progress data');
          setIsLoading(false);
          return;
        }

        // Continue polling every 2 seconds
        setTimeout(pollProgress, 2000);
      } catch (err) {
        console.error('Progress polling error:', err);
        setError(err instanceof Error ? err.message : 'Network error');
        // Retry after 5 seconds on error
        setTimeout(pollProgress, 5000);
      }
    };

    pollProgress();
  }, [operationId, venueCount]);

  useEffect(() => {
    if (operationId) {
      startTracking();
    }
  }, [operationId, startTracking]);

  return { progress, isLoading, error, startTracking };
};
