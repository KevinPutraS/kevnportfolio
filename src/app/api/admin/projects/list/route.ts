import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const category = searchParams.get('category') || undefined
    const featured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined
    const published = searchParams.get('published') === 'true' ? true : searchParams.get('published') === 'false' ? false : undefined

    const PAGE_SIZE = 12
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('project_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (published !== undefined) {
      query = query.eq('published', published)
    }
    
    if (featured !== undefined) {
      query = query.eq('featured', featured)
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ projects: [], total: 0, page, pageSize: PAGE_SIZE })
    }

    return NextResponse.json({
      projects: data || [],
      total: count || 0,
      page,
      pageSize: PAGE_SIZE,
    })
  } catch (error) {
    console.error('Fetch projects error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}