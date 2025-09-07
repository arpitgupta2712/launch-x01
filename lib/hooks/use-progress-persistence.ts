"use client";

import { useCallback, useEffect, useState } from 'react';

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
  error?: string;
}

const STORAGE_KEY = 'claygrounds_progress_summary';
const EXPIRY_MINUTES = 10; // Keep for 10 minutes

export const useProgressPersistence = () => {
  const [lastSummary, setLastSummary] = useState<ProgressSummary | null>(null);

  // Load last summary from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const summary = JSON.parse(stored);
        const now = new Date();
        const storedTime = new Date(summary.storedAt);
        const minutesDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60);
        
        if (minutesDiff < EXPIRY_MINUTES) {
          setLastSummary(summary);
        } else {
          // Expired, remove from storage
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading progress summary from localStorage:', error);
    }
  }, []);

  // Save progress summary to localStorage
  const saveProgressSummary = useCallback((summary: ProgressSummary) => {
    try {
      const summaryWithTimestamp = {
        ...summary,
        storedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(summaryWithTimestamp));
      setLastSummary(summaryWithTimestamp);
    } catch (error) {
      console.error('Error saving progress summary to localStorage:', error);
    }
  }, []);

  // Clear progress summary
  const clearProgressSummary = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setLastSummary(null);
    } catch (error) {
      console.error('Error clearing progress summary from localStorage:', error);
    }
  }, []);

  // Check if summary is expired
  const isSummaryExpired = useCallback((summary: ProgressSummary) => {
    const now = new Date();
    const storedTime = new Date((summary as any).storedAt);
    const minutesDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60);
    return minutesDiff >= EXPIRY_MINUTES;
  }, []);

  return {
    lastSummary,
    saveProgressSummary,
    clearProgressSummary,
    isSummaryExpired,
  };
};
