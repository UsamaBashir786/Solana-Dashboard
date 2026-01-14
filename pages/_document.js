import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Fixed favicon path */}
        <link rel="icon" href="/Solana-Logomark-Color.svg" type="image/svg+xml" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#9945FF" />
        <meta name="msapplication-TileColor" content="#9945FF" />
        
        {/* NO manifest reference to avoid 404 errors */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}