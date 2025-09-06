/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow cross-origin requests from network devices during development
  allowedDevOrigins: [
    '192.168.68.102', // Network IP for local development
    'localhost',
    '127.0.0.1'
  ]
};

export default nextConfig;
