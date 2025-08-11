// Add a version timestamp to bust cache
const iconVersion = `?v=${Date.now()}`;

export const metadata = {
  title: 'RMC Song Wishlist',
  description: 'Share, vote, and discover new songs for RMC Choir',
  keywords: ['RMC', 'choir', 'songs', 'music', 'wishlist', 'voting'],
  authors: [{ name: 'RMC Choir' }],
  creator: 'RMC Choir',
  publisher: 'RMC Choir',
  
  // Favicon and Icon Configuration with cache busting
  icons: {
    icon: [
      { url: `/favicon.ico${iconVersion}`, sizes: 'any' },
      { url: `/icons/icon-72x72.png${iconVersion}`, sizes: '72x72', type: 'image/png' },
      { url: `/icons/icon-96x96.png${iconVersion}`, sizes: '96x96', type: 'image/png' },
      { url: `/icons/icon-128x128.png${iconVersion}`, sizes: '128x128', type: 'image/png' }
    ],
    apple: [
      { url: `/icons/icon-152x152.png${iconVersion}`, sizes: '152x152', type: 'image/png' }
    ],
    other: [
      { url: `/icons/icon-144x144.png${iconVersion}`, sizes: '144x144', type: 'image/png' },
      { url: `/icons/icon-192x192.png${iconVersion}`, sizes: '192x192', type: 'image/png' },
      { url: `/icons/icon-512x512.png${iconVersion}`, sizes: '512x512', type: 'image/png' }
    ]
  },
  
  // PWA Configuration
  manifest: `/manifest.json${iconVersion}`,
  
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
    url: 'https://your-domain.com',
    siteName: 'RMC Song Wishlist',
    title: 'RMC Song Wishlist',
    description: 'Share, vote, and discover new songs for RMC Choir',
    images: [
      {
        url: `/icons/icon-512x512.png${iconVersion}`,
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
    images: [`/icons/icon-512x512.png${iconVersion}`]
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
    'msapplication-TileImage': `/icons/icon-144x144.png${iconVersion}`
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Additional manual meta tags for PWA */}
        <meta name="application-name" content="RMC Songs" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RMC Songs" />
        
        {/* Force fresh icon loading */}
        <link rel="icon" href={`/favicon.ico${iconVersion}`} sizes="any" />
        <link rel="apple-touch-icon" href={`/icons/icon-152x152.png${iconVersion}`} />
        <link rel="manifest" href={`/manifest.json${iconVersion}`} />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
