// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add any other Next.js config options here
};

// Configure PWA options
const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Advanced options
  dynamicStartUrl: true, // Use the initial URL as the start_url in manifest
  buildExcludes: [/middleware-manifest\.json$/], // Exclude middleware manifest
  fallbacks: {
    // Configure fallback pages
    document: '/offline', // Fallback HTML document when offline
    image: '/images/offline-image.png', // Fallback image when offline
  },
  publicExcludes: [
    // Files in public to exclude from precaching
    '!robots.txt',
    '!sitemap.xml',
  ],
  cacheOnFrontEndNav: true, // Cache on front-end navigation
  extendDefaultRuntimeCaching: true, // Extend default runtime caching
  workboxOptions: {
    // Custom workbox options
    runtimeCaching: [
      {
        // Cache Google Fonts stylesheets
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'google-fonts-stylesheets',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      {
        // Cache YouTube thumbnails
        urlPattern: /^https:\/\/i\.ytimg\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'youtube-thumbnails',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        // Cache Supabase API responses
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
})(nextConfig);

export default pwaConfig;
