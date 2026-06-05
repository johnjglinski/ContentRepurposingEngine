'use client'

import Script from 'next/script'

interface SimpleAnalyticsProps {
  id: string
}

export default function SimpleAnalytics({ id }: SimpleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://scripts.simpleanalytics.com/analytics.js`}
        strategy="afterInteractive"
      />
      <Script
        id="simple-analytics-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.sa = window.sa || function() { (window.sa.q = window.sa.q || []).push(arguments) };
            sa('event', 'page_view');
          `,
        }}
      />
    </>
  )
}