"use client";

import { useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

interface StatsData {
  success: boolean;
  counts: {
    admins: number;
    venues: number;
    facilities: number;
    regions: number;
    cities: number;
    total_venues_from_regions: number;
  };
  admin_analysis: {
    exists: boolean;
    status: string;
    data: {
      generated_at: string;
      total_admins: number;
      total_venues: number;
      total_facilities: number;
      file_size: number;
    };
    file_path: string;
  };
  scheduler: {
    status: {
      name: string;
      isScheduled: boolean;
      isRunning: boolean;
      lastRun: string | null;
      nextRun: string;
      startTime: string;
      errorCount: number;
      successCount: number;
      uptime: number;
      config: {
        timezone: string;
        retry: {
          maxRetries: number;
          backoffMultiplier: number;
          initialDelay: number;
          maxDelay: number;
          retryableErrors: string[];
        };
      };
      adminAnalysis: {
        generated_at: string;
        total_admins: number;
        total_venues: number;
        total_facilities: number;
        file_size: number;
      };
    };
    daily_sync_includes: string;
    refresh_schedule: string;
  };
  data_freshness: {
    sync_status: string;
    global_venues: {
      last_modified: string;
      file_size: number;
      last_updated: string;
      total_venues: number;
    };
    recommendation: string;
  };
  endpoints: {
    refresh: string;
    full_sync: string;
  };
  timestamp: string;
}

interface UseStatsDataReturn {
  data: StatsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStatsData(intervalMs: number = API_CONFIG.defaultRefreshInterval): UseStatsDataReturn {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats}`, {
        method: 'GET',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const statsData = await response.json();
      setData(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats data');
      console.error('Stats data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
    
    const interval = setInterval(fetchStatsData, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    data,
    loading,
    error,
    refetch: fetchStatsData,
  };
}
