import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SimpleAnalytics from './SimpleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Content Repurposing Engine | Dashboard',
  description: 'Transform your blog posts into optimized social media content automatically',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SimpleAnalytics id={process.env.NEXT_PUBLIC_ANALYTICS_ID || ''} />
      </body>
    </html>
  )
}