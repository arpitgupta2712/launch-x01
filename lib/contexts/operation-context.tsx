"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OperationData {
  id: string;
  type: 'email' | 'process';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  progress: number;
  total: number;
  current: number;
  duration: number;
  startTime: string;
  endTime?: string;
  venueCount?: number;
  estimatedDuration?: number;
  logs: Array<{ message: string; timestamp: string; level: string }>;
  data?: {
    operation: string;
    startDate?: string;
    endDate?: string;
    processedLocations?: Array<{
      id: string;
      name: string;
      status: string;
      timestamp: string;
    }>;
  };
  error?: string;
  fileName?: string;
}

interface OperationContextType {
  currentOperation: OperationData | null;
  setCurrentOperation: (operation: OperationData | null) => void;
  updateOperation: (updates: Partial<OperationData>) => void;
  clearOperation: () => void;
  isOperationRunning: boolean;
  getOperationSummary: () => string | null;
}

const OperationContext = createContext<OperationContextType | undefined>(undefined);

export function OperationProvider({ children }: { children: ReactNode }) {
  const [currentOperation, setCurrentOperation] = useState<OperationData | null>(null);

  const updateOperation = useCallback((updates: Partial<OperationData>) => {
    setCurrentOperation(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const clearOperation = useCallback(() => {
    setCurrentOperation(null);
  }, []);

  const isOperationRunning = currentOperation?.status === 'running' || currentOperation?.status === 'pending';

  const getOperationSummary = useCallback(() => {
    if (!currentOperation) return null;
    
    const { status, current, total, data, error } = currentOperation;
    
    if (status === 'completed') {
      const processedCount = data?.processedLocations?.length || current;
      return `✅ Successfully processed ${processedCount} venues`;
    }
    
    if (status === 'failed') {
      return `❌ Operation failed: ${error || 'Unknown error'}`;
    }
    
    if (status === 'running') {
      return `🔄 Processing ${current} of ${total} venues...`;
    }
    
    return null;
  }, [currentOperation]);

  return (
    <OperationContext.Provider
      value={{
        currentOperation,
        setCurrentOperation,
        updateOperation,
        clearOperation,
        isOperationRunning,
        getOperationSummary,
      }}
    >
      {children}
    </OperationContext.Provider>
  );
}

export function useOperation() {
  const context = useContext(OperationContext);
  if (context === undefined) {
    throw new Error('useOperation must be used within an OperationProvider');
  }
  return context;
}
