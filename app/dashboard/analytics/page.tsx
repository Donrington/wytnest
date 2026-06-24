'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
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

function AnalyticsContent() {
  const { T } = useDashTheme()
  const { workspace } = useWorkspace()

  const [events,       setEvents]       = useState<WidgetEvent[]>([])
  const [widgets,      setWidgets]      = useState<Widget[]>([])
  const [range,        setRange]        = useState<Range>(30)
  const [widgetFilter, setWidgetFilter] = useState<string>('all')
  const [loading,      setLoading]      = useState(true)
  const [hoverBar,     setHoverBar]     = useState<number | null>(null)
  const [hoverPageRow, setHoverPageRow] = useState<string | null>(null)

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

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  const selectStyle = {
    background:   T.tableRowHoverBg,
    border:       `1px solid ${T.cardBorder}`,
    color:        T.body,
    borderRadius: '12px',
    padding:      '8px 12px',
    fontSize:     '0.875rem',
    outline:      'none',
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Analytics</h1>
          <p style={{ color: T.body }} className="mt-1">Widget performance across your embedded testimonials.</p>
        </div>

        <div className="flex items-center gap-3">
          {widgets.length > 1 && (
            <select
              value={widgetFilter}
              onChange={e => setWidgetFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All widgets</option>
              {widgets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          )}

          <div
            className="flex rounded-xl p-1"
            style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}
          >
            {([7, 30, 90] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-all"
                style={
                  range === r
                    ? { background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }
                    : { color: T.body }
                }
              >
                {r}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6" style={{ color: T.muted }} viewBox="0 0 24 24" fill="none">
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
              <div key={s.label} style={cardStyle} className="p-5">
                <p style={{ color: T.body }} className="text-sm">{s.label}</p>
                <p style={{ color: T.heading }} className="mt-2 font-display text-3xl font-extrabold">{s.value}</p>
                <p style={{ color: T.muted }} className="mt-1 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {noData && (
            <div
              className="mb-6 p-12 text-center"
              style={{ ...cardStyle, borderStyle: 'dashed' }}
            >
              <div
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: T.tableRowHoverBg }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: T.body }}>
                  <path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" />
                </svg>
              </div>
              <p style={{ color: T.heading }} className="font-semibold">No events recorded yet</p>
              <p style={{ color: T.body }} className="mt-1 text-sm">
                Embed your widget on a live page and visitor events will show up here.
              </p>
              <a
                href="/dashboard/widgets"
                style={{ color: '#7B6EF5' }}
                className="mt-3 inline-block text-sm font-medium transition-opacity hover:opacity-70"
              >
                Go to widget builder →
              </a>
            </div>
          )}

          {/* Impressions chart */}
          {!noData && (
            <div style={cardStyle} className="mb-6 p-6">
              <h2 style={{ color: T.heading }} className="mb-6 font-semibold">
                Impressions per day
                {widgetFilter !== 'all' && (
                  <span style={{ color: T.body }} className="ml-2 text-sm font-normal">
                    · {widgets.find(w => w.id === widgetFilter)?.name}
                  </span>
                )}
              </h2>

              <div className="flex h-48 items-end gap-px">
                {daily.map((d, i) => (
                  <div
                    key={i}
                    className="group relative flex flex-1 flex-col items-center justify-end"
                    onMouseEnter={() => setHoverBar(i)}
                    onMouseLeave={() => setHoverBar(null)}
                  >
                    <div
                      className="w-full min-h-[2px] rounded-t-sm transition-colors"
                      style={{
                        height: `${Math.max(d.count > 0 ? (d.count / maxDaily) * 100 : 0, d.count > 0 ? 2 : 0)}%`,
                        background: hoverBar === i ? '#E8960F' : T.cardBorder,
                      }}
                    />
                    {d.count > 0 && hoverBar === i && (
                      <div
                        className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-xs"
                        style={{ background: T.heading, color: T.card }}
                      >
                        {d.count}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* X-axis labels */}
              <div className="mt-2 flex justify-between text-xs" style={{ color: T.muted }}>
                {axisLabels.map((label, i) => (
                  <span key={i}>{label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Top pages */}
          {topPages.length > 0 && (
            <div style={cardStyle}>
              <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="px-6 py-4">
                <h2 style={{ color: T.heading }} className="font-semibold">Top pages by impressions</h2>
              </div>
              <div>
                {topPages.map(({ url, count }) => (
                  <div
                    key={url}
                    className="flex items-center gap-4 px-6 py-3 transition-colors"
                    style={{
                      borderBottom: `1px solid ${T.tableRowBorder}`,
                      background: hoverPageRow === url ? T.tableRowHoverBg : 'transparent',
                    }}
                    onMouseEnter={() => setHoverPageRow(url)}
                    onMouseLeave={() => setHoverPageRow(null)}
                  >
                    <span style={{ color: T.body }} className="min-w-0 flex-1 truncate text-sm" title={url}>
                      {shortUrl(url)}
                    </span>
                    <span style={{ color: T.heading }} className="shrink-0 text-sm font-semibold tabular-nums">
                      {fmt(count)}
                    </span>
                    <div
                      className="w-24 shrink-0 overflow-hidden rounded-full"
                      style={{ height: 6, background: T.tableRowHoverBg }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((count / topPages[0].count) * 100)}%`,
                          background: 'linear-gradient(135deg, #F8C352, #E8960F)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <DashboardShell active="analytics">
      <AnalyticsContent />
    </DashboardShell>
  )
}
