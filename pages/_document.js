import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Primary favicon - will be overridden by index.js if needed */}
        <link rel="icon" href="/Solana%20Logomark%20-%20Color.svg" type="image/svg+xml" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#9945FF" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}