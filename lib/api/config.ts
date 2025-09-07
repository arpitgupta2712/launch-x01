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
    venues: '/api/hudle/global/data-health',
    company1: '/api/hudle/users/search/phone/9999099867?includes=business_profile',
    company2: '/api/hudle/users/search/phone/9910545678?includes=business_profile',
    signIn: '/api/hudle/reports/email',
    processReports: '/api/hudle/reports/process',
    uploadBookingFile: '/api/storage/bookings/upload',
    listBookingFiles: '/api/storage/bookings/files',
    listValidBookingFiles: '/api/storage/bookings/files/valid',
    deleteBookingFile: '/api/storage/bookings/files',
    deleteAllBookingFiles: '/api/storage/bookings/files'
  },
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  corsMode: 'cors' as RequestMode,
  defaultRefreshInterval: 300000, // 5 minutes
  // Loading priorities (1 = highest priority)
  priorities: {
    stats: 1,     // Admin stats for main dashboard (appears first)
    venues: 2,    // Venues data (appears second)
    companies: 3, // Company info (FAQ, Footer appear third)
    health: 4,    // Database health last (appears last)
    processReports: 5, // Report processing operations
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
