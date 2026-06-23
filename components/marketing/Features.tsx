'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BentoWall } from '@/components/widgets/BentoWall'
import { CinematicSlider, Ticker } from '@/components/widgets/Ticker'

const TABS = [
  { id: 'bento',  label: 'Bento wall',       desc: 'Masonry grid, staggered reveals' },
  { id: 'slider', label: 'Cinematic slider',  desc: 'Full-width video showcase'       },
  { id: 'ticker', label: 'Floating ticker',   desc: 'Looping marquee, above the fold' },
] as const

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function Features() {
  const [tab, setTab] = useState<typeof TABS[number]['id']>('bento')
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(
      '<div id="wytnest-widget"></div>\n<script src="https://cdn.wytnest.com/wytnest.js"\n        data-widget-id="abc123" async></script>'
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="widgets" className="relative py-28">
      {/* Top divider glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink-400/20 to-transparent" aria-hidden="true" />

      {/* Section ambient */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,63,204,0.07), transparent)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">

        {/* Section header */}
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: E_OUT }}
        >
          <p className="eyebrow mb-4 text-ink-300">The widgets</p>
          <h2 className="font-display text-display font-extrabold text-carbon-50">
            Three layouts. One fits every brand.
          </h2>
          <p className="mt-5 text-lg text-carbon-400">
            Every widget is dark-mode ready, fully responsive, and embeds with a single line.
            This whole page is running them live.
          </p>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: E_OUT }}
        >
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <motion.button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative overflow-hidden rounded-2xl px-5 py-3 text-left"
                style={{
                  background: active ? '#E8960F' : 'rgba(19,17,40,0.7)',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: active ? '#E8960F' : 'rgba(176,168,252,0.1)',
                  boxShadow: active
                    ? '0 8px 30px -10px rgba(232,150,15,0.5), 0 0 0 1px rgba(232,150,15,0.3)'
                    : '0 0 0 1px rgba(0,0,0,0.2)',
                  color: active ? '#0A0917' : '#C4C0E0',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative text-sm font-semibold">{t.label}</div>
                <div
                  className="relative text-xs"
                  style={{ color: active ? '#4A3800' : 'rgba(176,168,252,0.45)' }}
                >
                  {t.desc}
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Widget stage */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75, delay: 0.22, ease: E_OUT }}
        >
          <div
            className="relative rounded-[1.75rem] p-3 shadow-2xl shadow-black/60"
            style={{
              background: 'linear-gradient(170deg, rgba(19,17,40,0.97) 0%, rgba(7,6,15,0.99) 100%)',
              border: '1px solid rgba(176,168,252,0.1)',
              boxShadow: '0 0 0 1px rgba(176,168,252,0.07), 0 40px 100px -30px rgba(0,0,0,0.9)',
            }}
          >
            {/* Stage underlay glow */}
            <div
              className="pointer-events-none absolute -inset-x-10 -bottom-10 -z-10 h-52 rounded-full blur-3xl"
              style={{ background: 'rgba(79,63,204,0.15)' }}
              aria-hidden="true"
            />

            {/* Browser chrome bar */}
            <div
              className="mb-3 flex items-center gap-2 rounded-2xl px-4 py-2.5"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-gold-400/55" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/45" />
              <div
                className="mx-auto flex items-center gap-1.5 rounded-full px-3 py-[3px]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(176,168,252,0.35)" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a15 15 0 0 1 0 18M3 12h18" />
                </svg>
                <span className="font-mono text-[0.6rem] text-carbon-600">wytnest.com/demo</span>
              </div>
            </div>

            {/* Content area */}
            <div
              className="overflow-hidden rounded-[1.4rem] p-5 md:p-8"
              style={{ background: 'rgba(7,6,15,0.7)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: E_OUT }}
                >
                  {tab === 'ticker' ? (
                    <Ticker dark />
                  ) : tab === 'slider' ? (
                    <CinematicSlider />
                  ) : (
                    <BentoWall dark />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Embed code */}
        <motion.div
          className="mx-auto mt-10 max-w-2xl"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: E_OUT }}
        >
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'rgba(7,6,15,0.9)',
              border: '1px solid rgba(176,168,252,0.1)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 20px 50px -20px rgba(0,0,0,0.8)',
            }}
          >
            {/* Chrome row */}
            <div
              className="flex items-center gap-2 px-4 py-3"
              style={{ borderBottom: '1px solid rgba(176,168,252,0.07)' }}
            >
              <span className="h-3 w-3 rounded-full bg-red-400/50" />
              <span className="h-3 w-3 rounded-full bg-gold-400/60" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/50" />
              <span className="ml-2 font-mono text-xs text-carbon-500">embed.html</span>
              <motion.button
                className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-[0.7rem]"
                style={{
                  background: copied ? 'rgba(45,212,191,0.12)' : 'rgba(255,255,255,0.04)',
                  color: copied ? '#2DD4BF' : '#6B6890',
                  border: `1px solid ${copied ? 'rgba(45,212,191,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                }}
                onClick={copy}
                whileTap={{ scale: 0.94 }}
              >
                {copied ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    copied
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    copy
                  </>
                )}
              </motion.button>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
              <code className="font-mono text-carbon-200">
                <span className="text-carbon-500">&lt;</span><span className="text-ink-300">div</span> <span className="text-gold-200">id</span>=<span className="text-emerald-300">&quot;wytnest-widget&quot;</span><span className="text-carbon-500">&gt;&lt;/</span><span className="text-ink-300">div</span><span className="text-carbon-500">&gt;</span>{'\n'}
                <span className="text-carbon-500">&lt;</span><span className="text-ink-300">script</span> <span className="text-gold-200">src</span>=<span className="text-emerald-300">&quot;https://cdn.wytnest.com/wytnest.js&quot;</span>{'\n'}
                {'        '}<span className="text-gold-200">data-widget-id</span>=<span className="text-emerald-300">&quot;abc123&quot;</span> <span className="text-ink-300">async</span><span className="text-carbon-500">&gt;&lt;/</span><span className="text-ink-300">script</span><span className="text-carbon-500">&gt;</span>
              </code>
            </pre>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
