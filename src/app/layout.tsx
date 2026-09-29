import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { siteConfig } from '@/config/site'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
  display: 'swap',
})

/**
 * `metadataBase` is what makes Next resolve relative OG/canonical URLs into
 * absolute ones. It was previously missing, which produced a build warning and
 * social cards with no host.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.descriptor}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'portfolio',
    'web development',
    'software projects',
    'networking',
    'experiments',
    'creative coding',
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.description,
    // `metadataBase` turns this into an absolute URL, which social scrapers
    // require. Without it a shared link renders as a card with no image.
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.descriptor}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.descriptor}`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  /*
   * Declared here rather than relying on the `app/icon.svg` file convention
   * alone. The file gives the scalable SVG, but browsers that ask for
   * `/favicon.ico` directly — and some do, from bookmarks and history — would
   * otherwise 404 now that the legacy file is gone. The shortcut is a small
   * standalone `.ico` in `public` that needs no build step.
   */
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.ico'],
    // A real PNG, not the SVG: iOS does not render SVG for apple-touch-icon and
    // silently falls back to a screenshot of the page.
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  // Matches `--bg` (9 9 15) in globals.css. It used to be #0E0D12, which the
  // browser chrome rendered a shade off from the page it surrounded. And it was
  // #08090D before that. The token file is the only authority that has held.
  themeColor: '#09090F',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] antialiased">
        {/*
          Server-rendered children only. Public navigation and footer live in
          the (public) route group so they can never appear behind /admin.
        */}
        {children}
      </body>
    </html>
  )
}
