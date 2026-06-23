import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    const text = await req.text()
    body = JSON.parse(text)
  } catch {
    return new NextResponse(null, { status: 400, headers: CORS })
  }

  const { widget_id, workspace_id, event_type, testimonial_id, session_id, page_url, referrer } = body

  if (!widget_id || !workspace_id || !event_type) {
    return new NextResponse(null, { status: 400, headers: CORS })
  }

  // Anon client — events_insert RLS policy allows public insert
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  await supabase.from('widget_events').insert({
    widget_id,
    workspace_id,
    event_type,
    testimonial_id: testimonial_id || null,
    session_id:     session_id     || null,
    page_url:       page_url       || null,
    referrer:       referrer       || null,
  })

  return new NextResponse(null, { status: 204, headers: CORS })
}
