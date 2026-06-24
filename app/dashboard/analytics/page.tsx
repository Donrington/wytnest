'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { WidgetEvent, Widget } from '@/lib/types/database'

type Range = 7 | 30 | 90

// ── Helpers ────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}

function shortUrl(url: string): string {
  try {
    const u = new URL(url)
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '') || url
  } catch {
    return url
  }
}

function buildDayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function chartAxisLabels(count: number, range: number): string[] {
  // Returns ~5 evenly-spaced labels for the x-axis
  const out: string[] = Array(count).fill('')
  const indices = [0, Math.floor(count / 4), Math.floor(count / 2), Math.floor((3 * count) / 4), count - 1]
  indices.forEach(i => {
    const d = new Date()
    d.setDate(d.getDate() - (range - 1 - i))
    out[i] = buildDayLabel(d)
  })
  return out
}

// ── Page ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { workspace } = useWorkspace()

  const [events,       setEvents]       = useState<WidgetEvent[]>([])
  const [widgets,      setWidgets]      = useState<Widget[]>([])
  const [range,        setRange]        = useState<Range>(30)
  const [widgetFilter, setWidgetFilter] = useState<string>('all')
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    if (!workspace) return
    setLoading(true)
    const supabase = createClient()
    const since = new Date()
    since.setDate(since.getDate() - range)

    const [{ data: evRows }, { data: wRows }] = await Promise.all([
      supabase
        .from('widget_events')
        .select('id, event_type, widget_id, page_url, created_at')
        .eq('workspace_id', workspace.id)
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('widgets')
        .select('id, name, public_id')
        .eq('workspace_id', workspace.id),
    ])

    setEvents((evRows ?? []) as WidgetEvent[])
    setWidgets((wRows ?? []) as Widget[])
    setLoading(false)
  }, [workspace, range])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (widgetFilter === 'all') return events
    return events.filter(e => e.widget_id === widgetFilter)
  }, [events, widgetFilter])

  // ── Metrics ──────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const impressions    = filtered.filter(e => e.event_type === 'impression').length
    const videoPlays     = filtered.filter(e => e.event_type === 'video_play').length
    const videoCompletes = filtered.filter(e => e.event_type === 'video_complete').length
    const clicks         = filtered.filter(e => e.event_type === 'click').length
    const playRate       = impressions > 0 ? Math.round((videoPlays / impressions) * 100) : 0
    const completionRate = videoPlays  > 0 ? Math.round((videoCompletes / videoPlays) * 100) : 0
    return { impressions, videoPlays, videoCompletes, clicks, playRate, completionRate }
  }, [filtered])

  // ── Daily impressions chart ───────────────────────────────────

  const daily = useMemo(() => {
    const days: { label: string; count: number }[] = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({ label: buildDayLabel(d), count: 0 })
    }
    filtered
      .filter(e => e.event_type === 'impression')
      .forEach(e => {
        const label = buildDayLabel(new Date(e.created_at))
        const slot = days.find(d => d.label === label)
        if (slot) slot.count++
      })
    return days
  }, [filtered, range])

  const maxDaily = useMemo(() => Math.max(...daily.map(d => d.count), 1), [daily])
  const axisLabels = useMemo(() => chartAxisLabels(daily.length, range), [daily.length, range])

  // ── Top pages ─────────────────────────────────────────────────

  const topPages = useMemo(() => {
    const counts: Record<string, number> = {}
    filtered
      .filter(e => e.event_type === 'impression' && e.page_url)
      .forEach(e => { counts[e.page_url!] = (counts[e.page_url!] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([url, count]) => ({ url, count }))
  }, [filtered])

  const noData = !loading && metrics.impressions === 0

  return (
    <DashboardShell active="analytics">

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-carbon-900">Analytics</h1>
          <p className="mt-1 text-carbon-500">Widget performance across your embedded testimonials.</p>
        </div>

        <div className="flex items-center gap-3">
          {widgets.length > 1 && (
            <select
              value={widgetFilter}
              onChange={e => setWidgetFilter(e.target.value)}
              className="rounded-xl border border-paper-border bg-white px-3 py-2 text-sm text-carbon-700 outline-none focus:border-ink-600"
            >
              <option value="all">All widgets</option>
              {widgets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}

          <div className="flex rounded-xl border border-paper-border bg-white p-1">
            {([7, 30, 90] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                  range === r ? 'bg-ink-600 text-white' : 'text-carbon-500 hover:text-carbon-800',
                )}
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6 text-carbon-300" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Impressions',
                value: fmt(metrics.impressions),
                sub: `Last ${range} days`,
              },
              {
                label: 'Video plays',
                value: fmt(metrics.videoPlays),
                sub: metrics.impressions > 0
                  ? `${metrics.playRate}% play rate`
                  : 'No impressions yet',
              },
              {
                label: 'Completion rate',
                value: metrics.videoPlays > 0 ? `${metrics.completionRate}%` : '—',
                sub: 'Watched more than 80%',
              },
              {
                label: 'Clicks',
                value: fmt(metrics.clicks),
                sub: 'Widget interactions',
              },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-paper-border bg-white p-5">
                <p className="text-sm text-carbon-500">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-carbon-900">{s.value}</p>
                <p className="mt-1 text-xs text-carbon-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {noData && (
            <div className="mb-6 rounded-2xl border border-dashed border-paper-border bg-paper p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink-600">
                  <path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" />
                </svg>
              </div>
              <p className="font-semibold text-carbon-700">No events recorded yet</p>
              <p className="mt-1 text-sm text-carbon-400">
                Embed your widget on a live page and visitor events will show up here.
              </p>
              <a href="/dashboard/widgets"
                className="mt-3 inline-block text-sm font-medium text-ink-600 hover:text-ink-800">
                Go to widget builder →
              </a>
            </div>
          )}

          {/* Impressions chart */}
          {!noData && (
            <div className="mb-6 rounded-2xl border border-paper-border bg-white p-6">
              <h2 className="mb-6 font-semibold text-carbon-900">
                Impressions per day
                {widgetFilter !== 'all' && (
                  <span className="ml-2 text-sm font-normal text-carbon-400">
                    · {widgets.find(w => w.id === widgetFilter)?.name}
                  </span>
                )}
              </h2>

              <div className="flex h-48 items-end gap-px">
                {daily.map((d, i) => (
                  <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full min-h-[2px] rounded-t-sm bg-ink-200 transition-colors group-hover:bg-ink-600"
                      style={{ height: `${Math.max(d.count > 0 ? (d.count / maxDaily) * 100 : 0, d.count > 0 ? 2 : 0)}%` }}
                    />
                    {d.count > 0 && (
                      <div className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-carbon-900 px-2 py-0.5 text-xs text-white group-hover:block">
                        {d.count}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="mt-2 flex justify-between text-xs text-carbon-400">
                {axisLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Top pages */}
          {topPages.length > 0 && (
            <div className="rounded-2xl border border-paper-border bg-white">
              <div className="border-b border-paper-border px-6 py-4">
                <h2 className="font-semibold text-carbon-900">Top pages by impressions</h2>
              </div>
              <div className="divide-y divide-paper-border">
                {topPages.map(({ url, count }) => (
                  <div key={url} className="flex items-center gap-4 px-6 py-3">
                    <span className="min-w-0 flex-1 truncate text-sm text-carbon-700" title={url}>
                      {shortUrl(url)}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-carbon-900">
                      {fmt(count)}
                    </span>
                    <div className="w-24 shrink-0 overflow-hidden rounded-full bg-paper-border" style={{ height: 6 }}>
                      <div
                        className="h-full rounded-full bg-ink-600"
                        style={{ width: `${Math.round((count / topPages[0].count) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  )
}
