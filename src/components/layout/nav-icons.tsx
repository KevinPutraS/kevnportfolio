/** Inline icons keyed by the nav label, so no icon package grows for six items. */
export type NavIconProps = {
  name: string
  className?: string
}

export function NavIcon({ name, className }: NavIconProps) {
  const shared = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: `h-5 w-5 ${className ?? ''}`.trim(),
    'aria-hidden': true,
  }

  switch (name) {
    case 'Home':
      return (
        <svg {...shared}>
          <path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
        </svg>
      )
    case 'Projects':
      return (
        <svg {...shared}>
          <rect x="3" y="3" width="8" height="8" rx="2" />
          <rect x="13" y="3" width="8" height="8" rx="2" />
          <rect x="3" y="13" width="8" height="8" rx="2" />
          <rect x="13" y="13" width="8" height="8" rx="2" />
        </svg>
      )
    case 'Experience':
      return (
        <svg {...shared}>
          <path d="M4 21v-1.5A4.5 4.5 0 0 1 8.5 15h1A4.5 4.5 0 0 1 14 19.5V21" />
          <circle cx="11" cy="8" r="3.5" />
          <path d="M18 21v-1.5a4.5 4.5 0 0 0-3-4.24" />
          <path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" />
        </svg>
      )
    case 'Certificates':
      return (
        <svg {...shared}>
          <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" />
        </svg>
      )
    case 'About':
      return (
        <svg {...shared}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </svg>
      )
    /*
      A sheet of paper with lines, which is the document metaphor rather than a
      download arrow — an arrow reads as an action and this destination is a
      place, the same way the other six are places. The corner fold gives it a
      silhouette that is distinguishable from About's silhouette at 20px, which
      a plain rectangle with three rules would not be.
    */
    case 'Resume':
      return (
        <svg {...shared}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      )
    case 'Contact':
      return (
        <svg {...shared}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      )
    /*
     * The theme pair. Which of the two is drawn is not decided here — the
     * stylesheet hides one of them based on `data-theme`, so the server and the
     * client render identical markup. See `theme-toggle.tsx`.
     */
    case 'Sun':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )
    case 'Moon':
      return (
        <svg {...shared}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )
    default:
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}