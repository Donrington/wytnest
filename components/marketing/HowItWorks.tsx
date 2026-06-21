'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, useAnimationFrame } from 'framer-motion'
import { LOGO_WALL } from '@/lib/mock-data'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Marquee track ─────────────────────────────────────────────────────────────
function MarqueeTrack({
  items,
  direction,
  speed = 48,
}: {
  items: string[]
  direction: 'left' | 'right'
  speed?: number
}) {
  const doubled  = [...items, ...items]
  const trackRef = useRef<HTMLDivElement>(null)
  const posRef   = useRef<number | null>(null)
  const paused   = useRef(false)
  const x        = useMotionValue(0)

  useAnimationFrame((_, delta) => {
    if (paused.current) return
    const el = trackRef.current
    if (!el) return
    const halfW = el.scrollWidth / 2
    if (halfW < 1) return

    if (posRef.current === null) {
      posRef.current = direction === 'right' ? -halfW : 0
      x.set(posRef.current)
      return
    }

    const step = speed * (delta / 1000)
    let pos = posRef.current
    if (direction === 'left') {
      pos -= step
      if (pos <= -halfW) pos += halfW
    } else {
      pos += step
      if (pos >= 0) pos -= halfW
    }
    posRef.current = pos
    x.set(pos)
  })

  return (
    <motion.div
      ref={trackRef}
      className="flex w-max items-center gap-10"
      style={{ x }}
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
    >
      {doubled.map((name, i) => (
        <span key={i} className="flex items-center gap-10">
          <span
            className="cursor-default select-none whitespace-nowrap text-[0.8rem]
                       font-medium tracking-[0.06em] text-carbon-600
                       transition-colors duration-300 hover:text-carbon-300"
          >
            {name.toUpperCase()}
          </span>
          <span className="h-3 w-px shrink-0 bg-white/[0.08]" aria-hidden="true" />
        </span>
      ))}
    </motion.div>
  )
}

// ── Logo marquee ──────────────────────────────────────────────────────────────
export function LogoMarquee() {
  return (
    <section
      className="relative py-10"
      style={{
        borderTop:    '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <p className="eyebrow mb-7 text-center tracking-[0.2em] text-carbon-700">
        Trusted by teams putting their proof on the record
      </p>
      <div className="flex flex-col gap-3">
        <div className="mask-fade-x overflow-hidden">
          <MarqueeTrack items={LOGO_WALL} direction="left" speed={46} />
        </div>
        <div className="mask-fade-x overflow-hidden">
          <MarqueeTrack items={[...LOGO_WALL].reverse()} direction="right" speed={38} />
        </div>
      </div>
    </section>
  )
}

// ── Step data ─────────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: '01',
    title: 'Send the magic link',
    body: 'One click sends a branded request. Automated reminders handle follow-up — no manual chasing.',
    icon: 'mail',
  },
  {
    n: '02',
    title: 'They record in-browser',
    body: 'Customers record video or type a testimonial right in their browser. No app, no account.',
    icon: 'video',
  },
  {
    n: '03',
    title: 'We process it for you',
    body: 'Video is trimmed, transcribed and transcoded for fast delivery, then queued for your approval.',
    icon: 'sparkles',
  },
  {
    n: '04',
    title: 'It goes live instantly',
    body: 'Approve and it pushes to your widget in real time. One embed line, zero CSS conflicts.',
    icon: 'layout',
  },
] as const

const ICONS: Record<string, React.ReactNode> = {
  mail:     <path d="M3 8l9 6 9-6M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8M3 8a2 2 0 012-2h14a2 2 0 012 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  video:    <><rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M16 10l6-3v10l-6-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></>,
  sparkles: <path d="M12 3l1.5 5L19 9.5 13.5 11 12 16l-1.5-5L5 9.5 10.5 8 12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  layout:   <><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.6" /></>,
}

