'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Step = 'choose' | 'record' | 'details' | 'done'

export default function SubmitPage() {
  const [step, setStep] = useState<Step>('choose')
  const [mode, setMode] = useState<'video' | 'text'>('text')

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
        {/* Progress */}
        <div className="mb-10 flex items-center gap-2">
          {['choose', 'record', 'details', 'done'].map((s, i) => (
            <div
              key={s}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-500',
                ['choose', 'record', 'details', 'done'].indexOf(step) >= i ? 'bg-ink-600' : 'bg-carbon-100'
              )}
            />
          ))}
        </div>

        {step === 'choose' && (
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-800">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> Stackr would love your feedback
            </div>
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">
              Share your experience
            </h1>
            <p className="mx-auto mt-3 max-w-md text-carbon-600">
              It takes less than two minutes. Your words help others discover what you already know.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => { setMode('video'); setStep('record') }}
                className="group rounded-2xl border border-paper-border bg-white p-8 text-left transition-all hover:border-ink-600 hover:shadow-xl hover:shadow-ink-900/5"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 text-ink-600 transition-colors group-hover:bg-ink-600 group-hover:text-white">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M16 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h3 className="font-semibold text-carbon-900">Record a video</h3>
                <p className="mt-1 text-sm text-carbon-500">Most authentic. Records right in your browser.</p>
              </button>

              <button
                onClick={() => { setMode('text'); setStep('details') }}
                className="group rounded-2xl border border-paper-border bg-white p-8 text-left transition-all hover:border-ink-600 hover:shadow-xl hover:shadow-ink-900/5"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600 transition-colors group-hover:bg-gold-400 group-hover:text-gold-900">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                </div>
                <h3 className="font-semibold text-carbon-900">Write it out</h3>
                <p className="mt-1 text-sm text-carbon-500">Quick and easy. Just type a few sentences.</p>
              </button>
            </div>
          </div>
        )}

        {step === 'record' && (
          <div className="text-center">
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">Record your video</h1>
            <p className="mt-3 text-carbon-600">Look into the camera and speak naturally. You can re-record anytime.</p>

            <div className="mt-8 flex aspect-video items-center justify-center rounded-3xl border border-paper-border bg-carbon-900">
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="6" fill="#E24B4A" /></svg>
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

        {step === 'details' && (
          <div>
            <h1 className="text-center font-display text-3xl font-extrabold text-carbon-900">
              {mode === 'video' ? 'Almost done' : 'Tell us your story'}
            </h1>
            <p className="mt-3 text-center text-carbon-600">A few details so your testimonial shines.</p>

            <div className="mt-8 space-y-5">
              {mode === 'text' && (
                <Field label="Your testimonial">
                  <textarea
                    rows={4}
                    placeholder="What did you love? Be specific — it helps others decide."
                    className="w-full resize-none rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10"
                  />
                </Field>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name">
                  <input type="text" placeholder="Adaeze Okonkwo" className="w-full rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10" />
                </Field>
                <Field label="Role & company">
                  <input type="text" placeholder="CEO, Stackr" className="w-full rounded-xl border border-paper-border bg-white px-4 py-3 text-sm text-carbon-900 outline-none transition-all placeholder:text-carbon-300 focus:border-ink-600 focus:ring-4 focus:ring-ink-600/10" />
                </Field>
              </div>
              <Field label="Rating">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <button key={i} className="text-gold-400 transition-transform hover:scale-110">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 16.8 5.9 20.5l1.7-6.9L2.3 9l7-.5L12 2z" /></svg>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <button
              onClick={() => setStep('done')}
              className="mt-8 w-full rounded-full bg-ink-600 py-3.5 text-sm font-medium text-white transition-colors hover:bg-ink-800"
            >
              Submit testimonial
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#16A660" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-carbon-900">Thank you!</h1>
            <p className="mx-auto mt-3 max-w-md text-carbon-600">
              Your testimonial means the world to us. It&apos;ll appear on our site shortly.
            </p>
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-carbon-400">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-600">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="2" fill="#E8960F" /></svg>
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
