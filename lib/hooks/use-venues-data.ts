"use client";

import { useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

interface VenuesSummary {
  totalRegions: number;
  realTimeVenues: number;
  scheduledVenues: number;
  venueDifference: number;
  accuracyPercentage: string;
  dataStaleness: string;
  healthStatus: "excellent" | "good" | "warning" | "critical";
}

interface VenuesData {
  success: boolean;
  meta: {
    analysisType: string;
    executionTimeMs: number;
    generatedAt: string;
  };
  summary: VenuesSummary;
  regions: Array<{
    regionId: number;
    regionName: string;
    totalVenues: number;
    storedVenues: number;
    venueDifference: number;
    cityCount: number;
  }>;
  recommendations: {
    dataFreshness: string;
    accuracy: string;
    nextUpdate: string;
  };
  message: string;
  timestamp: string;
}

interface UseVenuesDataReturn {
  data: VenuesData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastRefresh: Date | null;
}

export function useVenuesData(intervalMs: number = API_CONFIG.defaultRefreshInterval): UseVenuesDataReturn {
  const [data, setData] = useState<VenuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchVenuesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.venues}`, {
        method: 'GET',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const venuesData = await response.json();
      setData(venuesData);
      setLastRefresh(new Date());
      
      console.log('Venues data received:', venuesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Venues data fetch error:', err);
      
      // Check if it's a CORS error
      if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) {
        setError('CORS Error: API call blocked by browser. Check server CORS configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenuesData();
    
    const interval = setInterval(fetchVenuesData, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    data,
    loading,
    error,
    refetch: fetchVenuesData,
    lastRefresh,
  };
}
