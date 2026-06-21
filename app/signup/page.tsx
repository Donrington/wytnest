'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Logo() {
  return (
    <a href="/" className="flex shrink-0 items-center gap-2.5">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: '#4F3FCC', boxShadow: '0 0 0 1px rgba(123,110,245,0.4)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="2" fill="#E8960F" />
        </svg>
      </span>
      <span className="text-[1rem] font-extrabold tracking-tight" style={{ color: '#E4E3F0' }}>
        wyt<span className="font-light" style={{ color: '#6F6C92' }}>nest</span>
      </span>
    </a>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
    </svg>
  )
}

const INPUT = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(123,110,245,0.2)',
  color: '#E4E3F0',
  outline: 'none',
} as React.CSSProperties

const PERKS = [
  {
    text: 'Up and running in under 10 minutes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Stopwatch */}
        <circle cx="12" cy="13" r="8"/>
        <path d="M12 9v4l2.5 2.5"/>
        <path d="M9.5 3h5"/>
        <path d="M12 3v2"/>
        <path d="M19.5 5.5l-1.5 1.5"/>
      </svg>
    ),
  },
  {
    text: 'No credit card required for free plan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Open padlock */}
        <rect x="3" y="11" width="18" height="11" rx="2.5"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
        <circle cx="12" cy="16.5" r="1.2" fill="currentColor" stroke="none"/>
        <path d="M12 16.5v2"/>
      </svg>
    ),
  },
  {
    text: 'Average 3× lift in landing page conversion',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Rising bar chart with arrow */}
        <path d="M3 20h18"/>
        <path d="M6 20v-5"/>
        <path d="M10 20v-9"/>
        <path d="M14 20v-13"/>
        <path d="M18 20V9"/>
        <path d="M14 7l4-4"/>
        <path d="M16 3h2v2"/>
      </svg>
    ),
  },
  {
    text: 'Built for African and global brands',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {/* Globe with meridians */}
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3c-2.8 3.2-4 6-4 9s1.2 5.8 4 9"/>
        <path d="M12 3c2.8 3.2 4 6 4 9s-1.2 5.8-4 9"/>
        <path d="M3.5 9h17"/>
        <path d="M3.5 15h17"/>
      </svg>
    ),
  },
]

