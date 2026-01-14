import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon - MATCH YOUR ACTUAL FILENAME */}
        <link rel="icon" href="/Solana-Logomark-Color.svg" type="image/svg+xml" />
        
        {/* If your file still has spaces, use URL encoding: */}
        {/* <link rel="icon" href="/Solana%20Logomark%20-%20Color.svg" type="image/svg+xml" /> */}
        
        <meta name="theme-color" content="#9945FF" />
        <meta name="msapplication-TileColor" content="#9945FF" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}