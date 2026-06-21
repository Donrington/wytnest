'use client'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MOCK_TESTIMONIALS } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

const METRICS = [
  { label: 'Total testimonials', value: '142', change: '+12 this week', trend: 'up' },
  { label: 'Approval rate', value: '94%', change: '+3% vs last month', trend: 'up' },
  { label: 'Widget impressions', value: '38.2k', change: '+18% this month', trend: 'up' },
  { label: 'Conversion lift', value: '+27%', change: 'attributed to widgets', trend: 'neutral' },
]

export default function DashboardPage() {
  return (
    <DashboardShell active="overview">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Welcome back, Sage</h1>
        <p className="mt-1 text-carbon-500">Here&apos;s how your social proof is performing.</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl border border-paper-border bg-white p-5">
            <p className="text-sm text-carbon-500">{m.label}</p>
            <p className="mt-2 font-display text-3xl font-extrabold text-carbon-900">{m.value}</p>
            <p className={`mt-1 text-xs ${m.trend === 'up' ? 'text-emerald-600' : 'text-carbon-400'}`}>{m.change}</p>
          </div>
        ))}
      </div>

      {/* Recent + pending */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-paper-border bg-white">
            <div className="flex items-center justify-between border-b border-paper-border px-6 py-4">
              <h2 className="font-semibold text-carbon-900">Recent testimonials</h2>
              <a href="/dashboard/testimonials" className="text-sm font-medium text-ink-600 hover:text-ink-800">View all</a>
            </div>
            <div className="divide-y divide-paper-border">
              {MOCK_TESTIMONIALS.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-start gap-3 px-6 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-50 text-sm font-semibold text-ink-800">
                    {initials(t.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-carbon-900">{t.name}</p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Approved</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-carbon-500">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  {t.type === 'video' && (
                    <span className="flex h-7 items-center gap-1 rounded-full bg-ink-50 px-2.5 text-xs font-medium text-ink-600">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
                      Video
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-gold-200 bg-gold-50/50 p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 text-gold-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <h3 className="font-semibold text-gold-900">3 awaiting review</h3>
            </div>
            <p className="text-sm text-gold-800">New testimonials need your approval before they go live.</p>
            <a href="/dashboard/testimonials" className="mt-4 block rounded-full bg-gold-400 py-2.5 text-center text-sm font-medium text-gold-900 transition-colors hover:bg-gold-200">
              Review now
            </a>
          </div>

          <div className="mt-4 rounded-2xl border border-paper-border bg-white p-6">
            <h3 className="font-semibold text-carbon-900">Quick start</h3>
            <ul className="mt-3 space-y-2.5">
              {['Create your first campaign', 'Share the collection link', 'Embed a widget on your site'].map((step, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-carbon-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-600">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
