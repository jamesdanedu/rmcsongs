// utils/serviceWorker.js
// Service worker registration and management

/**
 * Register the service worker
 * @returns {Promise<ServiceWorkerRegistration|null>} The service worker registration or null
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }

  try {
    // Wait for the page to load
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration.scope);

    // Check for updates on page load
    await registration.update();

    // Set up periodic updates (every hour)
    setInterval(() => {
      registration.update().catch(err => {
        console.error('Service Worker update failed:', err);
      });
    }, 60 * 60 * 1000);

    // Set up event listeners for service worker lifecycle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
    });

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log(`Sync completed: ${event.data.syncedCount} items synced, ${event.data.pendingCount} items pending`);
        
        // Dispatch a custom event that components can listen for
        window.dispatchEvent(new CustomEvent('sw-sync-complete', { 
          detail: {
            syncedCount: event.data.syncedCount,
            pendingCount: event.data.pendingCount
          }
        }));
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister all service workers and clear caches
 * @returns {Promise<boolean>} Whether the unregistration was successful
 */
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
    }
    
    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    console.log('Service Workers unregistered and caches cleared');
    return true;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

/**
 * Request a background sync
 * @param {string} tag - The sync tag to identify the sync operation
 * @returns {Promise<boolean>} Whether the sync was successfully registered
 */
export async function requestBackgroundSync(tag = 'sync-songs') {
  if (typeof window === 'undefined' || 
      !('serviceWorker' in navigator) || 
      !('SyncManager' in window)) {
    console.warn('Background Sync is not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    console.log(`Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

/**
 * Check if Push API is supported and permission is granted
 * @returns {Promise<boolean>} Whether push notifications are supported and enabled
 */
export async function arePushNotificationsEnabled() {
  if (typeof window === 'undefined' || 
      !('serviceWorker' in navigator) || 
      !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const permission = Notification.permission;
    
    return !!subscription && permission === 'granted';
  } catch (error) {
    console.error('Push notification check failed:', error);
    return false;
  }
}

/**
 * Request permission for push notifications
 * @returns {Promise<string>} The notification permission status
 */
export async function requestPushPermission() {
  if (typeof window === 'undefined' || 
      !('serviceWorker' in navigator) || 
      !('PushManager' in window)) {
    console.warn('Push API is not supported in this browser');
    return 'unsupported';
  }

  // Check if permission was previously denied
  if (Notification.permission === 'denied') {
    console.warn('Push notifications were previously denied');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'error';
  }
}

/**
 * Subscribe to push notifications
 * @param {string} vapidPublicKey - The VAPID public key for push notifications
 * @returns {Promise<PushSubscription|null>} The push subscription or null
 */
export async function subscribeToPushNotifications(vapidPublicKey) {
  if (typeof window === 'undefined' || 
      !('serviceWorker' in navigator) || 
      !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Convert the VAPID key to the format required by the browser
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    // Send the subscription to your server
    // await sendSubscriptionToServer(subscription);
    
    console.log('Push notification subscription successful');
    return subscription;
  } catch (error) {
    console.error('Push notification subscription failed:', error);
    return null;
  }
}

/**
 * Helper function to convert a base64 string to Uint8Array
 * @param {string} base64String - The base64 string to convert
 * @returns {Uint8Array} The converted Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if the PWA is installed
 * @returns {boolean} Whether the PWA is installed
 */
export function isPWAInstalled() {
  if (typeof window === 'undefined') return false;
  
  // Check if the app is in standalone mode or display-mode is standalone
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

/**
 * Listen for service worker updates and prompt the user to refresh
 * @param {Function} onUpdateAvailable - Callback when an update is available
 * @returns {Function} Cleanup function to remove event listeners
 */
export function listenForServiceWorkerUpdates(onUpdateAvailable) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }

  const updateHandler = () => {
    if (typeof onUpdateAvailable === 'function') {
      onUpdateAvailable();
    }
  };

  // Listen for the controllerchange event
  navigator.serviceWorker.addEventListener('controllerchange', updateHandler);

  // Return a cleanup function
  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', updateHandler);
  };
}
