"use client";

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

// Combined data interfaces
interface AppData {
  health: HealthData | null;
  stats: StatsData | null;
  venues: VenuesData | null;
  companies: CompanyInfo[];
  loading: {
    health: boolean;
    stats: boolean;
    venues: boolean;
    companies: boolean;
  };
  errors: {
    health: string | null;
    stats: string | null;
    venues: string | null;
    companies: string | null;
  };
  lastRefresh: Date | null;
}

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

interface VenuesData {
  success: boolean;
  meta: {
    analysisType: string;
    executionTimeMs: number;
    generatedAt: string;
  };
  summary: {
    totalRegions: number;
    realTimeVenues: number;
    scheduledVenues: number;
    venueDifference: number;
    accuracyPercentage: string;
    dataStaleness: string;
    healthStatus: "excellent" | "good" | "warning" | "critical";
  };
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

interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
  pan: string;
  created_at: string;
  updated_at: string;
}

interface RawCompanyResponse {
  success: boolean;
  data: {
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      email: string;
      phone_number: string;
      created_at: string;
      updated_at: string;
      company: {
        name: string;
        address: string;
        GSTIN: string;
        PAN: string;
      };
    }>;
  };
}

interface AppDataContextType {
  data: AppData;
  refetch: () => void;
  isAnyLoading: boolean;
  isAllLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// No caching - always fetch fresh data

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({
    health: null,
    stats: null,
    venues: null,
    companies: [],
    loading: {
      health: true,
      stats: true,
      venues: true,
      companies: true,
    },
    errors: {
      health: null,
      stats: null,
      venues: null,
      companies: null,
    },
    lastRefresh: null,
  });

  const transformCompanyResponse = (response: RawCompanyResponse): CompanyInfo | null => {
    try {
      if (!response.success || !response.data.success || !response.data.data.length) {
        return null;
      }

      const userData = response.data.data[0];
      return {
        id: userData.id,
        name: userData.company.name,
        email: userData.email,
        phone: userData.phone_number,
        address: userData.company.address,
        gstin: userData.company.GSTIN,
        pan: userData.company.PAN,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      };
    } catch (err) {
      console.error('Error transforming company API response:', err);
      return null;
    }
  };

  const fetchAllData = useCallback(async () => {
    // Always fetch fresh data - no caching
    console.log('🔄 Refreshing data...');

    // Set loading states
    setData(prev => ({
      ...prev,
      loading: { health: true, stats: true, venues: true, companies: true },
      errors: { health: null, stats: null, venues: null, companies: null },
    }));

    // Individual fetch functions that update state immediately when complete
    const fetchStats = async () => {
      try {
        console.log('📊 Loading stats data...');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.stats}`, {
          method: 'GET',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
        });

        if (response.ok) {
          const data = await response.json();
          setData(prev => ({
            ...prev,
            stats: data as StatsData,
            loading: { ...prev.loading, stats: false },
            errors: { ...prev.errors, stats: null },
          }));
          console.log('✅ Stats data loaded successfully');
        } else {
          setData(prev => ({
            ...prev,
            stats: null,
            loading: { ...prev.loading, stats: false },
            errors: { ...prev.errors, stats: 'Failed to load stats data' },
          }));
          console.log('❌ Stats data failed to load');
        }
      } catch (error) {
        console.error('Error loading stats data:', error);
        setData(prev => ({
          ...prev,
          stats: null,
          loading: { ...prev.loading, stats: false },
          errors: { ...prev.errors, stats: 'Network error' },
        }));
      }
    };

    const fetchVenues = async () => {
      try {
        console.log('📊 Loading venues data...');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.venues}`, {
          method: 'GET',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
        });

        if (response.ok) {
          const data = await response.json();
          setData(prev => ({
            ...prev,
            venues: data as VenuesData,
            loading: { ...prev.loading, venues: false },
            errors: { ...prev.errors, venues: null },
          }));
          console.log('✅ Venues data loaded successfully');
        } else {
          setData(prev => ({
            ...prev,
            venues: null,
            loading: { ...prev.loading, venues: false },
            errors: { ...prev.errors, venues: 'Failed to load venues data' },
          }));
          console.log('❌ Venues data failed to load');
        }
      } catch (error) {
        console.error('Error loading venues data:', error);
        setData(prev => ({
          ...prev,
          venues: null,
          loading: { ...prev.loading, venues: false },
          errors: { ...prev.errors, venues: 'Network error' },
        }));
      }
    };

