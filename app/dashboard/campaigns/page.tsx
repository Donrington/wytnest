'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import type { Campaign } from '@/lib/types/database'

type CampaignRow = Campaign & {
  _tokens: number
  _collected: number
}

const STATUS_STYLES: Record<string, string> = {
  active:   'bg-emerald-50 text-emerald-700',
  draft:    'bg-carbon-100 text-carbon-600',
  paused:   'bg-gold-50 text-gold-800',
  archived: 'bg-red-50 text-red-600',
}

export default function CampaignsPage() {
  const { workspace } = useWorkspace()
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspace) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('campaigns')
      .select('*, submission_tokens(count), testimonials(count)')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    setCampaigns(
      (data ?? []).map((c: any) => ({
        ...c,
        _tokens:    c.submission_tokens?.[0]?.count ?? 0,
        _collected: c.testimonials?.[0]?.count ?? 0,
      })),
    )
    setLoading(false)
  }, [workspace])

  useEffect(() => { load() }, [load])

  const copyLink = (c: CampaignRow) => {
    const url = `${window.location.origin}/submit/${c.slug}`
    navigator.clipboard.writeText(url)
    setCopied(c.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <DashboardShell active="campaigns">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Campaigns</h1>
        <p className="mt-1 text-carbon-500">Create collection requests and track responses.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6 text-carbon-300" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-paper-border py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-carbon-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-carbon-400">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-semibold text-carbon-700">No campaigns yet</p>
          <p className="mt-1 text-sm text-carbon-400">Create one with the button above to start collecting testimonials.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-paper-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-border text-left text-xs uppercase tracking-wide text-carbon-400">
                <th className="px-6 py-4 font-medium">Campaign</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Sent</th>
                <th className="px-6 py-4 font-medium">Collected</th>
                <th className="px-6 py-4 font-medium">Response rate</th>
                <th className="px-6 py-4 font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {campaigns.map((c) => {
                const rate = c._tokens > 0 ? `${Math.round((c._collected / c._tokens) * 100)}%` : '—'
                return (
                  <tr key={c.id} className="transition-colors hover:bg-carbon-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-carbon-900">{c.name}</p>
                      <p className="mt-0.5 font-mono text-[0.68rem] text-carbon-400">/submit/{c.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[c.status] ?? ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-carbon-600">{c._tokens}</td>
                    <td className="px-6 py-4 text-carbon-600">{c._collected}</td>
                    <td className="px-6 py-4 font-medium text-carbon-900">{rate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyLink(c)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-paper-border bg-white px-3 py-1.5 text-xs font-medium text-carbon-700 transition-all hover:border-ink-400 hover:text-ink-700"
                      >
                        {copied === c.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-emerald-500">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                            </svg>
                            Copy link
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
