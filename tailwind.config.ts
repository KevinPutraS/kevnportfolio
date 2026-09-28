import type { Config } from 'tailwindcss'

/**
 * Colours are driven by the CSS custom properties defined in
 * `src/styles/globals.css`, so there is exactly one place to change a token.
 * The font families reference the composed vars (which in turn reference the
 * `next/font` variables), never the raw `--font-*` names from next/font.
 *
 * Every value below points at a token that is actually defined. A palette entry
 * naming a non-existent variable is not a build error — it compiles to a rule
 * whose declaration is invalid at computed-value time and silently resolves to
 * nothing, which is exactly how the previous palette lost every button label.
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
        'surface-strong': 'rgb(var(--bg-highlight))',
        border: 'rgb(var(--border))',
        'border-subtle': 'rgb(var(--border-subtle))',
        'border-strong': 'rgb(var(--border-strong))',
        'text-primary': 'rgb(var(--text-primary))',
        'text-secondary': 'rgb(var(--text-secondary))',
        'text-muted': 'rgb(var(--text-muted))',
        'text-inverse': 'rgb(var(--text-inverse))',
        accent: 'rgb(var(--accent))',
        'accent-bright': 'rgb(var(--accent-bright))',
        'accent-dim': 'rgb(var(--accent-dim))',
        'accent-hover': 'rgb(var(--accent-hover))',
        'accent-contrast': 'rgb(var(--accent-contrast))',
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
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      maxWidth: {
        prose: '68ch',
      },
      spacing: {
        nav: 'var(--nav-h)',
        section: 'var(--space-4xl)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 500ms cubic-bezier(0, 0, 0.2, 1) both',
        'slide-up': 'slide-up 700ms cubic-bezier(0, 0, 0.2, 1) both',
        'sheet-up': 'sheet-up 320ms cubic-bezier(0.22, 0.8, 0.28, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
