import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const publicId = url.searchParams.get('id')

  if (!publicId) {
    return new Response(JSON.stringify({ error: 'Missing widget id' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  )

  const { data: widget, error: widgetError } = await supabase
    .from('widgets')
    .select('*, workspace:workspaces(brand_color, logo_url, plan)')
    .eq('public_id', publicId)
    .single()

  if (widgetError || !widget) {
    return new Response(JSON.stringify({ error: 'Widget not found' }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  let query = supabase
    .from('testimonials')
    .select(`
      id, submitter_name, submitter_role, submitter_company,
      submitter_avatar_url, submitter_rating, type, text_content,
      video_playback_url, video_thumbnail_url, video_duration_seconds,
      transcript, display_order, created_at
    `)
    .eq('workspace_id', widget.workspace_id)
    .eq('status', 'approved')
    .gte('submitter_rating', widget.min_rating)
    .order('is_pinned', { ascending: false })
    .order('display_order', { ascending: true })
    .limit(widget.max_items)

  if (widget.campaign_ids?.length) {
    query = query.in('campaign_id', widget.campaign_ids)
  }
  if (widget.testimonial_type_filter) {
    query = query.eq('type', widget.testimonial_type_filter)
  }

  const { data: testimonials, error: testimonialError } = await query

  if (testimonialError) {
    return new Response(JSON.stringify({ error: 'Failed to load testimonials' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({
    widget,
    testimonials: testimonials ?? [],
    workspace: widget.workspace,
  }), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
})
