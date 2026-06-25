import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ public_id: string }> },
) {
  const { public_id } = await params

  // Server-side route — admin client bypasses RLS so we can serve
  // intentionally-public data (approved testimonials + widget config)
  // without needing per-table anon policies on workspaces.
  const supabase = createAdminClient()

  const { data: widget, error } = await supabase
    .from('widgets')
    .select('*, workspace:workspaces(brand_color, logo_url)')
    .eq('public_id', public_id)
    .single()

  if (error || !widget) {
    return NextResponse.json(
      { error: 'Widget not found' },
      { status: 404, headers: CORS },
    )
  }

  // Build testimonials query — always filter to approved only
  let query = supabase
    .from('testimonials')
    .select(`
      id, submitter_name, submitter_role, submitter_company,
      submitter_avatar_url, submitter_rating,
      type, text_content,
      video_playback_url, video_thumbnail_url, video_duration_seconds,
      transcript, display_order, created_at
    `)
    .eq('workspace_id', widget.workspace_id)
    .eq('status', 'approved')
    .order('is_pinned',     { ascending: false })
    .order('display_order', { ascending: true  })
    .order('created_at',    { ascending: false })
    .limit(widget.max_items ?? 20)

  if (widget.min_rating) {
    query = query.gte('submitter_rating', widget.min_rating)
  }
  if (widget.testimonial_type_filter) {
    query = query.eq('type', widget.testimonial_type_filter)
  }
  if (widget.campaign_ids?.length) {
    query = query.in('campaign_id', widget.campaign_ids)
  }

  const { data: testimonials } = await query

  return NextResponse.json(
    { widget, testimonials: testimonials ?? [], workspace: widget.workspace },
    {
      headers: {
        ...CORS,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    },
  )
}
