'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'

const STATS = [
  { label: 'Impressions', value: '38,204', sub: 'Last 30 days' },
  { label: 'Video plays', value: '6,891', sub: '18% play rate' },
  { label: 'Completion rate', value: '73%', sub: 'Watched >80%' },
  { label: 'Attributed conversions', value: '312', sub: '+27% lift' },
]

const BARS = [42, 58, 49, 67, 71, 63, 88, 79, 94, 82, 91, 100]

export default function AnalyticsPage() {
  return (
    <DashboardShell active="analytics">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Analytics</h1>
        <p className="mt-1 text-carbon-500">Track how your testimonials drive conversions.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-paper-border bg-white p-5">
            <p className="text-sm text-carbon-500">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-carbon-900">{s.value}</p>
            <p className="mt-1 text-xs text-carbon-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-paper-border bg-white p-6">
        <h2 className="mb-6 font-semibold text-carbon-900">Widget impressions over time</h2>
        <div className="flex h-56 items-end gap-2">
          {BARS.map((h, i) => (
            <div key={i} className="group flex-1">
              <div
                className="rounded-t-md bg-ink-600 transition-all duration-300 hover:bg-ink-400"
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-carbon-400">
          <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
        </div>
      </div>
    </DashboardShell>
  )
}
