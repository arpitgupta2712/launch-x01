"use client";

import { useStatsData } from "@/lib/hooks/use-stats-data";
import { RefreshCw } from "lucide-react";

import { Button } from "../../ui/button";
import { Section } from "../../ui/section";

interface StatItemProps {
  label?: string;
  value: string | number;
  suffix?: string;
  description?: string;
}

interface StatsProps {
  items?: StatItemProps[] | false;
  className?: string;
}

export default function Stats({
  items,
  className,
}: StatsProps) {
  const { data: statsData, loading, error, refetch } = useStatsData();

  // Generate stats items from API data
  const generateStatsItems = (): StatItemProps[] => {
    if (!statsData?.counts) {
      return [
        {
          label: "Loading...",
          value: "---",
          description: "fetching data",
        },
        {
          label: "Loading...",
          value: "---", 
          description: "fetching data",
        },
        {
          label: "Loading...",
          value: "---",
          description: "fetching data",
        },
        {
          label: "Loading...",
          value: "---",
          description: "fetching data",
        },
      ];
    }

    const { counts } = statsData;
    
    return [
      {
        label: "scanning",
        value: counts.venues,
        suffix: "venues",
        description: "total venues",
      },
      {
        label: "for",
        value: counts.admins,
        suffix: "admins",
        description: "active administrators",
      },
      {
        label: "in",
        value: counts.cities,
        suffix: "cities",
        description: "urban centers",
      },
      {
        label: "across",
        value: counts.regions,
        suffix: "regions",
        description: "geographic coverage",
      },
    ];
  };

  // Use provided items or generate from API data
  const displayItems = items || generateStatsItems();
  return (
    <Section className={className}>
      <div className="container mx-auto max-w-[960px]">
        {/* Error Display */}
        {error && (
          <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800 mb-8">
            <p className="text-red-600 dark:text-red-400 font-medium">Failed to load stats data</p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-1">{error}</p>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && !statsData && (
          <div className="flex flex-col items-center justify-center p-8 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <div className="text-center">
              <p className="text-muted-foreground">Loading platform statistics...</p>
              <p className="text-xs text-muted-foreground mt-1">Fetching live data from Hudle API</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {displayItems && displayItems.length > 0 && (
          <div className="flex flex-col items-center gap-6">
            {/* Refresh Button */}
            <Button
              onClick={refetch}
              disabled={loading}
              size="sm"
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Stats'}
            </Button>


            <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
              {displayItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start gap-3 text-left"
                >
                  {item.label && (
                    <div className="text-muted-foreground text-sm font-semibold">
                      {item.label}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <div className="text-primary text-4xl font-medium drop-shadow-[2px_1px_24px_var(--primary)] transition-all duration-300 sm:text-5xl md:text-6xl">
                      {item.value}
                    </div>
                    {item.suffix && (
                      <div className="text-foreground text-2xl font-semibold">
                        {item.suffix}
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-muted-foreground text-sm font-semibold text-pretty">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data Freshness Info */}
            {statsData && (
              <div className="text-center text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span>Last Updated:</span>
                  <span className="font-mono">
                    {new Date(statsData.timestamp).toLocaleTimeString()}
                  </span>
                  <span>•</span>
                  <span>Status:</span>
                  <span className="text-primary dark:text-primary font-medium">
                    {statsData.success ? 'Live' : 'Error'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
