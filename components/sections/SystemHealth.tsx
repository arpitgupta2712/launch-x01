"use client";

import { 
  BarChart3, 
  CheckCircle, 
  Clock,
  Globe, 
  MapPin, 
  Monitor,
  RefreshCw,
  TrendingUp
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import { useOptimizedVenuesData } from "@/lib/hooks/use-optimized-data";
import { cn } from "@/lib/utils";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Section } from "../ui/section";

/**
 * 🎨 HEALTH METRIC CONFIGURATION
 * 
 * Configuration object for individual health metrics in the dashboard.
 * Each metric displays a key system indicator with status and visual styling.
 * 
 * @interface HealthMetric
 * @property {string} label - Display label for the metric
 * @property {string} value - Current value/status
 * @property {ReactNode} icon - Icon component to display
 * @property {"healthy" | "warning" | "critical"} status - Health status
 * @property {string} [description] - Additional description text
 * @property {string} [trend] - Trend indicator (e.g., "+2.3%", "Live")
 */
interface HealthMetric {
  label: string;
  value: string;
  icon: ReactNode;
  status: "healthy" | "warning" | "critical";
  description?: string;
  trend?: string;
}

/**
 * 🎨 HEALTH DASHBOARD CONFIGURATION
 * 
 * Configuration object for the health monitoring dashboard section.
 * This section displays real-time system health metrics, data freshness,
 * and dynamic status information for internal monitoring.
 * 
 * @interface HealthDashboardProps
 * @property {string} [title] - Dynamic section title (default: rotating system metrics)
 * @property {ReactNode | false} [badge] - Data freshness badge (default: auto-generated)
 * @property {HealthMetric[] | false} [metrics] - Array of health metrics to display
 * @property {string} [className] - Additional CSS classes for custom styling
 * @property {number} [refreshInterval] - Auto-refresh interval in milliseconds (default: 30000)
 * 
 * @example
 * ```tsx
 * <HealthDashboard
 *   title="System monitoring 1,247 active venues"
 *   metrics={[
 *     { label: "Total Venues", value: "1,247", icon: <MapPin />, status: "healthy" }
 *   ]}
 * />
 * ```
 */
interface HealthDashboardProps {
  title?: string;
  badge?: ReactNode | false;
  metrics?: HealthMetric[] | false;
  className?: string;
}

/**
 * 🎨 HEALTH DASHBOARD COMPONENT
 * 
 * The health dashboard component that displays real-time system monitoring metrics.
 * This component shows data freshness, system status, and key performance indicators
 * for internal monitoring and system health visibility.
 * 
 * @component
 * @param {HealthDashboardProps} props - Configuration object for the health dashboard
 * @returns {JSX.Element} The rendered health dashboard section
 * 
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <HealthDashboard />
 * 
 * // Custom metrics and title
 * <HealthDashboard
 *   title="System monitoring 1,247 active venues"
 *   metrics={[
 *     { label: "Total Venues", value: "1,247", icon: <MapPin />, status: "healthy" }
 *   ]}
 * />
 * ```
 * 
 * 🎨 BRAND CUSTOMIZATION POINTS:
 * - Line 95: Dynamic title rotation system
 * - Line 97: Data freshness badge with color coding
 * - Line 99-115: Health metrics array - customize for your system
 * - Line 117: Section background and styling
 */
