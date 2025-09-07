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
  processedVenuesFromLogs?: string[]; // Venue names extracted from logs
  error?: string;
}

const STORAGE_KEY = 'claygrounds_progress_summary';
const EXPIRY_MINUTES = 10; // Keep for 10 minutes

export const useProgressPersistence = () => {
  const [lastSummary, setLastSummary] = useState<ProgressSummary | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<ProgressSummary[]>([]);

  // Load recent summaries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const summaries = JSON.parse(stored);
        const now = new Date();
        
        // Handle both single summary and array of summaries
        const summaryArray = Array.isArray(summaries) ? summaries : [summaries];
        
        const validSummaries = summaryArray.filter((summary: ProgressSummary & { storedAt?: string }) => {
          if (!summary.storedAt) return false;
          const storedTime = new Date(summary.storedAt);
          const minutesDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60);
          return minutesDiff < EXPIRY_MINUTES;
        });
        
        if (validSummaries.length > 0) {
          setRecentSummaries(validSummaries);
          setLastSummary(validSummaries[0]); // Most recent is first
        } else {
          // All expired, remove from storage
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
      
      // Get existing summaries and add new one at the beginning
      const existing = localStorage.getItem(STORAGE_KEY);
      let summaries: (ProgressSummary & { storedAt?: string })[] = [];
      
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          summaries = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          summaries = [];
        }
      }
      
      // Add new summary at the beginning and keep only last 5
      summaries.unshift(summaryWithTimestamp);
      summaries = summaries.slice(0, 5);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
      setRecentSummaries(summaries);
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
      setRecentSummaries([]);
    } catch (error) {
      console.error('Error clearing progress summary from localStorage:', error);
    }
  }, []);

  // Check if summary is expired
  const isSummaryExpired = useCallback((summary: ProgressSummary & { storedAt?: string }) => {
    const now = new Date();
    const storedTime = new Date(summary.storedAt || '');
    const minutesDiff = (now.getTime() - storedTime.getTime()) / (1000 * 60);
    return minutesDiff >= EXPIRY_MINUTES;
  }, []);

  return {
    lastSummary,
    recentSummaries,
    saveProgressSummary,
    clearProgressSummary,
    isSummaryExpired,
  };
};
