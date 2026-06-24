'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Campaign } from '@/lib/types/database'

type CampaignRow = Campaign & {
  _tokens: number
  _collected: number
}

function CampaignsContent() {
  const { T } = useDashTheme()
  const { workspace } = useWorkspace()
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [copied, setCopied]       = useState<string | null>(null)
  const [hoverRow, setHoverRow]   = useState<string | null>(null)

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

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  const statusTag = (status: string) => {
    if (status === 'active')   return { background: T.tagSuccessBg,  color: T.tagSuccessText }
    if (status === 'paused')   return { background: T.tagPendingBg,  color: T.tagPendingText }
    if (status === 'archived') return { background: 'rgba(239,68,68,0.12)', color: '#F87171' }
    return { background: T.tableRowHoverBg, color: T.muted }
  }

  return (
    <>
      <div className="mb-6">
        <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Campaigns</h1>
        <p style={{ color: T.body }} className="mt-1">Create collection requests and track responses.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6" style={{ color: T.muted }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : campaigns.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ ...cardStyle, borderStyle: 'dashed' }}
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: T.tableRowHoverBg }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: T.muted }}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ color: T.heading }} className="font-semibold">No campaigns yet</p>
          <p style={{ color: T.body }} className="mt-1 text-sm">Create one with the button above to start collecting testimonials.</p>
        </div>
      ) : (
        <div style={cardStyle} className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="text-left">
                {['Campaign', 'Status', 'Sent', 'Collected', 'Response rate', 'Share'].map(h => (
                  <th key={h} style={{ color: T.muted }} className="px-6 py-4 font-medium text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const rate = c._tokens > 0 ? `${Math.round((c._collected / c._tokens) * 100)}%` : '—'
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: `1px solid ${T.tableRowBorder}`,
                      background: hoverRow === c.id ? T.tableRowHoverBg : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={() => setHoverRow(c.id)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    <td className="px-6 py-4">
                      <p style={{ color: T.heading }} className="font-medium">{c.name}</p>
                      <p style={{ color: T.muted }} className="mt-0.5 font-mono text-[0.68rem]">/submit/{c.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                        style={statusTag(c.status)}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: T.body }} className="px-6 py-4">{c._tokens}</td>
                    <td style={{ color: T.body }} className="px-6 py-4">{c._collected}</td>
                    <td style={{ color: T.heading }} className="px-6 py-4 font-medium">{rate}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => copyLink(c)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-75"
                        style={{
                          background: T.tableRowHoverBg,
                          border:     `1px solid ${T.cardBorder}`,
                          color:      T.body,
                        }}
                      >
                        {copied === c.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ color: T.tagSuccessText }}>
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
    </>
  )
}

export default function CampaignsPage() {
  return (
    <DashboardShell active="campaigns">
      <CampaignsContent />
    </DashboardShell>
  )
}
