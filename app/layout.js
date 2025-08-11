export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Basic meta tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#312e81" media="(prefers-color-scheme: dark)" />
        <meta name="description" content="RMC Song Wishlist - Suggest, vote, and discover songs for the choir" />

        {/* iOS-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RMC Songs" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* iOS icon links */}
        <link rel="apple-touch-icon" href="/icons/ios/apple-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/apple-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/ios/apple-icon-167x167.png" />

        {/* Add the iOS splash screens and other meta tags from the provided configuration */}
        <!-- These meta tags should be added to your app/layout.js head section -->

      <!-- iOS-specific meta tags -->
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="RMC Songs" />
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      <!-- iOS icon links -->
      <link rel="apple-touch-icon" href="/icons/ios/apple-icon-180x180.png" />
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/ios/apple-icon-152x152.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/ios/apple-icon-180x180.png" />
      <link rel="apple-touch-icon" sizes="167x167" href="/icons/ios/apple-icon-167x167.png" />
      
      <!-- iOS splash screens -->
      <!-- iPhone Xs Max, XR -->
      <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/splash/apple-splash-1242-2688.png" />
      <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-828-1792.png" />
      <!-- iPhone X, Xs -->
      <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/splash/apple-splash-1125-2436.png" />
      <!-- iPhone 8 Plus, 7 Plus, 6s Plus, 6 Plus -->
      <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" href="/splash/apple-splash-1242-2208.png" />
      <!-- iPhone 8, 7, 6s, 6 -->
      <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-750-1334.png" />
      <!-- iPad Pro 12.9" -->
      <link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-2048-2732.png" />
      <!-- iPad Pro 11" -->
      <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-1668-2388.png" />
      <!-- iPad Pro 10.5" -->
      <link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-1668-2224.png" />
      <!-- iPad Mini, Air -->
      <link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" href="/splash/apple-splash-1536-2048.png" />
      
      <!-- Dark mode splash screens for iOS 13+ -->
      <link rel="apple-touch-startup-image" media="(prefers-color-scheme: dark) and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/splash/apple-splash-dark/apple-splash-1242-2688.png" />
      <!-- Additional dark mode splash screens... -->

<!-- Standard web app manifest -->
<link rel="manifest" href="/manifest.json" />

<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon/favicon-16x16.png" />
<link rel="shortcut icon" href="/icons/favicon/favicon.ico" />

<!-- Microsoft Tiles -->
<meta name="msapplication-config" content="/browserconfig.xml" />
<meta name="msapplication-TileColor" content="#4f46e5" />
<meta name="msapplication-TileImage" content="/icons/windows/ms-icon-144x144.png" />
        {/* Standard web app manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon/favicon-16x16.png" />
        <link rel="shortcut icon" href="/icons/favicon/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
