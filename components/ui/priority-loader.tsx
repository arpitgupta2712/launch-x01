"use client";

import { useAppDataContext } from '@/lib/contexts/app-data-context';

interface PriorityLoaderProps {
  className?: string;
}

export function PriorityLoader({ className = "" }: PriorityLoaderProps) {
  const { data, isAnyLoading } = useAppDataContext();

  if (!isAnyLoading) return null;

  const priorityOrder = [
    { key: 'stats', label: 'Admin Stats' },
    { key: 'venues', label: 'Venues Data' },
    { key: 'companies', label: 'Company Info' },
    { key: 'health', label: 'Database Health' },
  ];

  return (
    <div className={`fixed top-4 right-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg ${className}`}>
      <div className="text-sm font-medium mb-2">Loading Data by Priority</div>
      <div className="space-y-1">
        {priorityOrder.map(({ key, label }, index) => {
          const isLoading = data.loading[key as keyof typeof data.loading];
          const hasData = key === 'companies' ? data.companies.length > 0 : data[key as keyof typeof data];
          const hasError = data.errors[key as keyof typeof data.errors];
          
          return (
            <div key={key} className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                hasError ? 'bg-red-500' : 
                hasData ? 'bg-green-500' : 
                isLoading ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-300'
              }`} />
              <span className={hasError ? 'text-red-500' : hasData ? 'text-green-600' : 'text-muted-foreground'}>
                {index + 1}. {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
