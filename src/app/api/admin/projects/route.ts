import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectFormSchema } from '@/lib/validation/project'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const result = projectFormSchema.safeParse({
      ...body,
      technologies: body.technologies ? body.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      gallery: body.gallery || [],
    })
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', result.data.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'A project with this slug already exists' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...result.data,
        technologies: result.data.technologies,
        gallery: result.data.gallery,
      })
      .select()
      .single()

    if (error) {
      console.error('Create project error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}