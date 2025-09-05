/**
 * 🎨 API CONFIGURATION
 * 
 * Centralized configuration for all API endpoints and settings.
 * This provides a single source of truth for API URLs and configuration.
 */

export const API_CONFIG = {
  baseUrl: 'https://claygrounds-6d703322b3bc.herokuapp.com',
  endpoints: {
    stats: '/api/hudle/admins/status',
    health: '/api/db/health',
    venues: '/api/hudle/global/data-health'
  },
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  corsMode: 'cors' as RequestMode,
  defaultRefreshInterval: 30000, // 30 seconds
} as const;

export type ApiConfig = typeof API_CONFIG;
