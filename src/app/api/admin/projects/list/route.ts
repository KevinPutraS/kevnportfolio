import { NextResponse } from 'next/server'
import { getAdminClient, guardAdmin } from '@/lib/api/admin-guard'

export const dynamic = 'force-dynamic'

/**
 * Lightweight listing used by the admin dashboard counters.
 * `force-dynamic` prevents Next from evaluating it at build time, which threw
 * "Dynamic server usage" during `next build` without Supabase configured.
 */
export async function GET() {
  const { error } = await guardAdmin()
  if (error) return error

  const supabase = await getAdminClient()
  const { data, error: queryError } = await supabase.from('projects').select('id, published, featured')

  if (queryError) {
    return NextResponse.json({ message: 'Could not load project stats.' }, { status: 500 })
  }

  const rows: Array<{ id: string; published: boolean; featured: boolean }> = data ?? []

  return NextResponse.json({
    total: rows.length,
    published: rows.filter((row) => row.published).length,
    drafts: rows.filter((row) => !row.published).length,
    featured: rows.filter((row) => row.featured).length,
  })
}
