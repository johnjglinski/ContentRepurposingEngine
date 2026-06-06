import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SimpleAnalytics from './SimpleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'J3C Family Studio - AI-Powered Tools for Creators & Professionals',
  description: 'AI-powered tools for content creators and professionals. Content repurposing, digital product store, and resume scanning SaaS.',
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