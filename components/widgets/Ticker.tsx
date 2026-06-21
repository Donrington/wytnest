'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useAnimationFrame } from 'framer-motion'
import { MOCK_TESTIMONIALS, type MockTestimonial } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

const ACCENT: Record<string, { dot: string; glow: string; border: string }> = {
  ink:  { dot: '#7B6EF5', glow: 'rgba(79,63,204,0.28)',  border: 'rgba(123,110,245,0.2)' },
  gold: { dot: '#F8C352', glow: 'rgba(232,150,15,0.25)',  border: 'rgba(248,195,82,0.2)'  },
  teal: { dot: '#2DD4BF', glow: 'rgba(45,212,191,0.25)',  border: 'rgba(45,212,191,0.2)'  },
}

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
const SPRING = { type: 'spring', bounce: 0.18, duration: 0.36 } as const
const SLIDE_INTERVAL = 5000

// ── Ticker ─────────────────────────────────────────────────────────────────────

function TickerTrack({ children }: { children: React.ReactNode }) {
  const baseX = useMotionValue(0)
  const paused = useRef(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    if (paused.current) return
    const el = trackRef.current
    if (!el) return
    const halfW = el.scrollWidth / 2
    const next = baseX.get() - delta * 0.055          // ~55 px/s
    baseX.set(next <= -halfW ? next + halfW : next)   // seamless loop
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

export function Ticker({ dark = false }: { dark?: boolean }) {
  const row = [...MOCK_TESTIMONIALS, ...MOCK_TESTIMONIALS]
  return (
    <div className="mask-fade-x overflow-hidden">
      <TickerTrack>
        {row.map((t, i) => <TickerCard key={i} t={t} />)}
      </TickerTrack>
    </div>
  )
}

function TickerCard({ t }: { t: MockTestimonial }) {
  const ac = ACCENT[t.accent]
  return (
    <div
      className="relative flex w-80 shrink-0 flex-col gap-3 overflow-hidden rounded-[1.1rem] p-4"
      style={{
        background: 'linear-gradient(155deg, rgba(28,24,58,0.7) 0%, rgba(13,11,30,0.75) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: `0 0 0 1px ${ac.border}, 0 8px 32px -12px rgba(0,0,0,0.7), 0 0 28px -14px ${ac.glow}`,
      }}
    >
      {/* Top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />

      {/* Open quote watermark */}
      <svg className="absolute right-4 top-3 opacity-[0.06]" width="32" height="32" viewBox="0 0 24 24" fill={ac.dot}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>

      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold tracking-[0.08em]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${ac.dot}28, ${ac.dot}08)`,
            boxShadow: `0 0 0 1px ${ac.border}`,
            color: ac.dot,
          }}
        >
          {initials(t.name)}
        </div>
        <div>
          <div className="text-[0.76rem] font-semibold text-carbon-50/90">{t.name}</div>
          <div className="text-[0.65rem] text-carbon-400/70">{t.company}</div>
        </div>
        <div className="ml-auto flex gap-[2px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={ac.dot}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
        </div>
      </div>

      <p className="testimony line-clamp-2 text-[0.83rem] leading-snug text-carbon-50/76">
        &ldquo;{t.quote}&rdquo;
      </p>
    </div>
  )
}

// ── CinematicSlider ────────────────────────────────────────────────────────────

export function CinematicSlider({ dark = true }: { dark?: boolean }) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const total = MOCK_TESTIMONIALS.length

  // Auto-advance on interval; resets when slide changes or hover state changes
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
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 52 : -52 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.52, ease: E_OUT } },
    exit:  (d: number) => ({
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
      {/* Progress bar — key resets on slide change OR hover toggle so it restarts cleanly */}
      <div className="mb-3 h-[2px] overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          key={`${active}-${isHovered}`}
          className="h-full rounded-full origin-left"
          style={{ background: '#E8960F' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 0 : 1 }}
          transition={{ duration: isHovered ? 0 : SLIDE_INTERVAL / 1000, ease: 'linear' }}
        />
      </div>

      <div className="overflow-hidden rounded-[1.4rem]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={active}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <Slide t={MOCK_TESTIMONIALS[active]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-5 flex items-center justify-center gap-4">
        <NavButton onClick={() => go(-1)} direction="prev" />

        <div className="flex gap-1.5">
          {MOCK_TESTIMONIALS.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > active ? 1 : -1); setActive(i) }}
              aria-label={`Go to slide ${i + 1}`}
              className="rounded-full"
              animate={{
                width: i === active ? 28 : 6,
                backgroundColor: i === active ? '#E8960F' : 'rgba(255,255,255,0.15)',
              }}
              transition={{ duration: 0.35, ease: E_OUT }}
              style={{ height: 6 }}
            />
          ))}
        </div>

        <NavButton onClick={() => go(1)} direction="next" />
      </div>
    </div>
  )
}

function NavButton({ onClick, direction }: { onClick: () => void; direction: 'prev' | 'next' }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
      className="flex h-11 w-11 items-center justify-center rounded-full"
      style={{
        background: 'rgba(28,24,58,0.7)',
        border: '1px solid rgba(176,168,252,0.12)',
        backdropFilter: 'blur(12px)',
        color: '#C4C0E0',
      }}
      whileHover={{ scale: 1.08, borderColor: 'rgba(248,195,82,0.4)', color: '#F8C352' }}
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

function Slide({ t }: { t: MockTestimonial }) {
  const ac = ACCENT[t.accent]
  return (
    <div
      className="grid items-center gap-8 rounded-[1.4rem] p-8 md:grid-cols-2 md:p-10"
      style={{
        background: 'linear-gradient(145deg, rgba(22,18,52,0.8) 0%, rgba(10,9,23,0.9) 100%)',
        border: '1px solid rgba(176,168,252,0.1)',
        boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 0 80px -30px ${ac.glow}`,
      }}
    >
      {/* Video placeholder */}
      <div
        className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(140deg, rgba(20,16,50,1) 0%, rgba(30,18,60,0.8) 100%)',
          boxShadow: `0 0 0 1px ${ac.border}, 0 0 60px -20px ${ac.glow}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `radial-gradient(ellipse 80% 70% at 65% 30%, ${ac.glow}, transparent 65%)` }}
        />
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
        <motion.span
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(8px)',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 0 40px -10px ${ac.glow}`,
          }}
          whileHover={{ scale: 1.1 }}
          transition={SPRING}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill={ac.dot}><path d="M8 5v14l11-7z" /></svg>
        </motion.span>
      </div>

      {/* Quote content */}
      <div>
        <div className="mb-4 flex items-center gap-[3px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={ac.dot}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span className="ml-2 font-mono text-[0.65rem] tracking-widest" style={{ color: ac.dot }}>5.0</span>
        </div>

        <svg className="mb-2 opacity-20" width="28" height="28" viewBox="0 0 24 24" fill={ac.dot}>
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>

        <blockquote className="testimony text-[1.25rem] font-medium leading-snug text-carbon-50">
          {t.quote}
        </blockquote>

        <div className="mt-6 flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${ac.dot}28, ${ac.dot}08)`,
              boxShadow: `0 0 0 1px ${ac.border}, inset 0 1px 0 rgba(255,255,255,0.08)`,
              color: ac.dot,
            }}
          >
            {initials(t.name)}
          </div>
          <div>
            <p className="font-semibold text-carbon-50">{t.name}</p>
            <p className="text-sm text-carbon-400">{t.role}, {t.company}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
