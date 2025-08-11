// public/sw.js
// Advanced service worker for native-like experience

// Import Workbox - a library that makes service worker implementation easier
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Use the workbox object
const { registerRoute, NavigationRoute } = workbox.routing;
const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;
const { precacheAndRoute, cleanupOutdatedCaches } = workbox.precaching;
const { setCacheNameDetails } = workbox.core;

// Set custom cache names for better organization
setCacheNameDetails({
  prefix: 'rmcsongs',
  suffix: 'v1',
  precache: 'precache',
  runtime: 'runtime',
  googleAnalytics: 'ga'
});

// Clean up outdated caches
cleanupOutdatedCaches();

// Precache essential static assets
// In a real implementation, the __WB_MANIFEST would be replaced with a list of URLs
// by the workbox-webpack-plugin during build
precacheAndRoute(self.__WB_MANIFEST || [
  { url: '/', revision: '1' },
  { url: '/offline', revision: '1' },
  { url: '/manifest.json', revision: '1' },
  { url: '/icons/android/android-icon-192x192.png', revision: '1' },
  // Add more critical assets here
]);

// Default page caching strategy
const pageStrategy = new NetworkFirst({
  cacheName: 'rmcsongs-pages',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      purgeOnQuotaError: true
    })
  ]
});

// Assets caching strategy (CSS, JS)
const assetsStrategy = new StaleWhileRevalidate({
  cacheName: 'rmcsongs-assets',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      purgeOnQuotaError: true
    })
  ]
});

// Images caching strategy
const imagesStrategy = new CacheFirst({
  cacheName: 'rmcsongs-images',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      purgeOnQuotaError: true
    })
  ]
});

// API caching strategy
const apiStrategy = new NetworkFirst({
  cacheName: 'rmcsongs-api',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutes
      purgeOnQuotaError: true
    })
  ]
});

// YouTube API/content caching strategy
const youtubeStrategy = new StaleWhileRevalidate({
  cacheName: 'rmcsongs-youtube',
  plugins: [
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      purgeOnQuotaError: true
    })
  ]
});

// Register route for page navigations
registerRoute(
  ({ request }) => request.mode === 'navigate',
  pageStrategy
);

// Register route for CSS, JS, Web Worker
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'worker',
  assetsStrategy
);

// Register route for images
registerRoute(
  ({ request }) => request.destination === 'image',
  imagesStrategy
);

// Register route for YouTube content
registerRoute(
  ({ url }) => url.origin.includes('ytimg.com') || url.origin.includes('youtube.com'),
  youtubeStrategy
);

// Register route for Supabase API
registerRoute(
  ({ url }) => url.origin.includes('supabase.co'),
  apiStrategy
);

// Background sync for offline actions
// This allows the app to queue actions like votes and suggestions when offline
// and sync them when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-songs') {
    event.waitUntil(syncOfflineActions());
  }
});

// Function to sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Attempt to get the offline actions from cache
    const cache = await caches.open('rmcsongs-offline-data');
    const response = await cache.match('offline-actions');
    
    if (!response) return;
    
    const offlineActions = await response.json();
    
    if (!offlineActions || offlineActions.length === 0) return;
    
    // Create an array to track successful syncs
    const successfulSyncs = [];
    
    // Process each action
    for (const action of offlineActions) {
      try {
        // Determine endpoint and payload based on action type
        let endpoint = '';
        let method = 'POST';
        let body = {};
        
        switch (action.type) {
          case 'ADD_SONG':
            endpoint = '/api/songs';
            body = {
              title: action.data.title,
              artist: action.data.artist,
              notes: action.data.notes,
              youtube_video_id: action.data.youtubeVideoId,
              youtube_title: action.data.youtubeTitle,
              suggested_by: action.data.userId
            };
            break;
            
          case 'VOTE':
            endpoint = '/api/votes';
            body = {
              song_id: action.data.songId,
              user_id: action.data.userId
            };
            break;
            
          default:
            console.warn(`Unknown action type: ${action.type}`);
            continue;
        }
        
        // Attempt to perform the action
        const syncResponse = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
        
        if (syncResponse.ok) {
          // Mark action as synced
          successfulSyncs.push(action.id);
        } else {
          console.error(`Failed to sync action ${action.id}: ${syncResponse.status}`);
        }
      } catch (err) {
        console.error(`Error processing action ${action.id}:`, err);
      }
    }
    
    // Remove successful syncs from the offline actions
    if (successfulSyncs.length > 0) {
      const updatedOfflineActions = offlineActions.filter(
        action => !successfulSyncs.includes(action.id)
      );
      
      // Update the cache with remaining actions
      await cache.put(
        'offline-actions',
        new Response(JSON.stringify(updatedOfflineActions), {
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      // Notify clients about the successful syncs
      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          syncedCount: successfulSyncs.length,
          pendingCount: updatedOfflineActions.length
        });
      }
    }
  } catch (err) {
    console.error('Sync failed:', err);
  }
}

// Custom offline fallback
// When a navigation request fails, show the offline page
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try the network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If network fails, return the cached offline page
          const cache = await caches.open('rmcsongs-pages');
          const cachedResponse = await cache.match('/offline');
          return cachedResponse || new Response('You are offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
      })()
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update in RMC Song Wishlist',
      icon: '/icons/android/android-icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: data.actions || [
        {
          action: 'open',
          title: 'Open'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'RMC Song Wishlist', 
        options
      )
    );
  } catch (err) {
    console.error('Push notification error:', err);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // If we have a client, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handling app installation
self.addEventListener('install', (event) => {
  // Skip waiting, forcing the service worker to become active
  // even if there's an older version running
  self.skipWaiting();
  
  // Pre-cache the offline page and other critical assets
  event.waitUntil(
    caches.open('rmcsongs-pages').then((cache) => {
      return cache.addAll([
        '/offline',
        '/icons/android/android-icon-192x192.png',
        '/icons/favicon/favicon.ico'
      ]);
    })
  );
});

// Claim clients when the service worker activates
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
