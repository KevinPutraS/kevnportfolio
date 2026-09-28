export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Button construction.
 *
 * Built from the `.btn*` classes in `globals.css` rather than from inline
 * arbitrary values, for two reasons that both cost real bugs last time:
 *
 * 1. `text-[rgb(var(--accent-contrast))]` named a variable that was never
 *    defined. That compiles to `color: rgb(var(--accent-contrast))`, which is
 *    invalid at computed-value time and resolves to *inherit* — so every
 *    primary button rendered light text on a light fill and became unreadable,
 *    with no build error and no warning. A named variant cannot drift from its
 *    token the same way, because the token lives next to the rule that uses it.
 *
 * 2. `bg-[rgb(var(--x))]/50` produces no CSS whatsoever (see globals.css), so
 *    a translucent hover state simply did not exist. The class-based approach
 *    sidesteps the trap by not using the construct at all.
 *
 * Size is part of the contract, not a hint: `sm` is still 36px rather than the
 * 32px it used to be, so a CMS row action is never below the comfortable
 * pointer size, and `md`/`lg` clear the 44px touch target on a phone.
 */
const BASE = 'btn'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

/** Shared so `<Button>` and `<ButtonLink>` can never drift apart. */
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  // `className` is joined last so a caller can always win on layout — `w-full`
  // on a phone, for instance — without a specificity fight.
  return [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ')
}

/** Icon size that matches the label size of each button size. */
export function buttonIconSize(size: ButtonSize): string {
  return size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'
}
