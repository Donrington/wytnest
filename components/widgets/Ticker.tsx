'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion'
import { MOCK_TESTIMONIALS, type MockTestimonial } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SPRING = { type: 'spring', bounce: 0.18, duration: 0.36 } as const
const SLIDE_INTERVAL = 5000

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(79,63,204,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

// ── Ticker ─────────────────────────────────────────────────────────────────────

function TickerTrack({ children }: { children: React.ReactNode }) {
  const baseX   = useMotionValue(0)
  const paused  = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (paused.current) return
    const el = trackRef.current
    if (!el) return
    const halfW = el.scrollWidth / 2
    const next  = baseX.get() - delta * 0.055
    baseX.set(next <= -halfW ? next + halfW : next)
  })

  return (
    <motion.div
      ref={trackRef}
      className="flex w-max gap-3.5"
      style={{ x: baseX }}
      onMouseEnter={() => { paused.current = true  }}
      onMouseLeave={() => { paused.current = false }}
    >
      {children}
    </motion.div>
  )
}

function TickerCard({
  t,
  dark,
  accent,
  radius,
}: {
  t:      MockTestimonial
  dark:   boolean
  accent: string
  radius: number
}) {
  const glow   = hexToRgba(accent, dark ? 0.28 : 0.14)
  const border = hexToRgba(accent, dark ? 0.20 : 0.12)
  const cr     = `${Math.max(radius, 4)}px`

  return (
    <div
      className="relative flex w-80 shrink-0 flex-col gap-3 overflow-hidden p-4"
      style={{
        borderRadius: cr,
        background: dark
          ? 'linear-gradient(155deg, rgba(28,24,58,0.70) 0%, rgba(13,11,30,0.75) 100%)'
          : 'linear-gradient(155deg, rgba(255,255,255,0.90) 0%, rgba(248,246,255,0.86) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: dark
          ? `0 0 0 1px ${border}, 0 8px 32px -12px rgba(0,0,0,0.7), 0 0 28px -14px ${glow}`
          : `0 0 0 1px ${border}, 0 4px 20px -6px rgba(0,0,0,0.09), 0 0 28px -14px ${glow}`,
      }}
    >
      {/* Top-edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: dark
            ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.14), transparent)'
            : 'linear-gradient(to right, transparent, rgba(255,255,255,0.92), transparent)',
        }}
      />

      {/* Open quote watermark */}
      <svg className="absolute right-4 top-3" style={{ opacity: dark ? 0.06 : 0.04 }} width="32" height="32" viewBox="0 0 24 24" fill={accent}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>

      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold tracking-[0.08em]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${accent}28, ${accent}08)`,
            boxShadow: `0 0 0 1px ${border}`,
            color: accent,
          }}
        >
          {initials(t.name)}
        </div>
        <div>
          <div
            className="text-[0.76rem] font-semibold"
            style={{ color: dark ? 'rgba(240,238,255,0.90)' : '#0F0D24' }}
          >
            {t.name}
          </div>
          <div
            className="text-[0.65rem]"
            style={{ color: dark ? 'rgba(155,152,190,0.70)' : '#7A77A0' }}
          >
            {t.company}
          </div>
        </div>
        <div className="ml-auto flex gap-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={accent}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>

      <p
        className="testimony line-clamp-2 text-[0.83rem] leading-snug"
        style={{ color: dark ? 'rgba(220,216,255,0.76)' : '#3D3A5C' }}
      >
        &ldquo;{t.quote}&rdquo;
      </p>
    </div>
  )
}

export function Ticker({
  dark   = true,
  accent = '#4F3FCC',
  radius = 12,
}: {
  dark?:   boolean
  accent?: string
  radius?: number
}) {
  const row = [...MOCK_TESTIMONIALS, ...MOCK_TESTIMONIALS]
  return (
    <div className="mask-fade-x overflow-hidden">
      <TickerTrack>
        {row.map((t, i) => (
          <TickerCard key={i} t={t} dark={dark} accent={accent} radius={radius} />
        ))}
      </TickerTrack>
    </div>
  )
}

// ── CinematicSlider ────────────────────────────────────────────────────────────

function NavButton({
  onClick,
  direction,
  dark,
  accent,
}: {
  onClick:   () => void
  direction: 'prev' | 'next'
  dark:      boolean
  accent:    string
}) {
  const glow = hexToRgba(accent, 0.35)
  return (
    <motion.button
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={
        dark
          ? {
              background:    'rgba(28,24,58,0.70)',
              border:        '1px solid rgba(176,168,252,0.12)',
              backdropFilter:'blur(12px)',
              color:         '#C4C0E0',
            }
          : {
              background:    'rgba(255,255,255,0.85)',
              border:        '1px solid rgba(0,0,0,0.10)',
              backdropFilter:'blur(12px)',
              color:         '#4B4870',
            }
      }
      whileHover={{ scale: 1.08, borderColor: glow, color: accent }}
      whileTap={{ scale: 0.93 }}
      transition={SPRING}
    >
      {direction === 'prev' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </motion.button>
  )
}

function Slide({
  t,
  dark,
  accent,
  radius,
}: {
  t:      MockTestimonial
  dark:   boolean
  accent: string
  radius: number
}) {
  const glow   = hexToRgba(accent, dark ? 0.30 : 0.18)
  const border = hexToRgba(accent, dark ? 0.10 : 0.12)
  const cr     = `${Math.max(radius, 4)}px`

  return (
    <div
      className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-10"
      style={{
        borderRadius: cr,
        background: dark
          ? 'linear-gradient(145deg, rgba(22,18,52,0.80) 0%, rgba(10,9,23,0.90) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(248,246,255,0.88) 100%)',
        border:    `1px solid ${dark ? 'rgba(176,168,252,0.10)' : border}`,
        boxShadow: dark
          ? `0 0 0 1px rgba(0,0,0,0.3), 0 0 80px -30px ${glow}`
          : `0 4px 32px -8px rgba(0,0,0,0.10), 0 0 60px -24px ${glow}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* Video placeholder */}
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl"
        style={{
          background: dark
            ? 'linear-gradient(140deg, rgba(20,16,50,1) 0%, rgba(30,18,60,0.8) 100%)'
            : 'linear-gradient(140deg, rgba(235,232,255,0.95) 0%, rgba(218,214,255,0.8) 100%)',
          boxShadow: `0 0 0 1px ${border}, 0 0 60px -20px ${glow}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(ellipse 80% 70% at 65% 30%, ${glow}, transparent 65%)` }}
        />
        {dark && (
          <>
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: '160px 160px',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)' }}
            />
          </>
        )}
        <motion.span
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background:    dark ? 'rgba(255,255,255,0.06)' : `${accent}18`,
            backdropFilter:'blur(8px)',
            boxShadow:     `0 0 0 1px ${dark ? 'rgba(255,255,255,0.10)' : border}, 0 0 40px -10px ${glow}`,
          }}
          whileHover={{ scale: 1.1 }}
          transition={SPRING}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={accent}><path d="M8 5v14l11-7z" /></svg>
        </motion.span>
      </div>

      {/* Quote content */}
      <div>
        <div className="mb-4 flex items-center gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={accent}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span className="ml-2 font-mono text-[0.65rem] tracking-widest" style={{ color: accent }}>5.0</span>
        </div>

        <svg
          className="mb-2"
          style={{ opacity: dark ? 0.20 : 0.12 }}
          width="28" height="28" viewBox="0 0 24 24" fill={accent}
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>

        <blockquote
          className="testimony text-[1.25rem] font-medium leading-snug"
          style={{ color: dark ? 'rgba(240,238,255,1)' : '#0F0D24' }}
        >
          {t.quote}
        </blockquote>

        <div className="mt-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${accent}28, ${accent}08)`,
              boxShadow:  `0 0 0 1px ${border}, inset 0 1px 0 ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
              color:      accent,
            }}
          >
            {initials(t.name)}
          </div>
          <div>
            <p className="font-semibold" style={{ color: dark ? 'rgba(240,238,255,1)' : '#0F0D24' }}>
              {t.name}
            </p>
            <p className="text-sm" style={{ color: dark ? 'rgba(155,152,190,0.85)' : '#7A77A0' }}>
              {t.role}, {t.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CinematicSlider({
  dark   = true,
  accent = '#4F3FCC',
  radius = 12,
}: {
  dark?:   boolean
  accent?: string
  radius?: number
}) {
  const [active,    setActive]    = useState(0)
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const total = MOCK_TESTIMONIALS.length

  useEffect(() => {
    if (isHovered) return
    const id = setTimeout(() => {
      setDirection(1)
      setActive((prev) => (prev + 1) % total)
    }, SLIDE_INTERVAL)
    return () => clearTimeout(id)
  }, [active, isHovered, total])

  const go = (dir: number) => {
    const next = (active + dir + total) % total
    setDirection(dir)
    setActive(next)
  }

  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 52 : -52 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.52, ease: E_OUT } },
    exit:   (d: number) => ({
      opacity: 0,
      x: d > 0 ? -52 : 52,
      transition: { duration: 0.3, ease: [0.4, 0, 1, 1] as const },
    }),
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Progress bar */}
      <div
        className="mb-3 h-[2px] overflow-hidden rounded-full"
        style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }}
      >
        <motion.div
          key={`${active}-${isHovered}`}
          className="h-full rounded-full origin-left"
          style={{ background: accent }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 0 : 1 }}
          transition={{ duration: isHovered ? 0 : SLIDE_INTERVAL / 1000, ease: 'linear' }}
        />
      </div>

      <div className="overflow-hidden" style={{ borderRadius: `${Math.max(radius, 4)}px` }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Slide t={MOCK_TESTIMONIALS[active]} dark={dark} accent={accent} radius={radius} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <NavButton onClick={() => go(-1)} direction="prev" dark={dark} accent={accent} />

        <div className="flex gap-1.5">
          {MOCK_TESTIMONIALS.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i) }}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full"
              animate={{
                width:           i === active ? 28 : 6,
                backgroundColor: i === active ? accent : dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
              }}
              transition={{ duration: 0.35, ease: E_OUT }}
              style={{ height: 6 }}
            />
          ))}
        </div>

        <NavButton onClick={() => go(1)} direction="next" dark={dark} accent={accent} />
      </div>
    </div>
  )
}
