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

import { useOptimizedHealthData } from "@/lib/hooks/use-optimized-data";

import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Section } from "../../ui/section";

interface ItemProps {
  title: string;
  description: string;
  icon: ReactNode;
  order?: number;
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
    bookingsPayments: 'Hudle',
    licenses: 'Licenses',
    cashbook: 'Cashbook',
  };

  const moduleIcons: Record<string, ReactNode> = {
    locations: <BuildingIcon className="size-6 stroke-1" />,
    employees: <UsersIcon className="size-6 stroke-1" />,
    tasks: <FileTextIcon className="size-6 stroke-1" />,
    bookingsPayments: <CreditCardIcon className="size-6 stroke-1" />,
    licenses: <SquarePenIcon className="size-6 stroke-1" />,
    cashbook: <ActivityIcon className="size-6 stroke-1" />,
  };

  // Custom order mapping for grid display
  const moduleOrder: Record<string, number> = {
    locations: 1,
    licenses: 2,  // Licenses as second card
    employees: 3,
    tasks: 4,
    bookingsPayments: 5,
    cashbook: 6,
  };

  const items: ItemProps[] = [];

  Object.entries(healthData.database.modules).forEach(([name, module]: [string, HealthModule]) => {
    const displayName = nameMapping[name];
    
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
      icon: moduleIcons[name] || <ActivityIcon className="size-6 stroke-1" />,
      order: moduleOrder[name] || 999, // Default to end if not in order mapping
    });

    // Add separate date cards for cashbook and bookingsPayments
    if (name === 'cashbook' && module.latestTransactionDate) {
      items.push({
        title: displayName,
        description: `Last transaction: ${module.latestTransactionDate}`,
        icon: <ActivityIcon className="size-6 stroke-1" />,
        order: moduleOrder[name] + 0.5, // Place after main card
      });
    }
    
    if (name === 'bookingsPayments' && module.latestSlotDate) {
      items.push({
        title: displayName,
        description: `Last slot: ${module.latestSlotDate}`,
        icon: <CreditCardIcon className="size-6 stroke-1" />,
        order: moduleOrder[name] + 0.5, // Place after main card
      });
    }
  });

  // Sort items by custom order
  return items.sort((a, b) => (a.order || 999) - (b.order || 999));
}

export default function Items({
  title = "System Health Dashboard",
  className,
}: ItemsProps) {
  const { data: healthData, loading: healthLoading, error: healthError, refetch } = useOptimizedHealthData();

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
          <Button
            onClick={refetch}
            disabled={healthLoading}
            size="sm"
            className="gap-2"
            variant="secondary"
          >
            <ActivityIcon className={`size-4 ${healthLoading ? 'animate-spin' : ''}`} />
            {healthLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
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
            <Button
              onClick={refetch}
              variant="outline"
              size="xs"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {healthItems.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {healthItems.map((item, index) => {
              // Parse the description to extract record count and status
              const isLatestCard = item.description.includes('Last transaction:') || item.description.includes('Last slot:');
              const parts = item.description.split(' • ');
              const recordPart = parts[0];
              const statusPart = parts[1];
              
              return (
                <Card key={index} className="group transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20">
                  <CardHeader className="pb-4 text-center space-y-3">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        {item.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0 pb-6 text-center space-y-3">
                    {isLatestCard ? (
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary drop-shadow-sm">
                            {(() => {
                              const dateStr = item.description.replace('Last transaction: ', '').replace('Last slot: ', '');
                              const date = new Date(dateStr);
                              const now = new Date();
                              const diffTime = Math.abs(now.getTime() - date.getTime());
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              return diffDays;
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            days ago
                          </div>
                        </div>
                        
                        <Badge 
                          variant="secondary" 
                          className="text-xs font-medium"
                        >
                          Last updated
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary drop-shadow-sm">
                            {recordPart.replace(' records', '')}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            records
                          </div>
                        </div>
                        
                        <Badge 
                          variant={statusPart === 'Active' ? 'secondary' : 'destructive'} 
                          className="text-xs font-medium"
                        >
                          {statusPart}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        
        {healthData && (
          <div className="hidden sm:block text-center text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(() => {
                const cashbookDate = healthData.database.modules.cashbook?.latestTransactionDate;
                const bookingsDate = healthData.database.modules.bookingsPayments?.latestSlotDate;
                
                if (cashbookDate && bookingsDate) {
                  const cashbookTime = new Date(cashbookDate).getTime();
                  const bookingsTime = new Date(bookingsDate).getTime();
                  const diffDays = Math.abs(cashbookTime - bookingsTime) / (1000 * 60 * 60 * 24);
                  
                  const isAlert = diffDays > 7;
                  
                  return (
                    <>
                      <span>System Status:</span>
                      <Badge variant="default" size="default">
                        {healthData.status}
                      </Badge>
                      <span>•</span>
                      <span>Date Sync:</span>
                      <Badge 
                        variant={isAlert ? "destructive" : "default"} 
                        size="default"
                      >
                        {isAlert ? 'ALERT' : 'OK'}
                      </Badge>
                      <span>•</span>
                      <span>Last Updated:</span>
                      <Badge variant="outline" size="default">
                        {new Date(healthData.timestamp).toLocaleTimeString()}
                      </Badge>
                    </>
                  );
                }
                
                return (
                  <>
                    <span>System Status:</span>
                    <Badge variant="default" size="sm">
                      {healthData.status}
                    </Badge>
                    <span>•</span>
                    <span>Last Updated:</span>
                    <Badge variant="secondary" size="sm">
                      {new Date(healthData.timestamp).toLocaleTimeString()}
                    </Badge>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}