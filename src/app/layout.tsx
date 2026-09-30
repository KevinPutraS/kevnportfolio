import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { siteConfig } from '@/config/site'
import { buildPersonSchema } from '@/lib/structured-data'
import { THEME_SCRIPT } from '@/lib/theme'
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
  // Two entries keyed on the system preference, matching `--bg` in globals.css.
  // It used to be a single #0E0D12, which the browser chrome rendered a shade off
  // from the page it surrounded, and #08090D before that.
  //
  // What this cannot express is the *explicit* override: `themeColor` is read by
  // the browser before the document exists, so a visitor who picked light while
  // their system is dark keeps a dark address bar. That is a platform limit, not
  // an oversight here, and the page itself is correct in both themes. The
  // alternative — leaving it dark always — was wrong for everyone whose system is
  // light, which is the larger group.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAFB' },
    { media: '(prefers-color-scheme: dark)', color: '#09090F' },
  ],
  // Both schemes declared, not `dark`. A single value tells the UA to render
  // scrollbars, form controls and the caret dark unconditionally, which is the
  // same fixed-answer mistake the theme itself existed to remove. CSS narrows it
  // per theme through the `color-scheme` property, which a meta tag cannot do.
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] antialiased">
        {/*
          Theme, resolved before anything paints.

          First child of `<body>` on purpose. React streams the document, so this
          is the earliest point at which a script can run: the `<html>` element
          already exists, and no page content has been parsed or painted. Setting
          `data-theme` here puts the right palette in force for the first frame.
          Moving it into an effect after hydration would flash the dark palette at
          a visitor who chose light, on every fresh document.

          Self-contained because it runs before any module is loaded — it cannot
          import `resolveTheme` from `./theme`, which is why that function exists
          as a separate copy the tests hold both to the same answer.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/*
          Server-rendered children only. Public navigation and footer live in
          the (public) route group so they can never appear behind /admin.
        */}
        {children}

        {/*
          schema.org `Person`, the one piece of markup on the page a machine
          reads. It is a script tag in the body rather than in `<head>` because
          React hoists it on its own — Next documents that a
          `application/ld+json` script can be rendered anywhere in the tree and
          still lands in the head, so putting it here keeps it next to the data
          it is derived from instead of stranded at the top of the file.

          `JSON.stringify` and not a hand-built string: the contents come from
          `siteConfig`, and a name or a URL with a quote or a backslash in it
          would otherwise produce a script tag the browser refuses to parse,
          silently dropping every property after the break. The `<` escape
          prevents a value containing `</script>` from closing the tag early.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildPersonSchema()).replace(/</g, '\\u003c'),
          }}
        />
      </body>
    </html>
  )
}
