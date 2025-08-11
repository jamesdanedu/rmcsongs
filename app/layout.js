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
