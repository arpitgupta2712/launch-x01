"use client";

import { useEffect, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

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

interface RawApiResponse {
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

interface UseCompanyDataReturn {
  companies: CompanyInfo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  lastRefresh: Date | null;
}

export function useCompanyData(): UseCompanyDataReturn {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const transformApiResponse = (response: RawApiResponse): CompanyInfo | null => {
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
      console.error('Error transforming API response:', err);
      return null;
    }
  };

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both companies in parallel
      const [response1, response2] = await Promise.all([
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

      if (!response1.ok || !response2.ok) {
        throw new Error(`API Error: Failed to fetch company data`);
      }

      const [data1, data2] = await Promise.all([
        response1.json(),
        response2.json()
      ]);

      const company1 = transformApiResponse(data1);
      const company2 = transformApiResponse(data2);

      const validCompanies = [company1, company2].filter(Boolean) as CompanyInfo[];
      
      setCompanies(validCompanies);
      setLastRefresh(new Date());

      console.log('Company data received:', validCompanies);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Company data fetch error:', err);

      // Check if it's a CORS error
      if (errorMessage.includes('CORS') || errorMessage.includes('blocked')) {
        setError('CORS Error: API call blocked by browser. Check server CORS configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanyData,
    lastRefresh,
  };
}
