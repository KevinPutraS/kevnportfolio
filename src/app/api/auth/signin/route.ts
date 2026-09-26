import { NextResponse, type NextRequest } from 'next/server'
import { requireClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

/**
 * POST /api/auth/signin
 *
 * The Supabase anon key signs in the user, so passwords are never handled by
 * this application. Returns the user on success and never echoes the password.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: 'Supabase is not configured on this deployment.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown }

  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 })
  }

  if (email.length > 254 || password.length > 200) {
    return NextResponse.json({ message: 'Invalid credentials.' }, { status: 400 })
  }

  const supabase = await requireClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Deliberately generic: do not reveal whether the address exists.
    return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
  }

  return NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } })
}
