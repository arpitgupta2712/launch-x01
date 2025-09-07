"use client";

import React, { createContext, ReactNode, useCallback,useContext, useState } from 'react';

import { API_CONFIG } from '@/lib/api/config';

// Authentication interfaces
interface SignInRequest {
  startDate: string;
  endDate: string;
  email: string;
  password: string;
  reportType?: number;
}

interface SignInResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  operationId?: string; // For progress tracking
  venueCount?: number; // Total number of venues to be processed
  estimatedDuration?: number; // Estimated duration in seconds
}

interface UserCredentials {
  email: string;
  password: string;
  startDate: string;
  endDate: string;
  reportType: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userCredentials: UserCredentials | null;
  isLoading: boolean;
  error: string | null;
  operationId: string | null;
  venueCount: number | null;
  estimatedDuration: number | null;
  signIn: (credentials: Omit<SignInRequest, 'reportType'>) => Promise<SignInResponse>;
  signOut: () => void;
  clearError: () => void;
  setError: (error: string) => void;
  clearOperationId: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCredentials, setUserCredentials] = useState<UserCredentials | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operationId, setOperationId] = useState<string | null>(null);
  const [venueCount, setVenueCount] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);

  const signIn = useCallback(async (credentials: Omit<SignInRequest, 'reportType'>): Promise<SignInResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestData: SignInRequest = {
        ...credentials,
        reportType: 1, // Default to 1 as specified
      };

      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.signIn}`, {
        method: 'POST',
        headers: API_CONFIG.defaultHeaders,
        mode: API_CONFIG.corsMode,
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user credentials for future use
        const userCreds: UserCredentials = {
          email: credentials.email,
          password: credentials.password,
          startDate: credentials.startDate,
          endDate: credentials.endDate,
          reportType: 1,
        };

        setUserCredentials(userCreds);
        setIsAuthenticated(true);
        
        // Extract operation ID if present
        const operationId = data.operationId || data.data?.operationId;
        if (operationId) {
          setOperationId(operationId);
        }
        
        // Extract venue count and estimated duration if present
        const venueCount = data.venueCount;
        const estimatedDuration = data.estimatedDuration;
        if (venueCount !== undefined) {
          setVenueCount(venueCount);
        }
        if (estimatedDuration !== undefined) {
          setEstimatedDuration(estimatedDuration);
        }
        
        return {
          success: true,
          message: 'Sign in successful',
          data,
          operationId,
          venueCount,
          estimatedDuration,
        };
      } else {
        const errorMessage = data.message || 'Sign in failed';
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage,
        };
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      console.error('Sign in error:', err);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(() => {
    setIsAuthenticated(false);
    setUserCredentials(null);
    setError(null);
    setOperationId(null);
    setVenueCount(null);
    setEstimatedDuration(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearOperationId = useCallback(() => {
    setOperationId(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userCredentials,
      isLoading,
      error,
      operationId,
      venueCount,
      estimatedDuration,
      signIn,
      signOut,
      clearError,
      setError,
      clearOperationId,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
