export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[rgb(var(--accent))] text-[rgb(var(--accent-contrast))] hover:bg-[rgb(var(--accent-hover))]',
  secondary:
    'border border-[rgb(var(--border))] bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-primary))] hover:border-[rgb(var(--text-muted))] hover:bg-[rgb(var(--border))]',
  ghost:
    'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-elevated))] hover:text-[rgb(var(--text-primary))]',
  danger: 'bg-[rgb(var(--error))] text-white hover:opacity-90',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm sm:h-11 sm:px-5',
  lg: 'h-12 px-6 text-base',
}

/** Shared so `<Button>` and `<ButtonLink>` can never drift apart. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ')
}

/** Full-width is driven by the element itself, so `className` must come last. */
export function buttonIconSize(size: ButtonSize): string {
  return size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
}
