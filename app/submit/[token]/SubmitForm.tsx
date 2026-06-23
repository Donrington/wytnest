'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Step = 'choose' | 'record' | 'details' | 'done'

interface Props {
  campaignId: string
  workspaceId: string
  tokenId: string | null
  heading: string
  body: string | null
  allowVideo: boolean
  allowText: boolean
  thankYouMessage: string
  redirectUrl: string | null
  campaignName: string
}

export function SubmitForm({
  campaignId, workspaceId, tokenId,
  heading, body, allowVideo, allowText,
  thankYouMessage, redirectUrl, campaignName,
}: Props) {
  const [step, setStep]     = useState<Step>('choose')
  const [mode, setMode]     = useState<'video' | 'text'>('text')
  const [rating, setRating] = useState(5)
  const [name, setName]     = useState('')
  const [roleCompany, setRoleCompany] = useState('')
  const [text, setText]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  // If only one mode is allowed, skip the choose step
  const onlyMode: 'video' | 'text' | null =
    allowVideo && !allowText ? 'video' :
    !allowVideo && allowText  ? 'text'  : null

  const startSubmit = (m: 'video' | 'text') => {
    setMode(m)
    setStep(m === 'video' ? 'record' : 'details')
  }

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (mode === 'text' && !text.trim()) { setError('Please write your testimonial.'); return }

    // parse role / company from "Role, Company" or "Role at Company"
    const [rolePart, companyPart] = roleCompany.split(/,| at /i).map(s => s.trim())

    setSubmitting(true)
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id:  campaignId,
        workspace_id: workspaceId,
        token_id:     tokenId,
        name:         name.trim(),
        role:         rolePart || null,
        company:      companyPart || null,
        rating,
        text_content: mode === 'text' ? text.trim() : null,
        type:         mode,
      }),
    })
    setSubmitting(false)

    if (!res.ok) {
      const json = await res.json()
      setError(json.error ?? 'Something went wrong. Please try again.')
      return
    }

    setStep('done')
    if (redirectUrl) {
      setTimeout(() => { window.location.href = redirectUrl }, 3000)
    }
  }

  const STEPS: Step[] = onlyMode ? ['details', 'done'] : ['choose', mode === 'video' ? 'record' : 'details', 'done']
  const stepIdx = STEPS.indexOf(step)

  return (
    <main className="min-h-screen bg-paper">
      {/* Branded header */}
      <header className="border-b border-paper-border bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-600">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="2" fill="#E8960F" />
              </svg>
            </span>
            <span className="text-sm font-medium text-carbon-500">
              Collected securely by <span className="font-semibold text-carbon-900">Wytnest</span>
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Progress bar */}
        {step !== 'done' && (
          <div className="mb-10 flex items-center gap-2">
            {STEPS.filter(s => s !== 'done').map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-500',
                  stepIdx > i ? 'bg-ink-600' : stepIdx === i ? 'bg-ink-400' : 'bg-carbon-100',
                )}
              />
            ))}
          </div>
        )}

        {/* ── Choose mode ── */}
        {step === 'choose' && (
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-800">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              {campaignName}
            </div>
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">{heading}</h1>
            {body && <p className="mx-auto mt-3 max-w-md text-carbon-600">{body}</p>}

            <div className={cn('mt-10 grid gap-4', allowVideo && allowText ? 'sm:grid-cols-2' : '')}>
              {allowVideo && (
                <button
                  onClick={() => startSubmit('video')}
                  className="group rounded-2xl border border-paper-border bg-white p-8 text-left transition-all hover:border-ink-600 hover:shadow-xl hover:shadow-ink-900/5"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-ink-600 transition-colors group-hover:bg-ink-600 group-hover:text-white">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M16 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-carbon-900">Record a video</h3>
                  <p className="mt-1 text-sm text-carbon-500">Most authentic. Records right in your browser.</p>
                </button>
              )}
              {allowText && (
                <button
                  onClick={() => startSubmit('text')}
                  className="group rounded-2xl border border-paper-border bg-white p-8 text-left transition-all hover:border-ink-600 hover:shadow-xl hover:shadow-ink-900/5"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600 transition-colors group-hover:bg-gold-400 group-hover:text-gold-900">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-carbon-900">Write it out</h3>
                  <p className="mt-1 text-sm text-carbon-500">Quick and easy. Just type a few sentences.</p>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Record video (placeholder — video pipeline wired separately) ── */}
        {step === 'record' && (
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">Record your video</h1>
            <p className="mt-3 text-carbon-600">Look into the camera and speak naturally. You can re-record anytime.</p>

            <div className="mt-8 flex aspect-video items-center justify-center rounded-3xl border border-paper-border bg-carbon-900">
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="6" fill="#E24B4A" />
                  </svg>
                </span>
                <p className="mt-4 text-sm text-carbon-400">Tap to allow camera access</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setStep('choose')} className="rounded-full border border-carbon-200 bg-white px-6 py-3 text-sm font-medium text-carbon-700 transition-colors hover:bg-carbon-50">
                Back
              </button>
              <button onClick={() => setStep('details')} className="rounded-full bg-ink-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-800">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Details ── */}
        {step === 'details' && (
          <div>
            <h1 className="text-center font-display text-3xl font-extrabold text-carbon-900">
              {mode === 'video' ? 'Almost done' : heading}
            </h1>
            {mode === 'text' && body && (
              <p className="mt-3 text-center text-carbon-600">{body}</p>
            )}

            <div className="mt-8 space-y-5">
              {mode === 'text' && (
                <Field label="Your testimonial *">
                  <textarea
                    rows={4}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="What did you love? Be specific — it helps others decide."
                    className="w-full resize-none rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10"
                  />
                </Field>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name *">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Adaeze Okonkwo"
                    className="w-full rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10"
                  />
                </Field>
                <Field label="Role & company">
                  <input
                    type="text"
                    value={roleCompany}
                    onChange={e => setRoleCompany(e.target.value)}
                    placeholder="CEO, Acme Inc"
                    className="w-full rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10"
                  />
                </Field>
              </div>

              <Field label="Rating">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setRating(n)}
                      className={cn('transition-transform hover:scale-110', n <= rating ? 'text-gold-400' : 'text-carbon-200')}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex gap-3">
              {!onlyMode && (
                <button
                  onClick={() => setStep(mode === 'video' ? 'record' : 'choose')}
                  className="rounded-full border border-paper-border bg-white px-6 py-3.5 text-sm font-medium text-carbon-700 transition-colors hover:bg-carbon-50"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-full bg-ink-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit testimonial'}
              </button>
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="#16A660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">Thank you!</h1>
            <p className="mx-auto mt-3 max-w-md text-carbon-600">{thankYouMessage}</p>
            {redirectUrl && (
              <p className="mt-4 text-xs text-carbon-400">Redirecting you shortly…</p>
            )}
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-carbon-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="2" fill="#E8960F" />
                </svg>
              </span>
              Powered by Wytnest
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-carbon-700">{label}</label>
      {children}
    </div>
  )
}
