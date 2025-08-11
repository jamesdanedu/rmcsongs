export const metadata = {
  title: 'RMC Song Wishlist',
  description: 'Share, vote, and discover new songs for RMC Choir',
  keywords: ['RMC', 'choir', 'songs', 'music', 'wishlist', 'voting'],
  authors: [{ name: 'RMC Choir' }],
  creator: 'RMC Choir',
  publisher: 'RMC Choir',
  
  // Favicon and Icon Configuration (no cache busting for core files)
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' }
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }
    ],
    other: [
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  
  // PWA Configuration - NO cache busting on manifest
  manifest: '/manifest.json',
  
  // Theme and App Configuration
  themeColor: '#4f46e5',
  colorScheme: 'light',
  
  // Mobile App Configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RMC Songs'
  },
  
  // Open Graph (Social Media Sharing)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rmcsongs-git-pwa-web-app-james-osullivans-projects.vercel.app',
    siteName: 'RMC Song Wishlist',
    title: 'RMC Song Wishlist',
    description: 'Share, vote, and discover new songs for RMC Choir',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'RMC Song Wishlist Logo'
      }
    ]
  },
  
  // Twitter Card Configuration
  twitter: {
    card: 'summary',
    title: 'RMC Song Wishlist',
    description: 'Share, vote, and discover new songs for RMC Choir',
    images: ['/icons/icon-512x512.png']
  },
  
  // Viewport Configuration
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  },
  
  // Additional Meta Tags
  other: {
    'msapplication-TileColor': '#4f46e5',
    'msapplication-TileImage': '/icons/icon-144x144.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="RMC Songs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RMC Songs" />
        
        {/* Manual icon links for better compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