// ── Step card — spotlight follows cursor, accent bar draws in on hover ─────────
function StepCard({ step, idx }: { step: (typeof STEPS)[number]; idx: number }) {
  const cardRef = useRef<HTMLElement>(null)
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const spotBg  = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(232,150,15,0.07), transparent 70%)`

  function onMove(e: React.MouseEvent<HTMLElement>) {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(e.clientX - r.left)
    mouseY.set(e.clientY - r.top)
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={onMove}
      className="group relative flex flex-col overflow-hidden rounded-2xl p-7 cursor-default"
      style={{
        background: 'linear-gradient(155deg, rgba(18,16,38,0.72) 0%, rgba(10,9,23,0.78) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        willChange: 'transform',
      }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.65, delay: idx * 0.1, ease: E_OUT }}
      whileHover={{ y: -6, transition: { duration: 0.35, ease: E_OUT } }}
    >
      {/* Mouse-tracked gold spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity
                   duration-500 group-hover:opacity-100"
        style={{ background: spotBg }}
        aria-hidden="true"
      />

      {/* Top-edge shimmer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px
                      bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />

      {/* Ghost step number — texture, not content */}
      <span
        className="pointer-events-none absolute right-4 top-0 select-none font-display
                   text-[6rem] font-black leading-none tracking-tighter
                   text-white/[0.032] transition-colors duration-700
                   group-hover:text-gold-400/[0.06]"
        aria-hidden="true"
      >
        {step.n}
      </span>

      {/* ── Card content ── */}
      <div className="relative flex flex-1 flex-col">

        {/* Step label */}
        <p className="mb-7 font-mono text-[0.66rem] tracking-[0.24em] text-carbon-700
                     transition-colors duration-300 group-hover:text-carbon-500">
          STEP {step.n}
        </p>

        {/* Icon */}
        <div
          className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl
                     text-carbon-500 transition-all duration-300
                     group-hover:text-carbon-100"
          style={{
            border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.025)',
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            {ICONS[step.icon]}
          </svg>
        </div>

        {/* Title */}
        <h3 className="mb-2.5 text-[1rem] font-semibold leading-snug text-carbon-100
                       transition-colors duration-300 group-hover:text-white">
          {step.title}
        </h3>

        {/* Body */}
        <p className="text-[0.83rem] leading-[1.72] text-carbon-600
                     transition-colors duration-300 group-hover:text-carbon-400">
          {step.body}
        </p>
      </div>

      {/* Bottom accent bar — scales from left on hover */}
      <div
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0
                   rounded-full transition-transform duration-500 ease-out
                   group-hover:scale-x-100"
        style={{ background: 'linear-gradient(90deg, rgba(232,150,15,0.9), rgba(248,195,82,0.5), transparent)' }}
        aria-hidden="true"
      />
    </motion.article>
  )
}

// ── How it works ──────────────────────────────────────────────────────────────
export function HowItWorks() {
  return (
    <section id="how" className="relative py-28">

      {/* Ambient section glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,63,204,0.055), transparent)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">

        {/* Section header */}
        <div className="reveal mx-auto max-w-xl text-center">
          <p className="eyebrow mb-4 text-carbon-600">How it works</p>
          <h2 className="font-display text-display font-extrabold text-carbon-50">
            Four steps. Fully automated.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-carbon-500">
            The entire pipeline runs itself. You approve; the rest is handled.
          </p>
        </div>

        {/* Animated step timeline — desktop only */}
        <div className="relative mx-auto mt-16 hidden max-w-3xl items-center lg:flex">
          {STEPS.map((step, idx) => (
            <div key={step.n} className="flex flex-1 items-center">
              {/* Connector line before each dot (except first) */}
              {idx > 0 && (
                <motion.div
                  className="h-px flex-1"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.12, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
              {/* Node */}
              <motion.div
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.12, ease: E_OUT }}
              >
                <span className="font-mono text-[0.62rem] tracking-[0.15em] text-carbon-700">
                  {step.n}
                </span>
              </motion.div>
              {/* Connector line after each dot (except last) */}
              {idx < STEPS.length - 1 && (
                <motion.div
                  className="h-px flex-1"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.28 + idx * 0.12, ease: [0.4, 0, 0.2, 1] }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-4 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <StepCard key={step.n} step={step} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}
