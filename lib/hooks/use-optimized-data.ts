"use client";

import { useAppDataContext } from '@/lib/contexts/app-data-context';

// Optimized individual hooks that use centralized context
export function useOptimizedHealthData() {
  const { data, refetch } = useAppDataContext();
  
  return {
    data: data.health,
    loading: data.loading.health,
    error: data.errors.health,
    refetch,
  };
}

export function useOptimizedStatsData() {
  const { data, refetch } = useAppDataContext();
  
  return {
    data: data.stats,
    loading: data.loading.stats,
    error: data.errors.stats,
    refetch,
  };
}

export function useOptimizedVenuesData() {
  const { data, refetch } = useAppDataContext();
  
  return {
    data: data.venues,
    loading: data.loading.venues,
    error: data.errors.venues,
    refetch,
    lastRefresh: data.lastRefresh,
  };
}

export function useOptimizedCompanyData() {
  const { data, refetch } = useAppDataContext();
  
  return {
    companies: data.companies,
    loading: data.loading.companies,
    error: data.errors.companies,
    refetch,
    lastRefresh: data.lastRefresh,
  };
}
