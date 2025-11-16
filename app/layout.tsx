import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'  // ← CRITICAL: Make sure this exists

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flex Living Reviews Dashboard',
  description: 'Manage and analyze property reviews across multiple channels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}