'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type AuthUser = { name: string; email: string; initials: string }

const NAV_LINKS = [
  { label: 'Widgets',      href: '#widgets' },
  { label: 'How it works', href: '#how'     },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'FAQ',          href: '#faq'     },
]

// ── Shared easing ─────────────────────────────────────────────────────────────
const E_OUT:  [number,number,number,number] = [0.16, 1, 0.3, 1]
const E_IN:   [number,number,number,number] = [0.4, 0, 1, 1]
const SPRING  = { type: 'spring', bounce: 0.18, duration: 0.36 } as const

// ── Mobile overlay variants ────────────────────────────────────────────────────
// Curtain wipe: enters top-to-bottom, exits collapsing upward
const curtain: Variants = {
  hidden:  { clipPath: 'inset(0 0 100% 0)' },
  visible: { clipPath: 'inset(0 0 0% 0)',    transition: { duration: 0.55, ease: E_OUT } },
  exit:    { clipPath: 'inset(100% 0 0 0)',  transition: { duration: 0.38, ease: E_IN  } },
}

const overlayGlow: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.25 } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

// Stagger container for the link list
const listStagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.25 } },
  exit:    { transition: { staggerChildren: 0.04,  staggerDirection: -1, delayChildren: 0 } },
}

// Each link: slides in from right, exits left
const linkItem: Variants = {
  hidden:  { x: 32, opacity: 0 },
  visible: { x: 0,  opacity: 1, transition: { duration: 0.55, ease: E_OUT } },
  exit:    { x: -20, opacity: 0, transition: { duration: 0.22, ease: E_IN  } },
}

// CTA button at the bottom
const ctaItem: Variants = {
  hidden:  { y: 18, opacity: 0, scale: 0.95 },
  visible: { y: 0,  opacity: 1, scale: 1,  transition: { duration: 0.52, ease: E_OUT } },
  exit:    { y: 10, opacity: 0,             transition: { duration: 0.18 } },
}

// Footer meta
const footerItem: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.55 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}

// Header row (logo + close)
const headerItem: Variants = {
  hidden:  { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: E_OUT, delay: 0.08 } },
  exit:    { opacity: 0,       transition: { duration: 0.15 } },
}

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <a href="/" className="group flex shrink-0 items-center gap-2">
      <motion.span
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink-600 ring-1 ring-ink-400/40"
        whileHover={{ scale: 1.12, rotate: -6 }}
        transition={SPRING}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="2" fill="#E8960F" />
        </svg>
      </motion.span>
      <span className="text-[1rem] font-extrabold tracking-tight text-carbon-50">
        wyt<span className="font-light text-carbon-300">nest</span>
      </span>
    </a>
  )
}