export default function SignupPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [agreed,   setAgreed]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    setLoading(true)
    setTimeout(() => { window.location.href = '/dashboard' }, 900)
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: '#080716' }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position: 'absolute', top: '-20%', left: '-5%', width: 650, height: 650,
          background: 'radial-gradient(circle, rgba(79,63,204,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(232,150,15,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ── Left form panel ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 lg:px-16">
        <div className="mb-8 lg:hidden"><Logo /></div>

        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E_OUT }}
        >
          <div className="mb-7">
            <h1 className="font-display text-[1.75rem] font-bold tracking-tight" style={{ color: '#E4E3F0' }}>
              Start collecting proof
            </h1>
            <p className="mt-1 text-[0.82rem]" style={{ color: '#6F6C92' }}>
              Free forever on the Starter plan · no card required.
            </p>
          </div>

          {/* Google */}
          <button type="button"
            className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl py-3 text-[0.82rem] font-medium transition-opacity hover:opacity-75"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,110,245,0.18)', color: '#E4E3F0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(123,110,245,0.12)' }} />
            <span className="text-[0.63rem] font-medium" style={{ color: '#3E3B61' }}>or continue with email</span>
            <div className="h-px flex-1" style={{ background: 'rgba(123,110,245,0.12)' }} />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-medium" style={{ color: '#6F6C92' }}>Full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Sage Okonkwo" required
                className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30 focus:ring-2 focus:ring-[#7B6EF5]/25 transition-all"
                style={INPUT}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-medium" style={{ color: '#6F6C92' }}>Work email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30 focus:ring-2 focus:ring-[#7B6EF5]/25 transition-all"
                style={INPUT}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] font-medium" style={{ color: '#6F6C92' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-[0.85rem] placeholder:opacity-30 focus:ring-2 focus:ring-[#7B6EF5]/25 transition-all"
                  style={INPUT}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ color: '#3E3B61' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => {
                    const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : 1
                    return (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                           style={{ background: i < strength
                             ? (strength >= 4 ? '#34D399' : strength >= 3 ? '#7B6EF5' : strength >= 2 ? '#E8960F' : '#F87171')
                             : 'rgba(123,110,245,0.12)' }} />
                    )
                  })}
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <label className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  className="sr-only" />
                <div className="h-4 w-4 rounded transition-all"
                     style={agreed
                       ? { background: '#4F3FCC', border: '1px solid #7B6EF5' }
                       : { background: 'transparent', border: '1px solid rgba(123,110,245,0.3)' }}>
                  {agreed && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="mx-auto mt-0.5">
                      <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[0.73rem] leading-relaxed" style={{ color: '#6F6C92' }}>
                I agree to the{' '}
                <a href="/terms" className="font-medium" style={{ color: '#7B6EF5' }}>Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="font-medium" style={{ color: '#7B6EF5' }}>Privacy Policy</a>
              </span>
            </label>

            <motion.button
              type="submit" disabled={loading || !agreed}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.85rem] font-bold disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              whileHover={{ scale: loading || !agreed ? 1 : 1.02 }}
              whileTap={{ scale: loading || !agreed ? 1 : 0.97 }}
            >
              {loading ? (
                <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round"/>
                </svg>
              ) : (
                <>Create free account
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[0.78rem]" style={{ color: '#6F6C92' }}>
            Already have an account?{' '}
            <a href="/login" className="font-semibold" style={{ color: '#7B6EF5' }}>Sign in →</a>
          </p>
        </motion.div>
      </div>

      {/* ── Right perks panel ── */}
      <div className="relative hidden flex-col justify-between p-14 lg:flex lg:w-[46%]"
           style={{ borderLeft: '1px solid rgba(123,110,245,0.1)' }}>
        <div className="flex justify-end"><Logo /></div>

        <div>
          <motion.p
            className="font-mono text-[0.6rem] tracking-[0.22em] uppercase mb-4"
            style={{ color: '#3E3B61' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            Trusted by 800+ brands
          </motion.p>

          <h2 className="font-display font-black leading-[1.08] tracking-tight"
              style={{ fontSize: 'clamp(1.9rem,3.4vw,2.6rem)', color: '#E4E3F0' }}>
            Everything you need.<br />
            <span style={{ color: '#6F6C92', fontWeight: 400 }}>Nothing you don&apos;t.</span>
          </h2>

          <div className="mt-10 flex flex-col gap-5">
            {PERKS.map((p, i) => (
              <motion.div key={i} className="flex items-center gap-4"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.28 + i * 0.08, ease: E_OUT }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                     style={{ background: 'rgba(79,63,204,0.12)', border: '1px solid rgba(123,110,245,0.14)', color: '#7B6EF5' }}>
                  {p.icon}
                </div>
                <p className="text-[0.83rem]" style={{ color: '#9897B3' }}>{p.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Pricing nudge */}
          <motion.div
            className="mt-10 rounded-2xl p-5"
            style={{ background: 'rgba(232,150,15,0.06)', border: '1px solid rgba(232,150,15,0.15)' }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.65, ease: E_OUT }}>
            <p className="text-[0.72rem] font-semibold" style={{ color: '#E8960F' }}>
              FREE PLAN INCLUDES
            </p>
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {['Up to 25 testimonials', '1 active campaign', 'All 3 widget types', 'Unlimited embed views'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[0.78rem]" style={{ color: '#9897B3' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="#34D399" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <p className="text-[0.65rem]" style={{ color: '#3E3B61' }}>© 2026 Wytnest · Built by Cybersage </p>
      </div>
    </div>
  )
}
