import { NextResponse, type NextRequest } from 'next/server'
import { requireClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/signout
 *
 * Signs the session out and redirects, rather than returning raw JSON. Without
 * the redirect the browser stayed on /admin showing an empty page.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase is not configured on this deployment.' }, { status: 503 })
  }

  const supabase = await requireClient()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/admin/login', request.url), {
    status: 303,
    headers: { 'Cache-Control': 'no-store' },
  })
}
