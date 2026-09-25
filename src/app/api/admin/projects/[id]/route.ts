import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectFormSchema } from '@/lib/validation/project'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()

    // For partial updates, we only validate provided fields
    const updateData: Record<string, unknown> = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.slug !== undefined) updateData.slug = body.slug
    if (body.short_description !== undefined) updateData.short_description = body.short_description
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.technologies !== undefined) {
      updateData.technologies = typeof body.technologies === 'string'
        ? body.technologies.split(',').map((t: string) => t.trim()).filter(Boolean)
        : body.technologies
    }
    if (body.project_date !== undefined) updateData.project_date = body.project_date || null
    if (body.thumbnail_url !== undefined) updateData.thumbnail_url = body.thumbnail_url || null
    if (body.gallery !== undefined) updateData.gallery = body.gallery
    if (body.project_url !== undefined) updateData.project_url = body.project_url || null
    if (body.repository_url !== undefined) updateData.repository_url = body.repository_url || null
    if (body.featured !== undefined) updateData.featured = body.featured
    if (body.published !== undefined) updateData.published = body.published

    // If slug is being changed, check for duplicates
    if (body.slug !== undefined) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', resolvedParams.id)
        .single()

      if (existing) {
        return NextResponse.json(
          { message: 'A project with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', resolvedParams.id)
      .select()
      .single()

    if (error) {
      console.error('Update project error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', resolvedParams.id)

    if (error) {
      console.error('Delete project error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}