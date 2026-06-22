'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

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

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    window.location.href = '/dashboard'
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: '#080716' }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(79,63,204,0.20) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(232,150,15,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* ── Left brand panel ── */}
      <div className="relative hidden flex-col justify-between p-14 lg:flex lg:w-[52%]"
           style={{ borderRight: '1px solid rgba(123,110,245,0.1)' }}>
        <Logo />

        <div>
          <motion.h2
            className="font-display font-black leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(2.4rem,4.2vw,3.2rem)', color: '#E4E3F0' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: E_OUT }}
          >
            Proof that<br />
            <span style={{
              background: 'linear-gradient(100deg, #B0A8FC 0%, #7B6EF5 45%, #E8960F 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              people believe.
            </span>
          </motion.h2>
          <p className="mt-4 max-w-sm text-[0.88rem] leading-relaxed" style={{ color: '#6F6C92' }}>
            The testimonial platform that turns your happy customers into your most powerful sales asset.
          </p>

          {/* Stats */}
          <div className="mt-10 flex gap-10">
            {[
              { value: '12,400+', label: 'Testimonials collected' },
              { value: '94%',     label: 'Approval rate'          },
              { value: '3×',      label: 'Avg. conversion lift'   },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.07, ease: E_OUT }}>
                <p className="font-display text-[1.55rem] font-black" style={{ color: '#E4E3F0' }}>{s.value}</p>
                <p className="text-[0.65rem] font-medium" style={{ color: '#3E3B61' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Sample testimonial */}
          <motion.div
            className="mt-10 max-w-sm rounded-2xl p-5"
            style={{ background: 'rgba(12,10,26,0.72)', border: '1px solid rgba(123,110,245,0.15)', backdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.42, ease: E_OUT }}
          >
            <div className="mb-3 flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="11" height="11" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                        fill="#E8960F" stroke="#E8960F" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              ))}
            </div>
            <p className="text-[0.8rem] italic leading-relaxed" style={{ color: '#9897B3' }}>
              "Wytnest replaced 3 tools in our stack. Our landing page conversion went from 2.1% to 6.8% in six weeks."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full text-[0.62rem] font-bold text-white"
                   style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
                FA
              </div>
              <div>
                <p className="text-[0.75rem] font-semibold" style={{ color: '#E4E3F0' }}>Femi Adeyemi</p>
                <p className="text-[0.63rem]" style={{ color: '#6F6C92' }}>CEO, BuildWave HQ</p>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-[0.65rem]" style={{ color: '#3E3B61' }}>© 2026 Wytnest · Built by Cybersage</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-14 lg:px-16">
        <div className="mb-8 lg:hidden"><Logo /></div>

        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: E_OUT }}
        >
          <div className="mb-7">
            <h1 className="font-display text-[1.75rem] font-bold tracking-tight" style={{ color: '#E4E3F0' }}>
              Welcome back
            </h1>
            <p className="mt-1 text-[0.82rem]" style={{ color: '#6F6C92' }}>
              Sign in to your Wytnest account.
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
              <label className="text-[0.72rem] font-medium" style={{ color: '#6F6C92' }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                className="rounded-xl px-4 py-3 text-[0.85rem] placeholder:opacity-30 focus:ring-2 focus:ring-[#7B6EF5]/25 transition-all"
                style={INPUT}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[0.72rem] font-medium" style={{ color: '#6F6C92' }}>Password</label>
                <a href="#" className="text-[0.68rem] font-medium" style={{ color: '#7B6EF5' }}>Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-[0.85rem] placeholder:opacity-30 focus:ring-2 focus:ring-[#7B6EF5]/25 transition-all"
                  style={INPUT}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                  style={{ color: '#3E3B61' }}>
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg px-3 py-2 text-[0.75rem]"
                 style={{ background: 'rgba(248,71,71,0.08)', border: '1px solid rgba(248,71,71,0.2)', color: '#F87171' }}>
                {error}
              </p>
            )}

            <motion.button
              type="submit" disabled={loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[0.85rem] font-bold disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round"/>
                </svg>
              ) : (
                <>Sign in
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[0.78rem]" style={{ color: '#6F6C92' }}>
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-semibold" style={{ color: '#7B6EF5' }}>Sign up free →</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
