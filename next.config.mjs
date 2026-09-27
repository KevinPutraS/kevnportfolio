/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Project thumbnails are either bundled local files or objects in the
     * Supabase Storage `portfolio-images` bucket. `**` is the hostname wildcard
     * syntax Next.js expects; a bare `*.supabase.co` is rejected.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Uploaded files are validated to a raster allowlist, but SVG is still
    // refused so a crafted upload can never be served as a document.
    dangerouslyAllowSVG: false,

    /*
     * Sharpness.
     *
     * `deviceSizes` is the part that actually decides perceived resolution.
     * Without it the optimiser picks from a coarse set, and a card 320 CSS px
     * wide on a 2x display can be served a 640px file — or, on a wide desktop
     * card, a 750px file stretched across 600px of layout, which is what reads
     * as "low resolution". The set below gives the optimiser a candidate near
     * every width the grid can produce, so it stops guessing.
     *
     * Note: encoder `quality` is *not* set here. In Next 14 it is a per-image
     * prop and belongs on the component, where it sits next to the `sizes`
     * hint that determines which file is requested. The components pass
     * `quality={90}`; the default of 75 is tuned for file size and leaves
     * screenshots visibly soft on a high-DPI screen.
     */
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920, 2048, 2560, 3200],
    imageSizes: [64, 96, 128, 200, 256, 384],
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
