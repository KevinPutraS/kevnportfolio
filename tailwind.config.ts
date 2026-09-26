import type { Config } from 'tailwindcss'

/**
 * Colours are driven by the CSS custom properties defined in
 * `src/styles/globals.css`, so there is exactly one place to change a token.
 * The font families reference the composed vars (which in turn reference the
 * `next/font` variables), never the raw `--font-*` names from next/font.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/config/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background))',
        surface: 'rgb(var(--surface))',
        'surface-elevated': 'rgb(var(--surface-elevated))',
        border: 'rgb(var(--border))',
        'border-subtle': 'rgb(var(--border-subtle))',
        'text-primary': 'rgb(var(--text-primary))',
        'text-secondary': 'rgb(var(--text-secondary))',
        'text-muted': 'rgb(var(--text-muted))',
        'text-inverse': 'rgb(var(--text-inverse))',
        accent: 'rgb(var(--accent))',
        'accent-hover': 'rgb(var(--accent-hover))',
        'accent-muted': 'rgb(var(--accent-muted))',
        success: 'rgb(var(--success))',
        warning: 'rgb(var(--warning))',
        error: 'rgb(var(--error))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
        display: ['var(--font-display)'],
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
}

export default config
