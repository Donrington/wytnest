'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { initials, cn } from '@/lib/utils'
import type { Testimonial } from '@/lib/types/database'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Video', 'Text'] as const
type Filter = typeof FILTERS[number]

const STATUS_STYLES: Record<string, string> = {
  pending:  'bg-gold-50 text-gold-800',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
  flagged:  'bg-carbon-100 text-carbon-600',
}

export default function TestimonialsPage() {
  const { workspace }   = useWorkspace()
  const [filter, setFilter]           = useState<Filter>('All')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading]         = useState(true)
  const [acting, setActing]           = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!workspace) return
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    setTestimonials((data ?? []) as Testimonial[])
    setLoading(false)
  }, [workspace])

  useEffect(() => { load() }, [load])

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    setActing(id)
    await createClient()
      .from('testimonials')
      .update({ status, moderated_at: new Date().toISOString() })
      .eq('id', id)
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    setActing(null)
  }

  const visible = testimonials.filter(t => {
    if (filter === 'Pending')  return t.status === 'pending'
    if (filter === 'Approved') return t.status === 'approved'
    if (filter === 'Rejected') return t.status === 'rejected'
    if (filter === 'Video')    return t.type === 'video'
    if (filter === 'Text')     return t.type === 'text'
    return true
  })

  return (
    <DashboardShell active="testimonials">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-carbon-900">Testimonials</h1>
          <p className="mt-1 text-carbon-500">Approve, feature, and organize your social proof.</p>
        </div>
        {!loading && (
          <span className="text-sm text-carbon-400">
            {testimonials.filter(t => t.status === 'pending').length} pending review
          </span>
        )}
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              filter === f ? 'bg-carbon-900 text-white' : 'border border-paper-border bg-white text-carbon-600 hover:border-carbon-300',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6 text-carbon-300" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-paper-border py-20 text-center">
          <p className="font-semibold text-carbon-700">No testimonials{filter !== 'All' ? ` matching "${filter}"` : ''}</p>
          <p className="mt-1 text-sm text-carbon-400">
            {testimonials.length === 0
              ? 'Share a campaign link to start collecting.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div key={t.id} className="flex flex-col rounded-2xl border border-paper-border bg-white p-5">
              {t.type === 'video' && (
                <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-carbon-900">
                  {t.video_playback_url ? (
                    <video src={t.video_playback_url} controls className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </span>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-0.5 text-gold-400">
                  {[...Array(t.submitter_rating ?? 5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[t.status] ?? '')}>
                  {t.status}
                </span>
              </div>

              <p className="flex-1 text-sm leading-relaxed text-carbon-700">
                {t.text_content
                  ? <>&ldquo;{t.text_content}&rdquo;</>
                  : <span className="italic text-carbon-400">Video testimonial</span>}
              </p>

              <div className="mt-4 flex items-center gap-2.5 border-t border-paper-border pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-800">
                  {initials(t.submitter_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-carbon-900">{t.submitter_name}</p>
                  <p className="truncate text-xs text-carbon-400">
                    {[t.submitter_role, t.submitter_company].filter(Boolean).join(', ') || 'No details provided'}
                  </p>
                </div>
              </div>

              {t.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => moderate(t.id, 'approved')}
                    disabled={acting === t.id}
                    className="flex-1 rounded-full bg-emerald-500 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {acting === t.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => moderate(t.id, 'rejected')}
                    disabled={acting === t.id}
                    className="flex-1 rounded-full border border-paper-border py-2 text-sm font-medium text-carbon-600 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
