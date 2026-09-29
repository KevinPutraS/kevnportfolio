'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * "Print" / "Save as PDF".
 *
 * A client component for one reason: `window.print()` is the only way to reach
 * the browser's own print dialog, and there is no server-side equivalent. It is
 * deliberately not a link to a `.pdf` — that would be a second document to keep
 * in sync with the page, and the page is already the canonical version. The
 * stylesheet does the rest: `src/styles/globals.css` carries a `@media print`
 * block that drops the chrome and forces the palette to ink-on-paper, so the
 * browser's "Save as PDF" produces a clean document rather than a dark-mode
 * screenshot.
 *
 * Hidden when printing, because a control that prints itself is a paper cut.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="lg"
      className={className}
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      Print or save as PDF
    </Button>
  )
}
