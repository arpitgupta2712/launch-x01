"use client";

import {
  ActivityIcon,
  BuildingIcon,
  CreditCardIcon,
  FileTextIcon,
  SquarePenIcon,
  UsersIcon,
} from "lucide-react";
import { ReactNode } from "react";

import { useHealthData } from "@/lib/hooks/use-health-data";

import { Item, ItemDescription, ItemIcon, ItemTitle } from "../../ui/item";
import { Section } from "../../ui/section";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
}

interface ItemsProps {
  title?: string;
  className?: string;
}

interface HealthModule {
  status: string;
  recordCount?: number;
  filter?: Record<string, string>;
  latestSlotDate?: string;
  latestTransactionDate?: string;
}

interface HealthData {
  status: string;
  timestamp: string;
  responseTime: string;
  database: {
    status: string;
    modules: Record<string, HealthModule>;
  };
  service: string;
  version: string;
}

// Function to map health data to item format
function mapHealthDataToItems(healthData: HealthData): ItemProps[] {
  if (!healthData?.database?.modules) return [];
  
  // Custom name mapping for display
  const nameMapping: Record<string, string> = {
    locations: 'Locations',
    employees: 'Employees',
    tasks: 'Tasks',
    bookingsPayments: 'Bookings',
    licenses: 'Licenses',
    cashbook: 'Cashbook',
  };

  const moduleIcons: Record<string, ReactNode> = {
    locations: <BuildingIcon className="size-5 stroke-1" />,
    employees: <UsersIcon className="size-5 stroke-1" />,
    tasks: <FileTextIcon className="size-5 stroke-1" />,
    bookingsPayments: <CreditCardIcon className="size-5 stroke-1" />,
    licenses: <SquarePenIcon className="size-5 stroke-1" />,
    cashbook: <ActivityIcon className="size-5 stroke-1" />,
  };

  const items: ItemProps[] = [];

  Object.entries(healthData.database.modules).forEach(([name, module]: [string, HealthModule]) => {
    const displayName = nameMapping[name] || name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    const recordCount = module.recordCount ? 
      (module.recordCount >= 1000 ? 
        `${(module.recordCount / 1000).toFixed(1)}K` : 
        module.recordCount.toString()) : 
      'N/A';
    
    const status = module.status === 'connected' ? 'Active' : module.status;
    
    // Add main module card
    items.push({
      title: displayName,
      description: `${recordCount} records • ${status}`,
      icon: moduleIcons[name] || <ActivityIcon className="size-5 stroke-1" />,
    });

    // Add separate date cards for cashbook and bookingsPayments
    if (name === 'cashbook' && module.latestTransactionDate) {
      items.push({
        title: `${displayName} Latest`,
        description: `Last transaction: ${module.latestTransactionDate}`,
        icon: <ActivityIcon className="size-5 stroke-1" />,
      });
    }
    
    if (name === 'bookingsPayments' && module.latestSlotDate) {
      items.push({
        title: `${displayName} Latest`,
        description: `Last slot: ${module.latestSlotDate}`,
        icon: <CreditCardIcon className="size-5 stroke-1" />,
      });
    }
  });

  return items;
}

export default function Items({
  title = "System Health Dashboard",
  className,
}: ItemsProps) {
  const { data: healthData, loading: healthLoading, error: healthError, refetch } = useHealthData();

  // Only show health data items
  const healthItems = healthData ? mapHealthDataToItems(healthData) : [];

  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-6 sm:gap-20">
        <div className="flex flex-col items-center gap-4">
          <h2 className="max-w-[560px] text-center text-3xl leading-tight font-semibold sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          
          {/* Refresh Button */}
          <button
            onClick={refetch}
            disabled={healthLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ActivityIcon className={`size-4 ${healthLoading ? 'animate-spin' : ''}`} />
            {healthLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {healthLoading && healthItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="text-center">
              <p className="text-muted-foreground">Loading system data...</p>
              <p className="text-xs text-muted-foreground mt-1">Fetching health metrics from database</p>
            </div>
          </div>
        )}
        
        {healthError && (
          <div className="text-center p-8 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load system data</p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-1">{healthError}</p>
            <button
              onClick={refetch}
              className="mt-3 px-3 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
        
        {healthItems.length > 0 && (
          <div className="grid auto-rows-fr grid-cols-2 gap-0 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {healthItems.map((item, index) => (
              <Item key={index}>
                <ItemTitle className="flex items-center gap-2">
                  <ItemIcon>{item.icon}</ItemIcon>
                  {item.title}
                </ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </Item>
            ))}
          </div>
        )}
        
        {healthData && (
          <div className="text-center text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            {(() => {
              const cashbookDate = healthData.database.modules.cashbook?.latestTransactionDate;
              const bookingsDate = healthData.database.modules.bookingsPayments?.latestSlotDate;
              
              if (cashbookDate && bookingsDate) {
                const cashbookTime = new Date(cashbookDate).getTime();
                const bookingsTime = new Date(bookingsDate).getTime();
                const diffDays = Math.abs(cashbookTime - bookingsTime) / (1000 * 60 * 60 * 24);
                
                const isAlert = diffDays > 7;
                const alertColor = isAlert ? 'text-red-600' : 'text-green-600';
                const alertText = isAlert ? 'ALERT' : 'OK';
                
                return (
                  <p>
                    System Status: <span className="font-medium text-green-600">{healthData.status}</span> • 
                    Date Sync: <span className={`font-medium ${alertColor}`}>{alertText}</span> • 
                    Last Updated: <span className="font-medium">{new Date(healthData.timestamp).toLocaleTimeString()}</span>
                  </p>
                );
              }
              
              return (
                <p>
                  System Status: <span className="font-medium text-green-600">{healthData.status}</span> • 
                  Last Updated: <span className="font-medium">{new Date(healthData.timestamp).toLocaleTimeString()}</span>
                </p>
              );
            })()}
          </div>
        )}
      </div>
    </Section>
  );
}
