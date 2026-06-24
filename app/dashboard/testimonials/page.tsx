'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { initials, fmtNow } from '@/lib/utils'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Testimonial } from '@/lib/types/database'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Video', 'Text'] as const
type Filter = typeof FILTERS[number]

function TestimonialsContent() {
  const { T } = useDashTheme()
  const { workspace }   = useWorkspace()
  const [filter, setFilter]           = useState<Filter>('All')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading]         = useState(true)
  const [acting, setActing]           = useState<string | null>(null)
  const [now, setNow]                 = useState('')

  useEffect(() => {
    setNow(fmtNow())
    const id = setInterval(() => setNow(fmtNow()), 60_000)
    return () => clearInterval(id)
  }, [])

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

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  const statusStyle = (status: string) => {
    if (status === 'approved') return { background: T.tagSuccessBg, color: T.tagSuccessText }
    if (status === 'pending')  return { background: T.tagPendingBg, color: T.tagPendingText }
    return { background: 'rgba(239,68,68,0.12)', color: '#F87171' }
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Testimonials</h1>
          <p style={{ color: T.body }} className="mt-1 flex flex-wrap items-center gap-2">
            Approve, feature, and organize your social proof.
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
        {!loading && (
          <span style={{ color: T.muted }} className="text-sm">
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
            className="rounded-full px-4 py-2 text-sm font-medium transition-all"
            style={
              filter === f
                ? { background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }
                : { background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6" style={{ color: T.muted }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : visible.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ ...cardStyle, borderStyle: 'dashed' }}
        >
          <p style={{ color: T.heading }} className="font-semibold">
            No testimonials{filter !== 'All' ? ` matching "${filter}"` : ''}
          </p>
          <p style={{ color: T.body }} className="mt-1 text-sm">
            {testimonials.length === 0
              ? 'Share a campaign link to start collecting.'
              : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div key={t.id} style={cardStyle} className="flex flex-col p-5">
              {t.type === 'video' && (
                <div
                  className="mb-4 flex aspect-video items-center justify-center rounded-xl"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  {t.video_playback_url ? (
                    <video src={t.video_playback_url} controls className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ background: T.tableRowHoverBg }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: T.body }}>
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    </span>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-0.5" style={{ color: '#E8960F' }}>
                  {[...Array(t.submitter_rating ?? 5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
                    </svg>
                  ))}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                  style={statusStyle(t.status)}
                >
                  {t.status}
                </span>
              </div>

              <p style={{ color: T.body }} className="flex-1 text-sm leading-relaxed">
                {t.text_content
                  ? <>&ldquo;{t.text_content}&rdquo;</>
                  : <span style={{ color: T.muted }} className="italic">Video testimonial</span>}
              </p>

              <div
                className="mt-4 flex items-center gap-2.5 pt-4"
                style={{ borderTop: `1px solid ${T.tableRowBorder}` }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg, #4F3FCC22, #7B6EF522)', color: '#7B6EF5' }}
                >
                  {initials(t.submitter_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ color: T.heading }} className="truncate text-sm font-semibold">{t.submitter_name}</p>
                  <p style={{ color: T.muted }} className="truncate text-xs">
                    {[t.submitter_role, t.submitter_company].filter(Boolean).join(', ') || 'No details provided'}
                  </p>
                </div>
              </div>

              {t.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => moderate(t.id, 'approved')}
                    disabled={acting === t.id}
                    className="flex-1 rounded-full py-2 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #34D399, #059669)', color: '#fff' }}
                  >
                    {acting === t.id ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => moderate(t.id, 'rejected')}
                    disabled={acting === t.id}
                    className="flex-1 rounded-full py-2 text-sm font-medium transition-opacity hover:opacity-75 disabled:opacity-50"
                    style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default function TestimonialsPage() {
  return (
    <DashboardShell active="testimonials">
      <TestimonialsContent />
    </DashboardShell>
  )
}
