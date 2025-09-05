"use client";

import { useAppDataContext } from '@/lib/contexts/app-data-context';

import { Badge } from './badge';

interface ApiStatusBadgeProps {
  className?: string;
}

export function ApiStatusBadge({ className = "" }: ApiStatusBadgeProps) {
  const { data, isAnyLoading, isAllLoaded, refetch } = useAppDataContext();

  // Don't show anything if all data is loaded
  if (isAllLoaded) return null;

  const getStatusInfo = () => {
    if (isAnyLoading) {
      // Find which specific API is currently loading
      const loadingStates = [
        { key: 'stats', label: 'Admin Stats' },
        { key: 'venues', label: 'Venues Data' },
        { key: 'companies', label: 'Company Info' },
        { key: 'health', label: 'Database Health' },
      ];

      const currentlyLoading = loadingStates.find(state => data.loading[state.key as keyof typeof data.loading]);
      
      if (currentlyLoading) {
        return {
          text: `Loading ${currentlyLoading.label}...`,
          variant: "outline" as const,
          className: "animate-pulse"
        };
      }
    }

    // Check for errors
    const errorStates = [
      { key: 'stats', label: 'Admin Stats' },
      { key: 'venues', label: 'Venues Data' },
      { key: 'companies', label: 'Company Info' },
      { key: 'health', label: 'Database Health' },
    ];

    const failedState = errorStates.find(state => data.errors[state.key as keyof typeof data.errors]);
    if (failedState) {
      return {
        text: `${failedState.label} offline`,
        variant: "destructive" as const,
        className: ""
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <Badge 
      variant={statusInfo.variant} 
      className={`${statusInfo.className} ${className} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={refetch}
      title="Click to refresh data"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span className="text-xs font-medium">
          {statusInfo.text}
        </span>
      </div>
    </Badge>
  );
}
