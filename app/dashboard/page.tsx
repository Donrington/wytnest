'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { initials } from '@/lib/utils'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Testimonial } from '@/lib/types/database'

interface Counts {
  total:     number
  pending:   number
  approved:  number
  campaigns: number
}

function OverviewContent() {
  const { T } = useDashTheme()
  const { workspace }   = useWorkspace()
  const [counts, setCounts]       = useState<Counts | null>(null)
  const [recent, setRecent]       = useState<Testimonial[]>([])
  const [userName, setUserName]   = useState('there')
  const [hoverRow, setHoverRow]   = useState<string | null>(null)
  const [hoverStep, setHoverStep] = useState<number | null>(null)

  // Load user name from session cache
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('wytnest-auth-user')
      if (cached) {
        const u = JSON.parse(cached)
        setUserName(u.name?.split(' ')[0] ?? 'there')
      }
    } catch {}
  }, [])

  const load = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()
    const wid = workspace.id

    const [
      { count: total },
      { count: pending },
      { count: approved },
      { count: campaigns },
      { data: recentRows },
    ] = await Promise.all([
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('workspace_id', wid),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('workspace_id', wid).eq('status', 'pending'),
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('workspace_id', wid).eq('status', 'approved'),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', wid),
      supabase.from('testimonials').select('*').eq('workspace_id', wid).order('created_at', { ascending: false }).limit(4),
    ])

    setCounts({ total: total ?? 0, pending: pending ?? 0, approved: approved ?? 0, campaigns: campaigns ?? 0 })
    setRecent((recentRows ?? []) as Testimonial[])
  }, [workspace])

  useEffect(() => { load() }, [load])

  const approvalRate = counts && counts.total > 0
    ? Math.round((counts.approved / counts.total) * 100)
    : null

  const METRICS = [
    {
      label: 'Total testimonials',
      value: counts ? String(counts.total) : '—',
      sub: counts?.total === 0 ? 'Share a campaign to collect some' : `${counts?.approved ?? 0} approved`,
      trend: 'neutral' as const,
    },
    {
      label: 'Pending review',
      value: counts ? String(counts.pending) : '—',
      sub: counts?.pending === 0 ? 'All caught up' : 'Need your approval',
      trend: (counts?.pending ?? 0) > 0 ? 'warn' as const : 'up' as const,
    },
    {
      label: 'Approval rate',
      value: approvalRate !== null ? `${approvalRate}%` : '—',
      sub: 'Approved of all collected',
      trend: 'neutral' as const,
    },
    {
      label: 'Active campaigns',
      value: counts ? String(counts.campaigns) : '—',
      sub: 'Collecting testimonials',
      trend: 'neutral' as const,
    },
  ]

  const trendColor = (trend: string) => {
    if (trend === 'up')   return T.tagSuccessText
    if (trend === 'warn') return T.tagPendingText
    return T.muted
  }

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  return (
    <>
      <div className="mb-8">
        <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">
          Welcome back, {userName}
        </h1>
        <p style={{ color: T.body }} className="mt-1">Here&apos;s how your social proof is performing.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} style={cardStyle} className="p-5">
            <p style={{ color: T.body }} className="text-sm">{m.label}</p>
            <p style={{ color: T.heading }} className="mt-2 font-display text-3xl font-extrabold">{m.value}</p>
            <p style={{ color: trendColor(m.trend) }} className="mt-1 text-xs">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent + pending card */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div style={cardStyle}>
            <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="flex items-center justify-between px-6 py-4">
              <h2 style={{ color: T.heading }} className="font-semibold">Recent testimonials</h2>
              <a href="/dashboard/testimonials" style={{ color: T.tagSuccessText }} className="text-sm font-medium transition-opacity hover:opacity-70">
                View all
              </a>
            </div>

            {recent.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p style={{ color: T.muted }} className="text-sm">No testimonials yet.</p>
                <a href="/dashboard/campaigns" style={{ color: T.tagSuccessText }} className="mt-2 block text-sm font-medium transition-opacity hover:opacity-70">
                  Go to campaigns →
                </a>
              </div>
            ) : (
              <div>
                {recent.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-3 px-6 py-4 transition-colors"
                    style={{
                      borderBottom: `1px solid ${T.tableRowBorder}`,
                      background: hoverRow === t.id ? T.tableRowHoverBg : 'transparent',
                    }}
                    onMouseEnter={() => setHoverRow(t.id)}
                    onMouseLeave={() => setHoverRow(null)}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{ background: 'linear-gradient(135deg, #4F3FCC22, #7B6EF522)', color: '#7B6EF5' }}
                    >
                      {initials(t.submitter_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p style={{ color: T.heading }} className="text-sm font-semibold">{t.submitter_name}</p>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                          style={
                            t.status === 'approved'
                              ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                              : t.status === 'pending'
                              ? { background: T.tagPendingBg, color: T.tagPendingText }
                              : { background: 'rgba(239,68,68,0.12)', color: '#F87171' }
                          }
                        >
                          {t.status}
                        </span>
                      </div>
                      <p style={{ color: T.body }} className="mt-0.5 line-clamp-1 text-sm">
                        {t.text_content ? `"${t.text_content}"` : 'Video testimonial'}
                      </p>
                    </div>
                    {t.type === 'video' && (
                      <span
                        className="flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium"
                        style={{ background: T.tableRowHoverBg, color: T.body }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7L8 5z" />
                        </svg>
                        Video
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {(counts?.pending ?? 0) > 0 ? (
            <div
              style={{
                background:   T.tagPendingBg,
                border:       `1px solid ${T.tagPendingText}33`,
                borderRadius: '16px',
                boxShadow:    T.cardShadow,
              }}
              className="p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: T.tagPendingText + '33', color: T.tagPendingText }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 style={{ color: T.tagPendingText }} className="font-semibold">{counts?.pending} awaiting review</h3>
              </div>
              <p style={{ color: T.heading }} className="text-sm">New testimonials need your approval before they go live.</p>
              <a
                href="/dashboard/testimonials"
                className="mt-4 block rounded-full py-2.5 text-center text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              >
                Review now
              </a>
            </div>
          ) : (
            <div
              style={{
                background:   T.tagSuccessBg,
                border:       `1px solid ${T.tagSuccessText}33`,
                borderRadius: '16px',
                boxShadow:    T.cardShadow,
              }}
              className="p-6"
            >
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: T.tagSuccessText + '33', color: T.tagSuccessText }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 style={{ color: T.tagSuccessText }} className="font-semibold">All caught up!</h3>
              </div>
              <p style={{ color: T.heading }} className="text-sm">No testimonials pending review.</p>
            </div>
          )}

          <div style={{ ...cardStyle, marginTop: '1rem' }} className="p-6">
            <h3 style={{ color: T.heading }} className="font-semibold">Quick start</h3>
            <ul className="mt-3 space-y-2.5">
              {[
                { label: 'Create a campaign',           href: '/dashboard/campaigns' },
                { label: 'Share the collection link',   href: '/dashboard/campaigns' },
                { label: 'Embed a widget on your site', href: '/dashboard/widgets'   },
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      background: hoverStep === i ? 'linear-gradient(135deg, #F8C352, #E8960F)' : T.tableRowHoverBg,
                      color:      hoverStep === i ? '#080716' : T.body,
                      transition: 'background 0.2s, color 0.2s',
                    }}
                    onMouseEnter={() => setHoverStep(i)}
                    onMouseLeave={() => setHoverStep(null)}
                  >
                    {i + 1}
                  </span>
                  <a
                    href={step.href}
                    style={{ color: T.body }}
                    className="text-sm transition-colors hover:underline"
                    onMouseEnter={e => (e.currentTarget.style.color = T.heading)}
                    onMouseLeave={e => (e.currentTarget.style.color = T.body)}
                  >
                    {step.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <DashboardShell active="overview">
      <OverviewContent />
    </DashboardShell>
  )
}
