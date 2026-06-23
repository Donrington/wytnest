import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { campaign_id, workspace_id, token_id, name, role, company, rating, text_content, type } = body

  if (!campaign_id || !workspace_id || !name?.trim() || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = createAdminClient()

  // If a personalized token is attached, verify it's still valid then consume it
  if (token_id) {
    const { data: tok } = await admin
      .from('submission_tokens')
      .select('id, used_at, expires_at')
      .eq('id', token_id)
      .single()

    if (!tok || tok.used_at || new Date(tok.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token is invalid or already used' }, { status: 400 })
    }

    await admin
      .from('submission_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tok.id)
  }

  const { error } = await admin.from('testimonials').insert({
    workspace_id,
    campaign_id,
    submission_token_id: token_id ?? null,
    submitter_name: name.trim(),
    submitter_role: role?.trim() || null,
    submitter_company: company?.trim() || null,
    submitter_rating: rating ? Number(rating) : null,
    type,
    text_content: type === 'text' ? (text_content?.trim() || null) : null,
    status: 'pending',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
