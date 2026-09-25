import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Kevin Portfolio | Building Things. Exploring Ideas.',
    template: '%s | Kevin Portfolio',
  },
  description: 'Building things. Exploring ideas. Creating digital projects. A portfolio of web applications, experiments, and creative coding explorations.',
  keywords: ['portfolio', 'web development', 'software', 'experiments', 'creative coding', 'projects'],
  authors: [{ name: 'Kevin' }],
  creator: 'Kevin',
  publisher: 'Kevin Portfolio',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kevnportfolio.dev',
    siteName: 'Kevin Portfolio',
    title: 'Kevin Portfolio | Building Things. Exploring Ideas.',
    description: 'Building things. Exploring ideas. Creating digital projects.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kevin Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kevin Portfolio | Building Things. Exploring Ideas.',
    description: 'Building things. Exploring ideas. Creating digital projects.',
    images: ['/images/og-image.png'],
  },
  verification: {
    google: '',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#08090D' },
    { media: '(prefers-color-scheme: dark)', color: '#08090D' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}