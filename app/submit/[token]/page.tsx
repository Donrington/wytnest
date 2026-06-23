import { createAdminClient } from '@/lib/supabase/admin'
import { SubmitForm } from './SubmitForm'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function SubmitPage({ params }: PageProps) {
  const { token } = await params
  const admin = createAdminClient()

  type CampaignRow = {
    id: string
    workspace_id: string
    name: string
    prompt_heading: string
    prompt_body: string | null
    allow_video: boolean
    allow_text: boolean
    thank_you_message: string | null
    redirect_url: string | null
    status: string
  }

  let campaign: CampaignRow | null = null
  let tokenId: string | null = null

  // 64-char hex → personalized magic link
  if (/^[a-f0-9]{64}$/.test(token)) {
    const { data } = await admin
      .from('submission_tokens')
      .select('id, used_at, expires_at, campaign:campaigns(id, workspace_id, name, prompt_heading, prompt_body, allow_video, allow_text, thank_you_message, redirect_url, status)')
      .eq('token', token)
      .single()

    if (data && !data.used_at && new Date(data.expires_at) > new Date()) {
      tokenId = data.id as string
      campaign = data.campaign as unknown as CampaignRow
    }
  }

  // Otherwise treat as a campaign slug (general shareable link)
  if (!campaign) {
    const { data } = await admin
      .from('campaigns')
      .select('id, workspace_id, name, prompt_heading, prompt_body, allow_video, allow_text, thank_you_message, redirect_url, status')
      .eq('slug', token)
      .single()

    if (data && data.status !== 'archived') {
      campaign = data as CampaignRow
    }
  }

  if (!campaign) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-carbon-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
                stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-carbon-900">Link not found</h1>
          <p className="mt-2 text-sm text-carbon-500">
            This submission link is invalid, expired, or has already been used.
          </p>
        </div>
      </main>
    )
  }

  return (
    <SubmitForm
      campaignId={campaign.id}
      workspaceId={campaign.workspace_id}
      tokenId={tokenId}
      heading={campaign.prompt_heading}
      body={campaign.prompt_body}
      allowVideo={campaign.allow_video}
      allowText={campaign.allow_text}
      thankYouMessage={campaign.thank_you_message ?? 'Thank you! Your testimonial means the world to us.'}
      redirectUrl={campaign.redirect_url}
      campaignName={campaign.name}
    />
  )
}
