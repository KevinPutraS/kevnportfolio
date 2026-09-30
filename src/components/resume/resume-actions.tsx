'use client'

import { Download, Printer } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Button } from '@/components/ui/button'

/**
 * The document's actions.
 *
 * `window.print()` is the only route to the browser's own print dialog and its
 * "Save as PDF" destination, and there is no server-side equivalent, so this is a
 * client component. Everything the print stylesheet does — A4 page boxes, the
 * removal of this bar, the drop of the site chrome, the ink-on-paper palette — is
 * in `src/styles/globals.css` under `PRINT` and `RESUME DOCUMENT`.
 *
 * The download link is deliberately conditional, and `null` is load-bearing rather
 * than a placeholder: a download button on a CV that 404s is worse than no
 * button. Point `NEXT_PUBLIC_RESUME_URL` at a real file in `public/` to enable it.
 *
 * A control that printed itself would be a paper cut, so the whole bar is
 * `print:hidden` and is also hidden by the print block outright.
 */
export function ResumeActions() {
  return (
    <div className="resume-actions print:hidden">
      {siteConfig.resumeUrl && (
        <a href={siteConfig.resumeUrl} download className="btn btn-primary btn-lg">
          <Download className="h-5 w-5" aria-hidden="true" />
          Download PDF
        </a>
      )}

      <Button type="button" variant="secondary" size="lg" onClick={() => window.print()}>
        <Printer className="h-5 w-5" aria-hidden="true" />
        Print or save as PDF
      </Button>
    </div>
  )
}
