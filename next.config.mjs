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
  },
  poweredByHeader: false,
  reactStrictMode: true,
}

export default nextConfig
