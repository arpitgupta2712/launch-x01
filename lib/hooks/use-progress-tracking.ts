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
          // Use the progress data directly from API response
          // The API already provides current, total, and progress percentage
          const enhancedProgress = {
            ...data.progress,
            // Use API values directly - they're already calculated correctly
            total: data.progress.total || venueCount || 0,
            current: data.progress.current || 0,
            progress: data.progress.progress || 0
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

        // Adaptive polling: faster when running, slower when complete
        const isRunning = data.progress.status === 'running';
        const pollDelay = isRunning ? 500 : 2000; // 500ms when running, 2s otherwise
        
        // Continue polling with adaptive delay
        setTimeout(() => pollProgress(), pollDelay);
      } catch (err) {
        console.error('Progress polling error:', err);
        setError(err instanceof Error ? err.message : 'Network error');
        // Retry after 2 seconds on error (reduced from 5s)
        setTimeout(() => pollProgress(), 2000);
      }
    };

    // Start with immediate first poll
    pollProgress();
  }, [operationId, venueCount]);

  useEffect(() => {
    if (operationId) {
      startTracking();
    }
  }, [operationId, startTracking]);

  return { progress, isLoading, error, startTracking };
};
