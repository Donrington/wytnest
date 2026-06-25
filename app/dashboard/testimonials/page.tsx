'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { initials, fmtNow } from '@/lib/utils'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Testimonial } from '@/lib/types/database'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Video', 'Text'] as const
type Filter = typeof FILTERS[number]

// ── Star picker ───────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={(hover || value) >= n ? '#E8960F' : 'none'}
            stroke="#E8960F" strokeWidth="1.6">
            <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Add testimonial modal ─────────────────────────────────────────────────────

function AddTestimonialModal({
  workspaceId,
  T,
  onAdd,
  onClose,
}: {
  workspaceId: string
  T: ReturnType<typeof useDashTheme>['T']
  onAdd: (t: Testimonial) => void
  onClose: () => void
}) {
  const [name,    setName]    = useState('')
  const [role,    setRole]    = useState('')
  const [company, setCompany] = useState('')
  const [email,   setEmail]   = useState('')
  const [source,  setSource]  = useState('')
  const [rating,  setRating]  = useState(5)
  const [text,    setText]    = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim())  { setError('Name is required.');          return }
    if (!text.trim())  { setError('Testimonial text is required.'); return }
    setError('')
    setSaving(true)

    const now = new Date().toISOString()
    const row = {
      workspace_id:       workspaceId,
      campaign_id:        null,
      submission_token_id: null,
      submitter_name:     name.trim(),
      submitter_email:    email.trim()   || null,
      submitter_role:     role.trim()    || null,
      submitter_company:  company.trim() || null,
      submitter_rating:   rating,
      type:               'text' as const,
      text_content:       text.trim(),
      status:             'approved' as const,
      is_featured:        false,
      is_pinned:          false,
      display_order:      0,
      source_url:         source.trim() || null,
      moderated_at:       now,
      created_at:         now,
      updated_at:         now,
    }

    const { data, error: err } = await createClient()
      .from('testimonials')
      .insert(row)
      .select()
      .single()

    if (err || !data) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
      setSaving(false)
      return
    }

    onAdd(data as Testimonial)
    onClose()
  }

  const inputStyle = {
    background:   T.tableRowHoverBg,
    border:       `1px solid ${T.cardBorder}`,
    color:        T.heading,
    borderRadius: '10px',
    outline:      'none',
  }

  const labelStyle = { color: T.muted, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(8,7,22,0.65)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl"
        style={{ background: T.card, border: `1px solid ${T.cardBorder}`, boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}
        >
          <div>
            <h2 style={{ color: T.heading }} className="font-display text-lg font-bold">Add testimonial</h2>
            <p style={{ color: T.muted }} className="mt-0.5 text-xs">Manually imported — auto-approved</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ background: T.tableRowHoverBg, color: T.muted }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Star rating */}
          <div>
            <p style={labelStyle} className="mb-2">Rating</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* Quote */}
          <div>
            <label style={labelStyle} className="mb-1.5 block">
              Testimonial <span style={{ color: '#F87171' }}>*</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={4}
              placeholder="What did they say about your product or service?"
              className="w-full resize-none px-3.5 py-3 text-sm placeholder-opacity-40 transition-colors focus:ring-1"
              style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
            />
          </div>

          {/* Name */}
          <div>
            <label style={labelStyle} className="mb-1.5 block">
              Name <span style={{ color: '#F87171' }}>*</span>
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-3.5 py-2.5 text-sm transition-colors focus:ring-1"
              style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
            />
          </div>

          {/* Role + Company row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle} className="mb-1.5 block">Role</label>
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="CEO"
                className="w-full px-3.5 py-2.5 text-sm transition-colors focus:ring-1"
                style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
              />
            </div>
            <div>
              <label style={labelStyle} className="mb-1.5 block">Company</label>
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Acme Inc."
                className="w-full px-3.5 py-2.5 text-sm transition-colors focus:ring-1"
                style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle} className="mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jane@acme.com"
              className="w-full px-3.5 py-2.5 text-sm transition-colors focus:ring-1"
              style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
            />
          </div>

          {/* Source URL */}
          <div>
            <label style={labelStyle} className="mb-1.5 block">Source URL <span style={{ color: T.muted, fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
            <input
              type="url"
              value={source}
              onChange={e => setSource(e.target.value)}
              placeholder="https://twitter.com/user/status/..."
              className="w-full px-3.5 py-2.5 text-sm transition-colors focus:ring-1"
              style={{ ...inputStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
            />
            <p style={{ color: T.muted }} className="mt-1 text-xs">Where was this testimonial originally posted?</p>
          </div>

          {error && (
            <p className="rounded-xl px-3.5 py-2.5 text-sm" style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171' }}>
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: `1px solid ${T.tableRowBorder}` }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 text-sm font-medium transition-opacity hover:opacity-75"
            style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="flex-1 rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
          >
            {saving ? 'Saving…' : 'Add testimonial'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Detail drawer ─────────────────────────────────────────────────────────────

function TestimonialDrawer({
  t,
  T,
  acting,
  onModerate,
  onClose,
}: {
  t: Testimonial
  T: ReturnType<typeof useDashTheme>['T']
  acting: string | null
  onModerate: (id: string, status: 'approved' | 'rejected') => void
  onClose: () => void
}) {
  const statusStyle = (status: string) => {
    if (status === 'approved') return { background: T.tagSuccessBg,          color: T.tagSuccessText }
    if (status === 'pending')  return { background: T.tagPendingBg,           color: T.tagPendingText }
    return                            { background: 'rgba(239,68,68,0.12)',   color: '#F87171'        }
  }

  const submittedAt = t.created_at
    ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex">
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(8,7,22,0.6)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />

      <motion.div
        className="relative ml-auto flex h-full w-full max-w-[480px] flex-col overflow-y-auto"
        style={{ background: T.card, borderLeft: `1px solid ${T.cardBorder}`, boxShadow: '-24px 0 60px rgba(0,0,0,0.35)' }}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={statusStyle(t.status)}>
              {t.status}
            </span>
            {t.type === 'video' && (
              <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: T.tableRowHoverBg, color: T.body }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
                Video
              </span>
            )}
            {t.campaign_id === null && (
              <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(79,63,204,0.12)', color: '#7B6EF5' }}>
                Manual
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ background: T.tableRowHoverBg, color: T.muted }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          {t.type === 'video' && (
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-2xl" style={{ background: 'rgba(0,0,0,0.35)' }}>
              {t.video_playback_url ? (
                <video src={t.video_playback_url} controls className="h-full w-full rounded-2xl object-cover" />
              ) : (
                <div className="text-center">
                  <span className="flex h-14 w-14 mx-auto items-center justify-center rounded-full" style={{ background: T.tableRowHoverBg }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ color: T.body }}><path d="M8 5v14l11-7L8 5z" /></svg>
                  </span>
                  <p style={{ color: T.muted }} className="mt-3 text-sm">Video processing…</p>
                </div>
              )}
            </div>
          )}

          {(t.submitter_rating ?? 0) > 0 && (
            <div className="flex gap-1" style={{ color: '#E8960F' }}>
              {[...Array(t.submitter_rating ?? 5)].map((_, i) => (
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
                </svg>
              ))}
            </div>
          )}

          {t.text_content ? (
            <div className="rounded-2xl p-5" style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}>
              <p style={{ color: T.body }} className="text-sm leading-relaxed whitespace-pre-wrap">
                &ldquo;{t.text_content}&rdquo;
              </p>
            </div>
          ) : t.type !== 'video' ? (
            <p style={{ color: T.muted }} className="text-sm italic">No text content.</p>
          ) : null}

          <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'linear-gradient(135deg, #4F3FCC22, #7B6EF522)', color: '#7B6EF5' }}>
              {initials(t.submitter_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p style={{ color: T.heading }} className="font-semibold">{t.submitter_name}</p>
              {(t.submitter_role || t.submitter_company) && (
                <p style={{ color: T.muted }} className="mt-0.5 text-sm">
                  {[t.submitter_role, t.submitter_company].filter(Boolean).join(' · ')}
                </p>
              )}
              {t.submitter_email && (
                <p style={{ color: T.muted }} className="mt-0.5 text-xs">{t.submitter_email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl px-4 py-3" style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}>
              <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium mb-1">Type</p>
              <p style={{ color: T.heading }} className="text-sm font-semibold capitalize">{t.type ?? 'text'}</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}>
              <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium mb-1">Submitted</p>
              <p style={{ color: T.heading }} className="text-sm font-semibold">{submittedAt ?? '—'}</p>
            </div>
          </div>

          {t.source_url && (
            <div className="rounded-xl px-4 py-3" style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}>
              <p style={{ color: T.muted }} className="text-[0.65rem] uppercase tracking-wide font-medium mb-1">Source</p>
              <a
                href={t.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#7B6EF5' }}
                className="text-sm truncate block hover:underline"
              >
                {t.source_url}
              </a>
            </div>
          )}
        </div>

        {t.status === 'pending' && (
          <div className="px-6 py-5 flex gap-3" style={{ borderTop: `1px solid ${T.tableRowBorder}` }}>
            <button
              onClick={() => onModerate(t.id, 'approved')}
              disabled={acting === t.id}
              className="flex-1 rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #34D399, #059669)', color: '#fff' }}
            >
              {acting === t.id ? '…' : 'Approve'}
            </button>
            <button
              onClick={() => onModerate(t.id, 'rejected')}
              disabled={acting === t.id}
              className="flex-1 rounded-full py-3 text-sm font-medium transition-opacity hover:opacity-75 disabled:opacity-50"
              style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }}
            >
              Reject
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────

function TestimonialsContent() {
  const { T } = useDashTheme()
  const { workspace }     = useWorkspace()
  const [filter, setFilter]             = useState<Filter>('All')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading]           = useState(true)
  const [acting, setActing]             = useState<string | null>(null)
  const [selected, setSelected]         = useState<Testimonial | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [now, setNow]                   = useState('')

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
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
    setActing(null)
  }

  const handleAdd = (t: Testimonial) => {
    setTestimonials(prev => [t, ...prev])
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
    if (status === 'approved') return { background: T.tagSuccessBg,        color: T.tagSuccessText }
    if (status === 'pending')  return { background: T.tagPendingBg,         color: T.tagPendingText }
    return                            { background: 'rgba(239,68,68,0.12)', color: '#F87171'        }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
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
        <div className="flex shrink-0 items-center gap-3">
          {!loading && (
            <span style={{ color: T.muted }} className="hidden sm:block text-sm">
              {testimonials.filter(t => t.status === 'pending').length} pending
            </span>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add
          </button>
        </div>
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
              ? 'Share a campaign link or add one manually.'
              : 'Try a different filter.'}
          </p>
          {testimonials.length === 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
              style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add first testimonial
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              style={{ ...cardStyle, cursor: 'pointer' }}
              className="group flex flex-col p-5 transition-all hover:scale-[1.01]"
            >
              {t.type === 'video' && (
                <div className="mb-4 flex aspect-video items-center justify-center rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  {t.video_playback_url ? (
                    <video src={t.video_playback_url} className="h-full w-full rounded-xl object-cover pointer-events-none" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: T.tableRowHoverBg }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: T.body }}><path d="M8 5v14l11-7L8 5z" /></svg>
                    </span>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex gap-0.5" style={{ color: '#E8960F' }}>
                  {[...Array(t.submitter_rating ?? 5)].map((_, i) => (
                    <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
                    </svg>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  {t.campaign_id === null && (
                    <span className="rounded-full px-1.5 py-0.5 text-[0.6rem] font-semibold" style={{ background: 'rgba(79,63,204,0.12)', color: '#7B6EF5' }}>
                      Manual
                    </span>
                  )}
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize" style={statusStyle(t.status)}>
                    {t.status}
                  </span>
                </div>
              </div>

              <p style={{ color: T.body }} className="flex-1 text-sm leading-relaxed line-clamp-3">
                {t.text_content
                  ? <>&ldquo;{t.text_content}&rdquo;</>
                  : <span style={{ color: T.muted }} className="italic">Video testimonial — click to view</span>}
              </p>

              {t.text_content && (
                <p className="mt-1.5 text-xs font-medium transition-opacity group-hover:opacity-100 opacity-0" style={{ color: T.tagSuccessText }}>
                  Read full →
                </p>
              )}

              <div className="mt-4 flex items-center gap-2.5 pt-4" style={{ borderTop: `1px solid ${T.tableRowBorder}` }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #4F3FCC22, #7B6EF522)', color: '#7B6EF5' }}>
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
                <div className="mt-4 flex gap-2" onClick={e => e.stopPropagation()}>
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

      {/* Modals & drawers */}
      <AnimatePresence>
        {showAddModal && workspace && (
          <AddTestimonialModal
            key="add-modal"
            workspaceId={workspace.id}
            T={T}
            onAdd={handleAdd}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {selected && !showAddModal && (
          <TestimonialDrawer
            key={selected.id}
            t={selected}
            T={T}
            acting={acting}
            onModerate={moderate}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
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