export default function SystemHealth({
  // 🎨 BRAND CUSTOMIZATION: Dynamic title - rotates through key metrics
  title,
  // 🎨 BRAND CUSTOMIZATION: Data freshness badge - auto-generated with color coding
  badge,
  // 🎨 BRAND CUSTOMIZATION: Health metrics array - customize for your system
  metrics,
  // 🎨 BRAND CUSTOMIZATION: Additional styling classes
  className,
}: HealthDashboardProps) {
  // 🎨 API DATA HOOK: Use centralized venues data hook
  const { data: venuesData, loading: isLoading, error, refetch, lastRefresh } = useOptimizedVenuesData();
  const [realMetrics, setRealMetrics] = useState<HealthMetric[] | null>(null);

  // 🎨 FALLBACK METRICS: Obviously rounded values to identify when API is not working
  const fallbackMetrics: HealthMetric[] = [
    {
      label: "Total Venues",
      value: "1,000", // Rounded to 1000
      icon: <MapPin className="w-5 h-5" />,
      status: "warning" as const,
      description: "fallback data",
      trend: "API Error"
    },
    {
      label: "Active Venues", 
      value: "1,000", // Rounded to 1000
      icon: <CheckCircle className="w-5 h-5" />,
      status: "warning" as const,
      description: "fallback data",
      trend: "API Error"
    },
    {
      label: "Regions",
      value: "10", // Rounded to 10
      icon: <Globe className="w-5 h-5" />,
      status: "warning" as const,
      description: "fallback data"
    },
    {
      label: "Data Accuracy",
      value: "100%", // Rounded to 100%
      icon: <BarChart3 className="w-5 h-5" />,
      status: "warning" as const,
      description: "fallback data",
      trend: "API Error"
    },
    {
      label: "System Status",
      value: "Unknown",
      icon: <Monitor className="w-5 h-5" />,
      status: "critical" as const,
      description: "API offline"
    }
  ];

  // 🎨 CURRENT METRICS: Use real API data, prop metrics, or fallback
  const currentMetrics = realMetrics || (Array.isArray(metrics) ? metrics : fallbackMetrics);
  
  // 🎨 LOADING STATE: Show loading metrics when first loading
  const loadingMetrics: HealthMetric[] = [
    {
      label: "Total Venues",
      value: "Loading...",
      icon: <MapPin className="w-5 h-5" />,
      status: "healthy" as const,
      description: "fetching data",
      trend: "⏳"
    },
    {
      label: "Active Venues", 
      value: "Loading...",
      icon: <CheckCircle className="w-5 h-5" />,
      status: "healthy" as const,
      description: "fetching data",
      trend: "⏳"
    },
    {
      label: "Regions",
      value: "Loading...",
      icon: <Globe className="w-5 h-5" />,
      status: "healthy" as const,
      description: "fetching data"
    },
    {
      label: "Data Accuracy",
      value: "Loading...",
      icon: <BarChart3 className="w-5 h-5" />,
      status: "healthy" as const,
      description: "fetching data",
      trend: "⏳"
    },
    {
      label: "System Status",
      value: "Loading...",
      icon: <Monitor className="w-5 h-5" />,
      status: "healthy" as const,
      description: "fetching data"
    }
  ];
  
  // 🎨 DETERMINE WHICH METRICS TO SHOW
  const displayMetrics = isLoading && !realMetrics ? loadingMetrics : currentMetrics;

  // 🎨 DYNAMIC TITLE ROTATION: Rotate through key metrics every 5 seconds
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const dynamicTitles = [
    `System monitoring ${displayMetrics[0]?.value || "Loading..."} active venues across ${displayMetrics[2]?.value || "Loading..."} regions`,
    `Data accuracy at ${displayMetrics[3]?.value || "Loading..."} with real-time sync active`,
    `${displayMetrics[2]?.value || "Loading..."} regions scanned with ${displayMetrics[0]?.value || "Loading..."} venues cached`,
    `System ${displayMetrics[4]?.value?.toLowerCase() || "loading"} with ${displayMetrics[3]?.value || "Loading..."} data accuracy`
  ];

  // 🎨 DATA PROCESSING: Transform API data to metrics format
  useEffect(() => {
    if (venuesData?.summary) {
      const summary = venuesData.summary;
      const transformedMetrics: HealthMetric[] = [
        {
          label: "Total Venues",
          value: summary.realTimeVenues?.toString() || "1,000",
          icon: <MapPin className="w-5 h-5" />,
          status: "healthy" as const,
          description: "in system",
          trend: "Live"
        },
        {
          label: "Active Venues", 
          value: summary.scheduledVenues?.toString() || "1,000",
          icon: <CheckCircle className="w-5 h-5" />,
          status: "healthy" as const,
          description: "cached",
          trend: summary.venueDifference === 0 ? "Synced" : `Diff: ${summary.venueDifference}`
        },
        {
          label: "Regions",
          value: summary.totalRegions?.toString() || "10",
          icon: <Globe className="w-5 h-5" />,
          status: "healthy" as const,
          description: "scanned"
        },
        {
          label: "Data Accuracy",
          value: summary.accuracyPercentage || "100%",
          icon: <BarChart3 className="w-5 h-5" />,
          status: summary.healthStatus === "excellent" ? "healthy" : "warning" as const,
          description: "score",
          trend: summary.dataStaleness.includes("day") ? summary.dataStaleness : "Fresh"
        },
        {
          label: "System Status",
          value: summary.healthStatus === "excellent" ? "Operational" : "Warning",
          icon: <Monitor className="w-5 h-5" />,
          status: summary.healthStatus === "excellent" ? "healthy" : "warning" as const,
          description: "all systems"
        }
      ];
      
      setRealMetrics(transformedMetrics);
      console.log('Transformed metrics:', transformedMetrics);
    }
  }, [venuesData]);

  // 🎨 MANUAL REFRESH HANDLER
  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prev) => (prev + 1) % dynamicTitles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [dynamicTitles.length]);

  // 🎨 DATA FRESHNESS LOGIC: Calculate time since last refresh
  const getFreshnessBadge = () => {
    if (!lastRefresh) return null;
    
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours < 1) {
      return {
        variant: "default" as const,
        text: `Updated ${diffMinutes} minutes ago`,
        className: "bg-primary text-primary-foreground"
      };
    } else if (diffHours <= 72) { // 0-3 days
      return {
        variant: "default" as const,
        text: `Updated ${diffHours} hours ago`,
        className: "bg-primary text-primary-foreground"
      };
    } else if (diffHours <= 168) { // 3-7 days
      return {
        variant: "outline" as const,
        text: `Data ${Math.floor(diffHours / 24)} days old`,
        className: "border-accent text-accent bg-accent/10"
      };
    } else { // 7+ days
      return {
        variant: "destructive" as const,
        text: `Data ${Math.floor(diffHours / 24)} days old`,
        className: "bg-destructive text-destructive-foreground"
      };
    }
  };

  const freshnessBadge = getFreshnessBadge();

  // 🎨 STATUS COLOR MAPPING: Map status to brand colors
  const getStatusColor = (status: "healthy" | "warning" | "critical") => {
    switch (status) {
      case "healthy":
        return "text-primary border-primary/20 bg-primary/5";
      case "warning":
        return "text-accent border-accent/20 bg-accent/5";
      case "critical":
        return "text-destructive border-destructive/20 bg-destructive/5";
      default:
        return "text-primary border-primary/20 bg-primary/5";
    }
  };

  return (
    <Section 
      className={cn(
        "bg-background text-foreground", // 🎨 BRAND CUSTOMIZATION: Default background with normal text
        className
      )}
    >
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {/* 🎨 BRAND CUSTOMIZATION: Data freshness badge with color coding */}
          {badge !== false && (
            <div className="flex items-center gap-3">
              {freshnessBadge && (
                <Badge 
                  variant={freshnessBadge.variant}
                  className={freshnessBadge.className}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {freshnessBadge.text}
                </Badge>
              )}
              
              {/* 🎨 BRAND CUSTOMIZATION: Manual refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          )}
          
          {/* 🎨 BRAND CUSTOMIZATION: Dynamic rotating title */}
          <h2 className="text-md font-semibold sm:text-2xl animate-fade-in">
            {isLoading && !realMetrics ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading system data...
              </span>
            ) : (
              title || dynamicTitles[currentTitleIndex]
            )}
          </h2>
          
          {/* 🎨 BRAND CUSTOMIZATION: Error display */}
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
              ⚠️ API Error: {error}
            </div>
          )}
        </div>
        
        {/* 🎨 BRAND CUSTOMIZATION: Health metrics grid */}
        {displayMetrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
            {displayMetrics.map((metric, index) => (
              <Card 
                key={index}
                className={cn(
                  "border-2 transition-all duration-300 hover:scale-105",
                  getStatusColor(metric.status)
                )}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    {/* 🎨 BRAND CUSTOMIZATION: Metric icon */}
                    <div className="p-2 rounded-full bg-background/10">
                      {metric.icon}
                    </div>
                    
                    {/* 🎨 BRAND CUSTOMIZATION: Metric value */}
                    <div className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </div>
                    
                    {/* 🎨 BRAND CUSTOMIZATION: Metric label */}
                    <div className="text-sm font-medium text-foreground/80">
                      {metric.label}
                    </div>
                    
                    {/* 🎨 BRAND CUSTOMIZATION: Metric description and trend */}
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      {metric.description && (
                        <span>{metric.description}</span>
                      )}
                      {metric.trend && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{metric.trend}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}