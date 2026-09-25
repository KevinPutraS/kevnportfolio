import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-9xl font-bold text-[rgb(var(--accent))/0.3] mb-4" aria-hidden="true">
          404
        </h1>
        <h2 className="heading-2 mb-4">Page Not Found</h2>
        <p className="body text-[rgb(var(--text-secondary))] mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="group w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" aria-hidden="true" />
              Go Home
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="secondary" className="group w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" aria-hidden="true" />
              Browse Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}