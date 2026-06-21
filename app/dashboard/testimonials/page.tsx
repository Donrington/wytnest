'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MOCK_TESTIMONIALS } from '@/lib/mock-data'
import { initials, cn } from '@/lib/utils'

const FILTERS = ['All', 'Pending', 'Approved', 'Video', 'Text'] as const

export default function TestimonialsPage() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All')

  return (
    <DashboardShell active="testimonials">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-carbon-900">Testimonials</h1>
          <p className="mt-1 text-carbon-500">Approve, feature, and organize your social proof.</p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              filter === f ? 'bg-carbon-900 text-white' : 'border border-paper-border bg-white text-carbon-600 hover:border-carbon-300'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MOCK_TESTIMONIALS.map((t, i) => (
          <div key={t.id} className="flex flex-col rounded-2xl border border-paper-border bg-white p-5">
            {t.type === 'video' && (
              <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-carbon-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7L8 5z" /></svg>
                </span>
              </div>
            )}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-0.5 text-gold-400">
                {[...Array(5)].map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" /></svg>
                ))}
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', i < 3 ? 'bg-gold-50 text-gold-800' : 'bg-emerald-50 text-emerald-700')}>
                {i < 3 ? 'Pending' : 'Approved'}
              </span>
            </div>
            <p className="flex-1 text-sm leading-relaxed text-carbon-700">&ldquo;{t.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-2.5 border-t border-paper-border pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-800">{initials(t.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-carbon-900">{t.name}</p>
                <p className="truncate text-xs text-carbon-400">{t.role}, {t.company}</p>
              </div>
            </div>
            {i < 3 && (
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-full bg-emerald-500 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600">Approve</button>
                <button className="flex-1 rounded-full border border-paper-border py-2 text-sm font-medium text-carbon-600 transition-colors hover:border-red-300 hover:text-red-600">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
