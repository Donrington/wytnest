'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { PLAN_LIMITS } from '@/lib/types/database'
import type { Campaign, PlanTier } from '@/lib/types/database'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

interface Props {
  workspaceId: string
  plan: PlanTier
  isDark: boolean
  onCreated: (campaign: Campaign) => void
  onClose: () => void
}

const STEPS = ['Basics', 'Prompt', 'Settings'] as const

export function CreateCampaignModal({ workspaceId, plan, isDark, onCreated, onClose }: Props) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 — Basics
  const [name, setName]       = useState('')
  const [slug, setSlug]       = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  // Step 2 — Prompt
  const [heading, setHeading] = useState('Share your experience')
  const [body, setBody]       = useState('')

  // Step 3 — Settings
  const [allowVideo, setAllowVideo] = useState(false)
  const [allowText, setAllowText]   = useState(true)
  const [maxSecs, setMaxSecs]       = useState(120)
  const [thankYou, setThankYou]     = useState('Thank you! Your testimonial means the world to us.')
  const [redirectUrl, setRedirectUrl] = useState('')

  const videoAllowed = PLAN_LIMITS[plan].videoAllowed

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugEdited) setSlug(toSlug(v))
  }

  const handleSlugChange = (v: string) => {
    setSlug(toSlug(v))
    setSlugEdited(true)
  }

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2 && slug.length >= 2
    if (step === 1) return heading.trim().length >= 3
    return true
  }

  const submit = async () => {
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data, error: dbErr } = await supabase
      .from('campaigns')
      .insert({
        workspace_id: workspaceId,
        name: name.trim(),
        slug,
        status: 'draft',
        prompt_heading: heading.trim(),
        prompt_body: body.trim() || null,
        allow_video: videoAllowed ? allowVideo : false,
        allow_text: allowText,
        max_video_seconds: maxSecs,
        thank_you_message: thankYou.trim() || null,
        redirect_url: redirectUrl.trim() || null,
      })
      .select()
      .single()

    setLoading(false)

    if (dbErr) {
      setError(dbErr.message.includes('unique') ? 'That slug is already taken. Try a different name.' : dbErr.message)
      return
    }

    onCreated(data as Campaign)
    onClose()
  }

  const bg       = isDark ? '#0E0C24' : '#FFFFFF'
  const border   = isDark ? 'rgba(123,110,245,0.18)' : 'rgba(123,110,245,0.15)'
  const text     = isDark ? '#E4E3F0' : '#1A1830'
  const muted    = isDark ? '#6F6C92' : '#8B88B0'
  const inputBg  = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(79,63,204,0.04)'
  const inputBdr = isDark ? '1px solid rgba(123,110,245,0.2)' : '1px solid rgba(123,110,245,0.18)'
  const divider  = isDark ? 'rgba(123,110,245,0.1)' : 'rgba(123,110,245,0.08)'

  const INPUT: React.CSSProperties = {
    background: inputBg,
    border: inputBdr,
    color: text,
    outline: 'none',
    width: '100%',
  }

  const LABEL = 'block text-[0.72rem] font-medium mb-1.5'

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-2xl"
          style={{ background: bg, border: `1px solid ${border}`, boxShadow: '0 32px 80px -12px rgba(0,0,0,0.6)' }}
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.38, ease: E_OUT }}
          onClick={e => e.stopPropagation()}
        >
          {/* Top shimmer */}
          <div className="absolute inset-x-0 top-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(123,110,245,0.4), transparent)'
          }} />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${divider}` }}>
            <div>
              <h2 className="text-[1rem] font-bold" style={{ color: text }}>New Campaign</h2>
              <p className="text-[0.72rem] mt-0.5" style={{ color: muted }}>
                Collect testimonials from your customers
              </p>
            </div>
            <button onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-60"
              style={{ background: inputBg, border: inputBdr }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" style={{ color: muted }} />
              </svg>
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-0 px-6 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-0">
                <button
                  onClick={() => i < step && setStep(i)}
                  className="flex items-center gap-2 text-[0.72rem] font-medium transition-opacity"
                  style={{ color: i === step ? '#7B6EF5' : i < step ? '#34D399' : muted, cursor: i < step ? 'pointer' : 'default' }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[0.6rem] font-bold"
                    style={{ background: i === step ? 'rgba(123,110,245,0.15)' : i < step ? 'rgba(52,211,153,0.12)' : 'transparent',
                             border: `1px solid ${i === step ? 'rgba(123,110,245,0.4)' : i < step ? 'rgba(52,211,153,0.3)' : divider}`,
                             color: i === step ? '#7B6EF5' : i < step ? '#34D399' : muted }}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {s}
                </button>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 h-px w-8" style={{ background: divider }} />
                )}
              </div>
            ))}
          </div>

          {/* Form body */}
          <div className="px-6 py-5 space-y-4" style={{ minHeight: 260 }}>

            {/* ── Step 0: Basics ── */}
            {step === 0 && (
              <motion.div className="space-y-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
                <div>
                  <label className={LABEL} style={{ color: muted }}>Campaign name *</label>
                  <input
                    type="text" value={name} onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Customer Love 2026"
                    autoFocus
                    className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30"
                    style={INPUT}
                  />
                </div>

                <div>
                  <label className={LABEL} style={{ color: muted }}>Campaign URL slug *</label>
                  <div className="flex items-center rounded-xl overflow-hidden" style={{ border: inputBdr }}>
                    <span className="px-3 py-3 text-[0.72rem] shrink-0 border-r" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: inputBdr, color: muted }}>
                      wytnest.io/submit/
                    </span>
                    <input
                      type="text" value={slug} onChange={e => handleSlugChange(e.target.value)}
                      placeholder="customer-love-2026"
                      className="flex-1 bg-transparent px-3 py-3 text-[0.85rem] placeholder:opacity-30 outline-none"
                      style={{ color: text }}
                    />
                  </div>
                  <p className="mt-1.5 text-[0.68rem]" style={{ color: muted }}>Auto-generated · customers will submit via this link</p>
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Prompt ── */}
            {step === 1 && (
              <motion.div className="space-y-4" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>
                <div>
                  <label className={LABEL} style={{ color: muted }}>Prompt heading *</label>
                  <input
                    type="text" value={heading} onChange={e => setHeading(e.target.value)}
                    placeholder="Share your experience"
                    autoFocus
                    className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30"
                    style={INPUT}
                  />
                  <p className="mt-1.5 text-[0.68rem]" style={{ color: muted }}>The headline your customer sees on the submission page</p>
                </div>

                <div>
                  <label className={LABEL} style={{ color: muted }}>Prompt description <span className="opacity-50">(optional)</span></label>
                  <textarea
                    value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Tell us how we helped you and what you liked most…"
                    rows={3}
                    className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30 resize-none"
                    style={{ ...INPUT, lineHeight: 1.6 }}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Settings ── */}
            {step === 2 && (
              <motion.div className="space-y-5" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>

                {/* Testimonial types */}
                <div>
                  <p className={LABEL} style={{ color: muted }}>Testimonial types</p>
                  <div className="flex flex-col gap-3">
                    {/* Text toggle */}
                    <label className="flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer"
                           style={{ background: inputBg, border: inputBdr }}>
                      <div>
                        <p className="text-[0.82rem] font-medium" style={{ color: text }}>Text testimonials</p>
                        <p className="text-[0.68rem]" style={{ color: muted }}>Written review with star rating</p>
                      </div>
                      <Toggle checked={allowText} onChange={setAllowText} />
                    </label>

                    {/* Video toggle */}
                    <label className={`flex items-center justify-between rounded-xl px-4 py-3 ${videoAllowed ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                           style={{ background: inputBg, border: inputBdr }}>
                      <div>
                        <p className="text-[0.82rem] font-medium" style={{ color: text }}>Video testimonials</p>
                        <p className="text-[0.68rem]" style={{ color: muted }}>
                          {videoAllowed ? 'Record or upload a short video' : 'Starter plan and above · upgrade to unlock'}
                        </p>
                      </div>
                      <Toggle checked={allowVideo && videoAllowed} onChange={v => videoAllowed && setAllowVideo(v)} />
                    </label>

                    {/* Max seconds — only if video enabled */}
                    {allowVideo && videoAllowed && (
                      <div className="rounded-xl px-4 py-3" style={{ background: inputBg, border: inputBdr }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[0.78rem] font-medium" style={{ color: text }}>Max video length</p>
                          <span className="text-[0.72rem] font-semibold" style={{ color: '#7B6EF5' }}>{maxSecs}s</span>
                        </div>
                        <input type="range" min={30} max={300} step={15} value={maxSecs}
                          onChange={e => setMaxSecs(Number(e.target.value))}
                          className="w-full accent-[#7B6EF5]" />
                        <div className="flex justify-between mt-1">
                          <span className="text-[0.62rem]" style={{ color: muted }}>30s</span>
                          <span className="text-[0.62rem]" style={{ color: muted }}>5min</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thank you message */}
                <div>
                  <label className={LABEL} style={{ color: muted }}>Thank you message</label>
                  <textarea
                    value={thankYou} onChange={e => setThankYou(e.target.value)}
                    rows={2}
                    className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30 resize-none"
                    style={{ ...INPUT, lineHeight: 1.6 }}
                  />
                </div>

                {/* Redirect URL */}
                <div>
                  <label className={LABEL} style={{ color: muted }}>Redirect after submission <span className="opacity-50">(optional)</span></label>
                  <input
                    type="url" value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)}
                    placeholder="https://yourwebsite.com/thank-you"
                    className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30"
                    style={INPUT}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-3 rounded-lg px-3 py-2 text-[0.75rem]"
              style={{ background: 'rgba(248,71,71,0.08)', border: '1px solid rgba(248,71,71,0.2)', color: '#F87171' }}>
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${divider}` }}>
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="px-4 py-2 rounded-xl text-[0.82rem] font-medium transition-opacity hover:opacity-70"
              style={{ color: muted, background: inputBg, border: inputBdr }}>
              {step === 0 ? 'Cancel' : '← Back'}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-bold disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(123,110,245,0.9), rgba(79,63,204,0.9))', color: '#fff' }}>
                Continue →
              </button>
            ) : (
              <motion.button
                onClick={submit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[0.85rem] font-bold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {loading ? (
                  <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round"/>
                  </svg>
                ) : <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Create Campaign
                </>}
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-all duration-300"
      style={{ background: checked ? '#7B6EF5' : 'rgba(123,110,245,0.15)', border: `1px solid ${checked ? '#7B6EF5' : 'rgba(123,110,245,0.2)'}` }}
    >
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-300"
        style={{ left: checked ? 'calc(100% - 22px)' : '1px' }} />
    </button>
  )
}
