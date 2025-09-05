"use client";

import { useEffect, useState } from 'react';

interface HealthData {
  status: "healthy" | "warning" | "error";
  timestamp: string;
  responseTime: string;
  database: {
    status: string;
    modules: {
      [key: string]: {
        status: string;
        recordCount?: number;
        filter?: Record<string, string>;
        latestSlotDate?: string;
        latestTransactionDate?: string;
      };
    };
  };
  service: string;
  version: string;
}

interface UseHealthDataReturn {
  data: HealthData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHealthData(intervalMs: number = 15000): UseHealthDataReturn {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await fetch('https://claygrounds-6d703322b3bc.herokuapp.com/api/db/health');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const healthData = await response.json();
      setData(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health data');
      console.error('Health data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    const interval = setInterval(fetchHealthData, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    data,
    loading,
    error,
    refetch: fetchHealthData,
  };
}
