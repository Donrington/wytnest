'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
  show:   { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.65, ease: E_OUT } },
}

const STATS = [
  { n: '1,247+',   label: 'businesses' },
  { n: '4.9 ★',   label: 'avg rating' },
  { n: '< 10 min', label: 'first widget live' },
]

const SOCIAL = [
  {
    label: 'X / Twitter',
    d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'LinkedIn',
    d: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  },
  {
    label: 'GitHub',
    d: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.59 9.59 0 012.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
  },
]

// ── CTA ───────────────────────────────────────────────────────────────────────
export function CTA() {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX  = useMotionValue(0)
  const mouseY  = useMotionValue(0)
  const spotBg  = useMotionTemplate`radial-gradient(520px circle at ${mouseX}px ${mouseY}px, rgba(232,150,15,0.065), transparent 65%)`

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(e.clientX - r.left)
    mouseY.set(e.clientY - r.top)
  }

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: E_OUT }}
        >
          {/* Rotating conic border */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden" aria-hidden="true">
            <motion.div
              className="absolute left-1/2 top-1/2 aspect-square w-[160%]"
              style={{
                translateX: '-50%',
                translateY: '-50%',
                background:
                  'conic-gradient(from 0deg, transparent 0%, rgba(248,195,82,0.55) 12%, rgba(123,110,245,0.45) 28%, transparent 45%, rgba(79,63,204,0.35) 65%, rgba(232,150,15,0.5) 82%, transparent 100%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Outer glow pulse */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-[2rem]"
            animate={{ opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              boxShadow:
                '0 0 60px -10px rgba(232,150,15,0.28), 0 0 100px -20px rgba(79,63,204,0.22)',
            }}
            aria-hidden="true"
          />

          {/* Card */}
          <div
            ref={cardRef}
            onMouseMove={onMove}
            className="relative m-[1px] overflow-hidden rounded-[calc(2rem-1px)]
                       px-8 py-24 text-center md:px-20"
            style={{
              background:
                'linear-gradient(160deg, rgba(16,12,38,0.97) 0%, rgba(10,9,23,0.99) 100%)',
            }}
          >
            {/* Mouse spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ background: spotBg }}
              aria-hidden="true"
            />

            {/* Dot grid texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.028]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }}
              aria-hidden="true"
            />

            {/* Aurora — ink/violet left */}
            <motion.div
              className="pointer-events-none absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full blur-[130px]"
              style={{ background: '#4F3FCC' }}
              animate={{ opacity: [0.25, 0.42, 0.25], scale: [1, 1.08, 1] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden="true"
            />

            {/* Aurora — gold right */}
            <motion.div
              className="pointer-events-none absolute -bottom-28 -right-20 h-[24rem] w-[24rem] rounded-full blur-[110px]"
              style={{ background: '#E8960F' }}
              animate={{ opacity: [0.14, 0.28, 0.14], scale: [1, 1.1, 1] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
              aria-hidden="true"
            />

            {/* Aurora — violet centre */}
            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[18rem] w-[18rem]
                         -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
              style={{ background: '#7B6EF5' }}
              animate={{ opacity: [0.04, 0.11, 0.04] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
              aria-hidden="true"
            />

            {/* Top accent line — draws from centre out */}
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(248,195,82,0.65) 30%, rgba(123,110,245,0.55) 70%, transparent 100%)',
                originX: 0.5,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
              aria-hidden="true"
            />

            {/* Content */}
            <motion.div
              className="relative"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.p
                variants={fadeUp}
                className="eyebrow mb-6 tracking-[0.24em] text-carbon-600"
              >
                Put your proof on the record
              </motion.p>

              <motion.h2
                variants={fadeUp}
                className="mx-auto max-w-3xl font-display font-extrabold leading-[1.05] text-carbon-50"
                style={{ fontSize: 'clamp(1.9rem, 4.2vw, 3.4rem)' }}
              >
                Your customers already believe.{' '}
                <span className="testimony font-light italic text-foil">
                  Show the world.
                </span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-[46ch] text-[1.02rem] leading-[1.78] text-carbon-400"
              >
                Start collecting today. Your first widget goes live in under ten minutes —
                no card, no code review, no agency invoice.
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <motion.a
                  href="/dashboard"
                  className="group relative inline-flex w-full items-center justify-center
                             gap-2.5 overflow-hidden rounded-full bg-gold-400 px-9 py-4
                             text-[0.95rem] font-semibold text-carbon-950 sm:w-auto"
                  style={{ boxShadow: '0 8px 40px -8px rgba(232,150,15,0.55)', willChange: 'transform' }}
                  whileHover={{
                    scale: 1.04, y: -3,
                    boxShadow: '0 18px 56px -8px rgba(232,150,15,0.72)',
                    transition: { duration: 0.28, ease: E_OUT },
                  }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.12 } }}
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r
                                   from-transparent via-white/30 to-transparent
                                   transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Start free trial</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       className="relative transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.a>

                <motion.a
                  href="#pricing"
                  className="group inline-flex w-full items-center justify-center gap-2
                             rounded-full px-9 py-4
                             text-[0.95rem] font-medium text-carbon-100 sm:w-auto"
                  style={{
                    backgroundColor: 'rgba(176,168,252,0.05)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(176,168,252,0.2)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                    willChange: 'transform',
                  }}
                  whileHover={{
                    borderColor: 'rgba(176,168,252,0.42)',
                    backgroundColor: 'rgba(123,110,245,0.1)',
                    y: -3,
                    transition: { duration: 0.28, ease: E_OUT },
                  }}
                  whileTap={{ scale: 0.97, transition: { duration: 0.12 } }}
                >
                  View pricing
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       className="transition-transform duration-300 group-hover:translate-x-0.5">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.a>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
              >
                {STATS.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-10">
                    <div className="text-center">
                      <div className="font-display text-[1.4rem] font-extrabold
                                      tracking-[-0.025em] text-carbon-50">
                        {s.n}
                      </div>
                      <div className="mt-0.5 font-mono text-[0.6rem] tracking-[0.2em]
                                      text-carbon-700 uppercase">
                        {s.label}
                      </div>
                    </div>
                    {i < STATS.length - 1 && (
                      <div className="h-9 w-px bg-white/[0.07]" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
  Product:   ['Widgets', 'Pricing', 'How it works', 'Integrations'],
  Company:   ['About', 'Blog', 'Careers', 'Contact'],
  Resources: ['Documentation', 'API', 'Status', 'Changelog'],
  Legal:     ['Privacy', 'Terms', 'Security', 'GDPR'],
}

export function Footer() {
  const entries = Object.entries(FOOTER_LINKS)

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.05] bg-carbon-950">

      {/* Ghost wordmark — decorative background texture */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
        aria-hidden="true"
      >
        <span
          className="block translate-y-[22%] text-center font-display font-black
                     leading-none tracking-tighter text-white/[0.018]"
          style={{ fontSize: 'clamp(5rem, 20vw, 18rem)' }}
        >
          wytnest
        </span>
      </div>

      {/* Ambient ink glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[320px]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% -10%, rgba(79,63,204,0.07), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-14">

        {/* Animated top rule */}
        <motion.div
          className="mb-14 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(232,150,15,0.7) 0%, rgba(248,195,82,0.45) 25%, rgba(123,110,245,0.4) 65%, transparent 100%)',
          }}
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        />

        {/* ── DESKTOP layout: brand left, links right ── */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">

          {/* Brand column */}
          <motion.div
            className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: E_OUT }}
          >
            {/* Logo */}
            <a href="/" className="inline-flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)',
                  boxShadow:
                    '0 0 0 1px rgba(123,110,245,0.3), 0 0 20px -4px rgba(79,63,204,0.4)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="2" fill="#E8960F" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-carbon-50">
                wyt<span className="font-light text-carbon-500">nest</span>
              </span>
            </a>

            {/* Tagline */}
            <p className="testimony mt-5 max-w-[28ch] text-[0.875rem] leading-[1.78] text-carbon-500">
              The design-forward way to collect and display testimonials that convert.
            </p>

            {/* Social icons */}
            <div className="mt-6 flex items-center justify-center gap-2 lg:justify-start">
              {SOCIAL.map((s) => (
                <motion.a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgba(255,255,255,0.07)',
                    color: '#555275',
                    willChange: 'transform',
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(123,110,245,0.12)',
                    borderColor: 'rgba(123,110,245,0.3)',
                    color: '#E4E3F0',
                    y: -2,
                    transition: { duration: 0.22, ease: E_OUT },
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                       aria-hidden="true">
                    <path d={s.d} />
                  </svg>
                </motion.a>
              ))}
            </div>

            {/* Status pill — desktop only */}
            <motion.div
              className="mt-7 hidden items-center gap-2 rounded-full px-3 py-1.5 lg:inline-flex"
              style={{
                background: 'rgba(52,211,153,0.06)',
                border: '1px solid rgba(52,211,153,0.14)',
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[0.58rem] tracking-[0.18em] text-emerald-600 uppercase">
                All systems operational
              </span>
            </motion.div>
          </motion.div>

          {/* Link columns — 2 shown on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-8 lg:grid-cols-4 lg:gap-x-8">
            {entries.map(([heading, links], i) => (
              <motion.div
                key={heading}
                className={i >= 2 ? 'hidden lg:block' : ''}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.52, delay: 0.08 + i * 0.07, ease: E_OUT }}
              >
                <h4 className="font-mono text-[0.58rem] tracking-[0.24em] text-carbon-700 uppercase">
                  {heading}
                </h4>
                <ul className="mt-4 space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="group flex items-center gap-1 text-[0.83rem] text-carbon-600
                                   transition-colors duration-200 hover:text-carbon-100"
                      >
                        <span>{link}</span>
                        <svg
                          width="9" height="9" viewBox="0 0 24 24" fill="none"
                          className="-translate-x-1 opacity-0 transition-all duration-200
                                     group-hover:translate-x-0 group-hover:opacity-100"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor"
                                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <motion.div
          className="mt-14 pt-7"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          {/* Desktop bottom bar */}
          <div className="hidden items-center justify-between sm:flex">
            <p className="font-mono text-[0.62rem] tracking-[0.16em] text-carbon-800">
              © 2026 WYTNEST · ALL RIGHTS RESERVED
            </p>
            <div className="flex items-center gap-5">
              {['Privacy', 'Terms', 'Security'].map((item, i, arr) => (
                <span key={item} className="flex items-center gap-5">
                  <a
                    href="#"
                    className="font-mono text-[0.58rem] tracking-[0.14em] text-carbon-800
                               transition-colors duration-200 hover:text-carbon-500 uppercase"
                  >
                    {item}
                  </a>
                  {i < arr.length - 1 && (
                    <span className="h-3 w-px bg-white/[0.07]" aria-hidden="true" />
                  )}
                </span>
              ))}
            </div>
            <p className="font-mono text-[0.58rem] tracking-[0.14em] text-carbon-900">
              CYBERSAGE
            </p>
          </div>

          {/* Mobile bottom bar — compact, centered */}
          <div className="flex flex-col items-center gap-3 sm:hidden">
            <p className="font-mono text-[0.6rem] tracking-[0.14em] text-carbon-800">
              © 2026 WYTNEST
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="font-mono text-[0.58rem] tracking-[0.12em] text-carbon-800
                                    transition-colors duration-200 hover:text-carbon-600 uppercase">
                Privacy
              </a>
              <span className="h-px w-4 bg-white/[0.08]" aria-hidden="true" />
              <a href="#" className="font-mono text-[0.58rem] tracking-[0.12em] text-carbon-800
                                    transition-colors duration-200 hover:text-carbon-600 uppercase">
                Terms
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
