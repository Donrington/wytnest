'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { initials } from '@/lib/utils'
import type { Testimonial } from '@/lib/types/database'

interface Counts {
  total:     number
  pending:   number
  approved:  number
  campaigns: number
}

export default function DashboardPage() {
  const { workspace }   = useWorkspace()
  const [counts, setCounts]       = useState<Counts | null>(null)
  const [recent, setRecent]       = useState<Testimonial[]>([])
  const [userName, setUserName]   = useState('there')

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

  const trendColor = (trend: string) =>
    trend === 'up' ? 'text-emerald-600' : trend === 'warn' ? 'text-gold-700' : 'text-carbon-400'

  return (
    <DashboardShell active="overview">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-carbon-500">Here&apos;s how your social proof is performing.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl border border-paper-border bg-white p-5">
            <p className="text-sm text-carbon-500">{m.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-carbon-900">{m.value}</p>
            <p className={`mt-1 text-xs ${trendColor(m.trend)}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent + pending card */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-paper-border bg-white">
            <div className="flex items-center justify-between border-b border-paper-border px-6 py-4">
              <h2 className="font-semibold text-carbon-900">Recent testimonials</h2>
              <a href="/dashboard/testimonials" className="text-sm font-medium text-ink-600 hover:text-ink-800">
                View all
              </a>
            </div>

            {recent.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-carbon-400">No testimonials yet.</p>
                <a href="/dashboard/campaigns" className="mt-2 block text-sm font-medium text-ink-600 hover:text-ink-800">
                  Go to campaigns →
                </a>
              </div>
            ) : (
              <div className="divide-y divide-paper-border">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-start gap-3 px-6 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-50 text-sm font-semibold text-ink-800">
                      {initials(t.submitter_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-carbon-900">{t.submitter_name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          t.status === 'approved' ? 'bg-emerald-50 text-emerald-700'
                          : t.status === 'pending' ? 'bg-gold-50 text-gold-800'
                          : 'bg-red-50 text-red-600'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-sm text-carbon-500">
                        {t.text_content ? `"${t.text_content}"` : 'Video testimonial'}
                      </p>
                    </div>
                    {t.type === 'video' && (
                      <span className="flex h-7 items-center gap-1 rounded-full bg-ink-50 px-2.5 text-xs font-medium text-ink-600">
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
            <div className="rounded-2xl border border-gold-200 bg-gold-50/50 p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-gold-900">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-semibold text-gold-900">{counts?.pending} awaiting review</h3>
              </div>
              <p className="text-sm text-gold-800">New testimonials need your approval before they go live.</p>
              <a href="/dashboard/testimonials"
                className="mt-4 block rounded-full bg-gold-400 py-2.5 text-center text-sm font-medium text-gold-900 transition-colors hover:bg-gold-300">
                Review now
              </a>
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-white">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="font-semibold text-emerald-900">All caught up!</h3>
              </div>
              <p className="text-sm text-emerald-800">No testimonials pending review.</p>
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-paper-border bg-white p-6">
            <h3 className="font-semibold text-carbon-900">Quick start</h3>
            <ul className="mt-3 space-y-2.5">
              {[
                { label: 'Create a campaign',         href: '/dashboard/campaigns' },
                { label: 'Share the collection link', href: '/dashboard/campaigns' },
                { label: 'Embed a widget on your site', href: '/dashboard/widgets' },
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-600">
                    {i + 1}
                  </span>
                  <a href={step.href} className="text-sm text-carbon-600 hover:text-ink-700 hover:underline">
                    {step.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