    const fetchCompanies = async () => {
      try {
        console.log('📊 Loading companies data...');
        const [company1Response, company2Response] = await Promise.allSettled([
          fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.company1}`, {
            method: 'GET',
            headers: API_CONFIG.defaultHeaders,
            mode: API_CONFIG.corsMode,
          }),
          fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.company2}`, {
            method: 'GET',
            headers: API_CONFIG.defaultHeaders,
            mode: API_CONFIG.corsMode,
          })
        ]);

        if (company1Response.status === 'fulfilled' && company2Response.status === 'fulfilled' && 
            company1Response.value.ok && company2Response.value.ok) {
          const [company1Data, company2Data] = await Promise.all([
            company1Response.value.json(),
            company2Response.value.json()
          ]);
          
          const company1 = transformCompanyResponse(company1Data);
          const company2 = transformCompanyResponse(company2Data);
          
          const companies = [company1, company2].filter(Boolean) as CompanyInfo[];
          setData(prev => ({
            ...prev,
            companies,
            loading: { ...prev.loading, companies: false },
            errors: { ...prev.errors, companies: null },
          }));
          console.log('✅ Companies data loaded successfully');
        } else {
          setData(prev => ({
            ...prev,
            companies: [],
            loading: { ...prev.loading, companies: false },
            errors: { ...prev.errors, companies: 'Failed to load companies data' },
          }));
          console.log('❌ Companies data failed to load');
        }
      } catch (error) {
        console.error('Error loading companies data:', error);
        setData(prev => ({
          ...prev,
          companies: [],
          loading: { ...prev.loading, companies: false },
          errors: { ...prev.errors, companies: 'Network error' },
        }));
      }
    };

    const fetchHealth = async () => {
      try {
        console.log('📊 Loading health data...');
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.health}`, {
          method: 'GET',
          headers: API_CONFIG.defaultHeaders,
          mode: API_CONFIG.corsMode,
        });

        if (response.ok) {
          const data = await response.json();
          setData(prev => ({
            ...prev,
            health: data as HealthData,
            loading: { ...prev.loading, health: false },
            errors: { ...prev.errors, health: null },
          }));
          console.log('✅ Health data loaded successfully');
        } else {
          setData(prev => ({
            ...prev,
            health: null,
            loading: { ...prev.loading, health: false },
            errors: { ...prev.errors, health: 'Failed to load health data' },
          }));
          console.log('❌ Health data failed to load');
        }
      } catch (error) {
        console.error('Error loading health data:', error);
        setData(prev => ({
          ...prev,
          health: null,
          loading: { ...prev.loading, health: false },
          errors: { ...prev.errors, health: 'Network error' },
        }));
      }
    };

    // Run all fetches in parallel - each will update state independently
    await Promise.allSettled([
      fetchStats(),    // Priority 1: Most important for user
      fetchVenues(),   // Priority 2: Important for dashboard
      fetchCompanies(), // Priority 3: Footer/contact info
      fetchHealth(),   // Priority 4: System monitoring
    ]);

    // Update last refresh time
    setData(prev => ({
      ...prev,
      lastRefresh: new Date(),
    }));

    console.log('✅ Data refresh completed');
  }, []);

  useEffect(() => {
    fetchAllData();
    
    // Set up interval for periodic refresh - use configured interval
    const interval = setInterval(() => {
      // Only refresh if the page is visible (user is actively using the app)
      if (!document.hidden) {
        fetchAllData();
      }
    }, API_CONFIG.defaultRefreshInterval);
    
    // Also refresh when user returns to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAllData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAllData]);

  const refetch = useCallback(() => fetchAllData(), [fetchAllData]);

  const isAnyLoading = Object.values(data.loading).some(loading => loading);
  const isAllLoaded = Object.values(data.loading).every(loading => !loading);

  return (
    <AppDataContext.Provider value={{
      data,
      refetch,
      isAnyLoading,
      isAllLoaded,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppDataContext() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppDataContext must be used within an AppDataProvider');
  }
  return context;
}
