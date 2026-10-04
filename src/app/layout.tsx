import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { siteConfig } from '@/config/site'
import { buildPersonSchema } from '@/lib/structured-data'
import '@/styles/globals.css'

/*
 * Two faces, both self-hosted through `next/font`, both variable.
 *
 * The redesign dropped the third face. There used to be Inter for body, Space
 * Grotesk for display and a system mono stack — three families, so the display
 * voice was a third design idea competing with two others, and the grotesk's
 * wide apertures and single-storey `a` were carrying "display" on their own
 * against a grotesque body. Two faces let the *scale* do that work: `--font-display`
 * is now Geist Sans at a heavier weight and tighter tracking, so hierarchy comes
 * from size and spacing rather than from a change of alphabet.
 *
 * `geist/font/*` rather than `next/font/google`: these ship as woff2 in the
 * package, so there is no build-time fetch from Google's CDN. That matters for a
 * portfolio whose whole argument is that it is fast, and it removes the one part
 * of the build that fails without a network.
 *
 * The variable names must match the ones `globals.css` composes in `--font-sans`,
 * `--font-display` and `--font-mono`. They did not, for a while: the tokens
 * referenced `--font-geist-sans`/`--font-geist-mono` while this file still loaded
 * Inter and Space Grotesk, so both custom properties resolved to nothing and the
 * entire site silently fell back to `system-ui`. Nothing failed — an undefined
 * `var()` inside a font stack is not an error, it is just absent — which is why
 * it survived as long as it did. `font-sans`, `font-display`, `font-mono` and
 * every `.meta`/`.eyebrow`/`.caption` class all route through these three
 * tokens, so this file is the only place the names are written.
 *
 * Note the import is of a value, not a factory: `geist/font/sans` ships
 * `GeistSans` already constructed, so there is no `subsets` or `display` option
 * to pass. It is `next/font` under the hood, which is what makes the woff2
 * self-hosted and the swap behaviour automatic.
 */
const geistSans = GeistSans
const geistMono = GeistMono

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
  // The canvas. `globals.css` declares the same fact as `color-scheme: dark` on
  // `:root`; this copy is the one the browser reads *before* the document exists,
  // which is what colours the address bar and the overscroll area on a first
  // paint. It used to be a single #0E0D12 and then #08090D, both a shade off from
  // the page they surrounded.
  themeColor: '#09090F',
  // A single value, not `dark light`. There is one theme, so the UA is told the
  // answer outright: scrollbars, form controls, the caret and the default canvas
  // are all rendered dark, and no rule in this stylesheet has to be repeated for
  // the other case.
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] antialiased">
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
