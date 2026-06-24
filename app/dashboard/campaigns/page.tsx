'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import { fmtNow } from '@/lib/utils'
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
  const [now, setNow]             = useState('')

  useEffect(() => {
    setNow(fmtNow())
    const id = setInterval(() => setNow(fmtNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  const load = useCallback(async () => {
    if (!workspace) return
    setLoading(true)
    const supabase = createClient()

    const [
      { data: campaignRows },
      { data: tokenRows },
      { data: testimonialRows },
    ] = await Promise.all([
      supabase
        .from('campaigns')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('submission_tokens')
        .select('campaign_id')
        .eq('workspace_id', workspace.id),
      supabase
        .from('testimonials')
        .select('campaign_id')
        .eq('workspace_id', workspace.id)
        .not('campaign_id', 'is', null),
    ])

    const tokenCounts: Record<string, number> = {}
    ;(tokenRows ?? []).forEach((t: any) => {
      if (t.campaign_id) tokenCounts[t.campaign_id] = (tokenCounts[t.campaign_id] ?? 0) + 1
    })

    const testimonialCounts: Record<string, number> = {}
    ;(testimonialRows ?? []).forEach((t: any) => {
      testimonialCounts[t.campaign_id] = (testimonialCounts[t.campaign_id] ?? 0) + 1
    })

    setCampaigns(
      (campaignRows ?? []).map((c: any) => ({
        ...c,
        _tokens:    tokenCounts[c.id]    ?? 0,
        _collected: testimonialCounts[c.id] ?? 0,
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
        <p style={{ color: T.body }} className="mt-1 flex flex-wrap items-center gap-2">
          Create collection requests and track responses.
          {now && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
              style={{ background: T.tableRowHoverBg, color: T.muted }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {now}
            </span>
          )}
        </p>
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
        <>
          {/* ── Mobile cards (< md) ──────────────────────────────── */}
          <div className="flex flex-col gap-3 md:hidden">
            {campaigns.map((c) => {
              const rate = c._tokens > 0
                ? `${Math.round((c._collected / c._tokens) * 100)}%`
                : c._collected > 0
                ? `${c._collected} direct`
                : '—'
              return (
                <div key={c.id} style={cardStyle} className="p-4">
                  {/* Name + status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p style={{ color: T.heading }} className="truncate font-semibold text-sm">{c.name}</p>
                      <p style={{ color: T.muted }} className="mt-0.5 truncate font-mono text-[0.62rem]">/submit/{c.slug}</p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
                      style={statusTag(c.status)}
                    >
                      {c.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div
                    className="mt-3 flex items-center gap-5 pt-3"
                    style={{ borderTop: `1px solid ${T.tableRowBorder}` }}
                  >
                    <div>
                      <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium">Collected</p>
                      <p style={{ color: T.heading }} className="mt-0.5 font-semibold text-sm">{c._collected}</p>
                    </div>
                    <div>
                      <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium">Rate</p>
                      <p style={{ color: T.heading }} className="mt-0.5 font-semibold text-sm">{rate}</p>
                    </div>
                    <div>
                      <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium">Invites</p>
                      <p className="mt-0.5 text-sm">
                        {c._tokens > 0
                          ? <span style={{ color: T.body }}>{c._tokens}</span>
                          : <span style={{ color: T.muted }} className="text-xs">Public</span>}
                      </p>
                    </div>
                  </div>

                  {/* Copy link */}
                  <button
                    onClick={() => copyLink(c)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium transition-opacity hover:opacity-75"
                    style={{
                      background: T.tableRowHoverBg,
                      border:     `1px solid ${T.cardBorder}`,
                      color:      copied === c.id ? T.tagSuccessText : T.body,
                    }}
                  >
                    {copied === c.id ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
                </div>
              )
            })}
          </div>

          {/* ── Desktop table (≥ md) ─────────────────────────────── */}
          <div className="hidden md:block" style={cardStyle}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="text-left">
                  {['Campaign', 'Status', 'Invites', 'Collected', 'Response rate', 'Share'].map(h => (
                    <th key={h} style={{ color: T.muted }} className="px-6 py-4 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const rate = c._tokens > 0
                    ? `${Math.round((c._collected / c._tokens) * 100)}%`
                    : c._collected > 0
                    ? `${c._collected} direct`
                    : '—'
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
                      <td style={{ color: T.body }} className="px-6 py-4">
                        {c._tokens > 0 ? c._tokens : (
                          <span style={{ color: T.muted }} className="text-xs">Public link</span>
                        )}
                      </td>
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
        </>
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
