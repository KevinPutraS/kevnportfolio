import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/lib/supabase/config'

/**
 * Runs on every admin request.
 *
 * Two jobs:
 * 1. Refresh the Supabase session cookies so an active admin is not signed out
 *    mid-edit, and so the access token stays valid.
 * 2. Send unauthenticated visitors to /admin/login before the admin shell
 *    renders at all.
 *
 * Job 2 is a UX optimisation, not the security boundary. Authorisation is
 * enforced by `getUser()` in the admin layout and by Row Level Security on the
 * `projects` table — hiding buttons in the UI is never treated as a control.
 */
export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next()

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request: { headers: request.headers } })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Reading the user revalidates the JWT against Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) return response

  const { pathname, search } = request.nextUrl

  if (pathname !== '/admin/login') {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    loginUrl.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
