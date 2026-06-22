import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const { widget_id, event_type, testimonial_id, session_id, page_url, referrer } = body

    if (!widget_id || !event_type) {
      return new Response(JSON.stringify({ error: 'Missing widget_id or event_type' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Resolve workspace_id from widget
    const { data: widget } = await supabase
      .from('widgets')
      .select('workspace_id')
      .eq('id', widget_id)
      .single()

    if (!widget) {
      return new Response(JSON.stringify({ error: 'Widget not found' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const country = req.headers.get('CF-IPCountry') ?? null

    await supabase.from('widget_events').insert({
      widget_id,
      workspace_id: widget.workspace_id,
      testimonial_id: testimonial_id ?? null,
      event_type,
      session_id: session_id ?? null,
      page_url: page_url ?? null,
      referrer: referrer ?? null,
      country,
    })

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