// ── Mobile overlay ────────────────────────────────────────────────────────────
function MobileOverlay({ onClose, authUser, logoUrl, onSignOut }: {
  onClose: () => void
  authUser: AuthUser | null
  logoUrl: string | null
  onSignOut: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[90]"
      variants={curtain}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ background: 'linear-gradient(175deg, #0E0C20 0%, #07060F 100%)' }}
    >
      {/* Ambient violet glow — fades in after curtain */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        variants={overlayGlow}
        style={{
          background:
            'radial-gradient(700px 500px at 88% 8%,  rgba(79,63,204,0.24), transparent 60%),' +
            'radial-gradient(600px 400px at 10% 94%, rgba(79,63,204,0.14), transparent 60%)',
        }}
      />

      <div className="relative flex h-full flex-col px-7 pt-7 pb-10">

        {/* Header */}
        <motion.div
          className="flex items-center justify-between"
          variants={headerItem}
        >
          <Logo />
          <motion.button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200/20 bg-ink-200/[0.05] text-carbon-300"
            whileHover={{ scale: 1.08, backgroundColor: 'rgba(176,168,252,0.1)' }}
            whileTap={{ scale: 0.93, rotate: 90 }}
            transition={SPRING}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col justify-center">
          <motion.ul
            className="flex flex-col"
            variants={listStagger}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {[...NAV_LINKS, authUser
              ? { label: 'Dashboard', href: '/dashboard' }
              : { label: 'Sign in',   href: '/login'     },
            ].map((l) => (
              <motion.li
                key={l.label}
                className="border-b border-ink-200/[0.08]"
                variants={linkItem}
              >
                <motion.a
                  href={l.href}
                  onClick={onClose}
                  className="group flex items-center justify-between py-5 text-carbon-50"
                  whileHover="hovered"
                >
                  <motion.span
                    className="font-black tracking-tight"
                    style={{ fontSize: 'clamp(28px,8vw,48px)', lineHeight: 1 }}
                    variants={{ hovered: { x: 10, transition: { duration: 0.3, ease: E_OUT } } }}
                  >
                    {l.label}
                  </motion.span>
                  <motion.span
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200/15 text-carbon-500"
                    variants={{
                      hovered: {
                        borderColor: 'rgba(123,110,245,0.55)',
                        color: '#7B6EF5',
                        scale: 1.1,
                        transition: SPRING,
                      },
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </motion.span>
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>

          {/* CTA */}
          <motion.a
            href={authUser ? '/dashboard' : '/signup'}
            onClick={onClose}
            className="group relative mt-8 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full font-bold text-base"
            style={{ background: '#E8960F', color: '#0A0917' }}
            variants={ctaItem}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={SPRING}
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/20 transition-transform duration-700 ease-out group-hover:translate-x-[200%]" />
            {authUser ? (
              <>
                {logoUrl ? (
                  <img src={logoUrl} alt="Avatar" className="relative h-7 w-7 rounded-full object-cover ring-1 ring-black/20" />
                ) : (
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-[0.72rem] font-black">
                    {authUser.initials}
                  </span>
                )}
                <span className="relative">Go to dashboard</span>
              </>
            ) : (
              <>
                <span className="relative">Start collecting free</span>
                <svg className="relative" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </motion.a>

          {/* Sign out — only when logged in */}
          {authUser && (
            <motion.button
              onClick={() => { onSignOut(); onClose() }}
              className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-[0.82rem] font-medium text-carbon-600 transition-colors hover:text-carbon-400"
              variants={ctaItem}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                      stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sign out
            </motion.button>
          )}
        </nav>

        {/* Footer meta */}
        <motion.div
          className="flex justify-between text-[10.5px] font-semibold uppercase tracking-[0.2em] text-carbon-700"
          variants={footerItem}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <span>Lagos, NG</span>
          <span>Testimonial SaaS</span>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Pill helpers ──────────────────────────────────────────────────────────────
const PILL_BASE: React.CSSProperties = {
  backdropFilter: 'blur(18px)',
  WebkitBackdropFilter: 'blur(18px)',
}

function pillAnimate(scrolled: boolean) {
  return {
    borderColor:     scrolled ? 'rgba(123,110,245,0.32)' : 'rgba(176,168,252,0.13)',
    backgroundColor: scrolled ? 'rgba(10,9,23,0.94)'     : 'rgba(10,9,23,0.72)',
    boxShadow: scrolled
      ? '0 0 0 1px rgba(123,110,245,0.13), 0 8px 36px -8px rgba(0,0,0,0.9), 0 0 52px -20px rgba(79,63,204,0.4)'
      : '0 2px 16px -6px rgba(0,0,0,0.35)',
  }
}

// Pill entrance: staggered slide-down on mount
const pillEnter = (delay: number): Variants => ({
  hidden:  { opacity: 0, y: -14, scale: 0.96 },
  visible: { opacity: 1, y: 0,   scale: 1,   transition: { duration: 0.75, delay, ease: E_OUT } },
})

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [hoveredLink, setHoveredLink] = useState<string | null>(null)
  const [authUser,    setAuthUser]    = useState<AuthUser | null>(null)
  const [logoUrl,     setLogoUrl]     = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 44)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('wytnest-auth-user')
      if (cached) { setAuthUser(JSON.parse(cached)) }
      const cachedLogo = sessionStorage.getItem('wytnest-logo-url')
      if (cachedLogo) { setLogoUrl(cachedLogo); if (cached) return }
    } catch {}
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const name = (data.user.user_metadata?.full_name as string | undefined)
        || data.user.email?.split('@')[0]
        || 'User'
      const email = data.user.email ?? ''
      const initials = name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
      const u: AuthUser = { name, email, initials }
      setAuthUser(u)
      try { sessionStorage.setItem('wytnest-auth-user', JSON.stringify(u)) } catch {}
      // Fetch workspace logo_url
      supabase
        .from('workspace_members')
        .select('workspace:workspaces(logo_url)')
        .eq('user_id', data.user.id)
        .not('accepted_at', 'is', null)
        .limit(1)
        .single()
        .then(({ data: wData }) => {
          const url = (wData?.workspace as any)?.logo_url as string | null | undefined
          if (url) {
            setLogoUrl(url)
            try { sessionStorage.setItem('wytnest-logo-url', url) } catch {}
          }
        })
    })
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return
    const handle = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [profileOpen])

  const handleSignOut = async () => {
    try { sessionStorage.removeItem('wytnest-auth-user') } catch {}
    await createClient().auth.signOut()
    window.location.href = '/'
  }

  const scrollTx = { duration: 0.45, ease: E_OUT }

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-2">

          {/* ── Logo pill — desktop ── */}
          <motion.div
            className="hidden h-12 items-center rounded-full border px-4 md:flex"
            style={PILL_BASE}
            variants={pillEnter(0.08)}
            initial="hidden"
            animate={['visible', pillAnimate(scrolled) as any]}
            transition={scrollTx}
          >
            <Logo />
          </motion.div>

          {/* ── Nav pill — desktop ── */}
          <motion.nav
            className="hidden h-12 items-center rounded-full border px-1.5 md:flex"
            style={PILL_BASE}
            variants={pillEnter(0.16)}
            initial="hidden"
            animate={['visible', pillAnimate(scrolled) as any]}
            transition={scrollTx}
            aria-label="Primary navigation"
            onMouseLeave={() => setHoveredLink(null)}
          >
            {[...NAV_LINKS, authUser
              ? { label: 'Dashboard', href: '/dashboard' }
              : { label: 'Sign in',   href: '/login'     },
            ].map((l, i) => (
              <div key={l.href} className="flex items-center">
                {i > 0 && <span className="h-4 w-px bg-ink-200/[0.12]" aria-hidden="true" />}
                <a
                  href={l.href}
                  className={cn(
                    'relative inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium transition-colors duration-150',
                    hoveredLink === l.href ? 'text-carbon-50' : 'text-carbon-300',
                    l.label === 'Sign in' && 'text-carbon-500'
                  )}
                  onMouseEnter={() => setHoveredLink(l.href)}
                >
                  {/* Sliding hover pill — follows cursor via layoutId */}
                  {hoveredLink === l.href && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full bg-ink-200/[0.08]"
                      transition={SPRING}
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </a>
              </div>
            ))}
          </motion.nav>

          {/* ── CTA pill (logged out) / Avatar pill (logged in) — desktop ── */}
          {authUser ? (
            <div ref={profileRef} className="relative hidden md:block">
              <motion.button
                onClick={() => setProfileOpen(v => !v)}
                className="flex h-12 items-center gap-2.5 rounded-full border pl-1.5 pr-4 text-[13px] font-medium"
                style={{
                  ...PILL_BASE,
                  borderColor:     profileOpen ? 'rgba(123,110,245,0.45)' : 'rgba(176,168,252,0.13)',
                  backgroundColor: profileOpen ? 'rgba(10,9,23,0.94)'     : 'rgba(10,9,23,0.72)',
                  boxShadow: profileOpen
                    ? '0 0 0 1px rgba(123,110,245,0.13), 0 8px 36px -8px rgba(0,0,0,0.9)'
                    : '0 2px 16px -6px rgba(0,0,0,0.35)',
                }}
                variants={pillEnter(0.24)}
                initial="hidden"
                animate="visible"
                transition={scrollTx}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Avatar" className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-[0.62rem] font-black text-white ring-1 ring-white/10">
                    {authUser.initials}
                  </span>
                )}
                <span className="text-carbon-200">{authUser.name.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                     style={{ color: 'rgba(176,168,252,0.45)', transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-60 overflow-hidden rounded-2xl"
                    style={{
                      background:           'rgba(10,9,23,0.97)',
                      border:               '1px solid rgba(123,110,245,0.22)',
                      boxShadow:            '0 24px 80px -16px rgba(0,0,0,0.9), 0 0 0 1px rgba(123,110,245,0.08)',
                      backdropFilter:       'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    }}
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{    opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: E_OUT }}
                  >
                    {/* Profile card */}
                    <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {logoUrl ? (
                        <img src={logoUrl} alt="Avatar" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-black text-white">
                          {authUser.initials}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-[0.82rem] font-semibold text-carbon-50">{authUser.name}</p>
                        <p className="truncate text-[0.7rem] text-carbon-600">{authUser.email}</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1.5">
                      {[
                        { label: 'Dashboard', href: '/dashboard',          icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75"/></svg> },
                        { label: 'Settings',  href: '/dashboard/settings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg> },
                        { label: 'Billing',   href: '/dashboard/billing',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.75"/><path d="M2 10h20M6 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg> },
                      ].map(({ label, href, icon }) => (
                        <a
                          key={href}
                          href={href}
                          className="flex items-center gap-3 px-4 py-2.5 text-[0.82rem] text-carbon-300 transition-colors hover:bg-white/[0.04] hover:text-carbon-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="text-carbon-600">{icon}</span>
                          {label}
                        </a>
                      ))}
                      <div className="my-1.5 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                      <button
                        onClick={() => { handleSignOut(); setProfileOpen(false) }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-[0.82rem] text-left text-red-400 transition-colors hover:bg-white/[0.04]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.a
              href="/signup"
              className="group relative hidden h-12 items-center gap-2 overflow-hidden rounded-full px-5 text-[13px] font-bold md:inline-flex"
              style={{ background: '#E8960F', color: '#0A0917' }}
              variants={pillEnter(0.24)}
              initial="hidden"
              animate={{
                opacity: 1, y: 0, scale: 1,
                boxShadow: scrolled
                  ? '0 0 40px -8px rgba(232,150,15,0.65), 0 8px 24px -8px rgba(0,0,0,0.6)'
                  : '0 0 0px 0px transparent',
              }}
              transition={scrollTx}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/25 transition-transform duration-600 ease-out group-hover:translate-x-[200%]" />
              <span className="relative">Start free</span>
              <motion.svg
                className="relative"
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
                variants={{ hovered: { x: 2 } }}
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </motion.svg>
            </motion.a>
          )}

          {/* ── Mobile pill bar ── */}
          <motion.div
            className={cn(
              'flex h-12 w-[calc(100vw-2rem)] max-w-sm items-center justify-between gap-3 rounded-full border pl-4 pr-1.5 md:hidden',
              mobileOpen && 'pointer-events-none opacity-0'
            )}
            style={PILL_BASE}
            variants={pillEnter(0.1)}
            initial="hidden"
            animate={['visible', pillAnimate(scrolled) as any]}
            transition={{ ...scrollTx, opacity: { duration: 0.2 } }}
          >
            <Logo />
            <motion.button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: '#E8960F', color: '#0A0917' }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h10" />
              </svg>
            </motion.button>
          </motion.div>

        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <MobileOverlay
            onClose={() => setMobileOpen(false)}
            authUser={authUser}
            logoUrl={logoUrl}
            onSignOut={handleSignOut}
          />
        )}
      </AnimatePresence>
    </>
  )
}
