'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const FAQS = [
  {
    q: 'How do I collect my first testimonial?',
    a: 'After signing up, hit "New Campaign" and paste in your customer\'s email. Wytnest sends a branded magic-link — no login required on their end. They click, record or type, submit. It lands in your dashboard within seconds.',
  },
  {
    q: 'Can customers record video on any device?',
    a: 'Yes. The recorder runs entirely in the browser using the MediaRecorder API — Chrome, Safari, Firefox and Edge are all supported. No app download, no account creation. Mobile and desktop both work out of the box.',
  },
  {
    q: 'What are the three widget types?',
    a: 'Bento Wall (masonry grid for landing pages), Ticker (horizontal infinite scroll for headers), and Cinematic Slider (full-bleed quote carousel). All three ship as a single <script> tag — one line of embed code, zero CSS conflicts.',
  },
  {
    q: 'Can I remove the Wytnest badge?',
    a: 'Yes — white-labelling is available on Growth and Agency plans. Your widgets show your brand only. The Starter plan shows a small "Powered by Wytnest" badge in the widget footer.',
  },
  {
    q: 'Do you accept Naira payments?',
    a: 'Absolutely. We support Paystack for ₦ Naira (card, bank transfer, USSD) and Stripe for USD. You pick your currency at checkout — both are available on all plans with no conversion fees on our end.',
  },
  {
    q: 'How long does it take to go live?',
    a: 'Under ten minutes for most setups. Sign up → create a campaign → embed one <script> tag → approve your first testimonial. The widget updates in real time — no redeploy, no cache-busting needed.',
  },
  {
    q: 'What happens when I hit my testimonial limit?',
    a: 'We never delete approved testimonials. Collection simply pauses until you upgrade or your next billing cycle resets your quota. Your live widgets keep displaying everything already approved, uninterrupted.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Every paid plan starts with a 14-day free trial — no credit card required. You get access to all features on your chosen tier for the full trial period. Cancel anytime before day 14 and you owe nothing.',
  },
]

// ── FAQ item ──────────────────────────────────────────────────────────────────
function FAQItem({
  faq,
  idx,
  isOpen,
  onToggle,
}: {
  faq: { q: string; a: string }
  idx: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      className="group"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.52, delay: idx * 0.055, ease: E_OUT }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-5 py-[1.35rem] text-left"
      >
        {/* Index number */}
        <span className="mt-[3px] shrink-0 font-mono text-[0.58rem] tracking-[0.24em] text-carbon-800
                         transition-colors duration-300 group-hover:text-carbon-600">
          {String(idx + 1).padStart(2, '0')}
        </span>

        {/* Question text */}
        <span
          className={cn(
            'flex-1 text-[0.935rem] font-medium leading-snug tracking-[-0.01em]',
            'transition-colors duration-300',
            isOpen
              ? 'text-carbon-50'
              : 'text-carbon-300 group-hover:text-carbon-100',
          )}
        >
          {faq.q}
        </span>

        {/* Animated +/− icon */}
        <motion.span
          className="relative mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full"
          animate={{
            background: isOpen
              ? 'rgba(232,150,15,0.12)'
              : 'rgba(255,255,255,0.04)',
            borderColor: isOpen
              ? 'rgba(232,150,15,0.32)'
              : 'rgba(255,255,255,0.09)',
          }}
          transition={{ duration: 0.25 }}
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'rgba(255,255,255,0.09)',
          }}
          aria-hidden="true"
        >
          {/* Horizontal bar — always shown */}
          <span className="absolute h-[1.5px] w-[9px] rounded-full bg-carbon-500" />
          {/* Vertical bar — collapses when open */}
          <motion.span
            className="absolute h-[9px] w-[1.5px] rounded-full bg-carbon-500"
            animate={{ scaleY: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2, ease: E_OUT }}
          />
        </motion.span>
      </button>

      {/* Animated answer panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="relative pb-7 pl-10 pr-1">
              {/* Gold left accent bar */}
              <motion.div
                className="absolute left-0 top-0 w-[2px] rounded-full"
                initial={{ height: 0 }}
                animate={{ height: '100%' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.35, ease: E_OUT }}
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(232,150,15,0.7), rgba(248,195,82,0.1))',
                }}
                aria-hidden="true"
              />
              <p className="text-[0.875rem] leading-[1.84] text-carbon-500">
                {faq.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── FAQ section ───────────────────────────────────────────────────────────────
export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i)

  return (
    <section id="faq" className="relative py-28">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[700px] -translate-y-1/2"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(79,63,204,0.055), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">

          {/* ── Left — sticky heading + contact card ── */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: E_OUT }}
          >
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-4 tracking-[0.22em] text-carbon-600">FAQ</p>

              <h2
                className="font-display font-extrabold leading-[1.08] tracking-[-0.03em] text-carbon-50"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)' }}
              >
                Everything<br className="hidden lg:block" />
                you need<br className="hidden lg:block" />
                to know
              </h2>

              <p className="mt-5 text-[0.88rem] leading-[1.75] text-carbon-500">
                Still can't find what you're looking for? We're one message away.
              </p>

              {/* Contact card */}
              <motion.a
                href="mailto:hey@wytnest.com"
                className="group mt-8 flex items-center gap-4 rounded-2xl p-5"
                style={{
                  background: 'rgba(14,12,32,0.65)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  willChange: 'transform',
                }}
                whileHover={{
                  borderColor: 'rgba(248,195,82,0.28)',
                  y: -3,
                  transition: { duration: 0.25, ease: E_OUT },
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: 'rgba(232,150,15,0.1)',
                    border: '1px solid rgba(232,150,15,0.22)',
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 8l9 6 9-6M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8M3 8a2 2 0 012-2h14a2 2 0 012 2"
                      stroke="#E8960F" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <div className="min-w-0">
                  <p className="text-[0.82rem] font-medium text-carbon-100">
                    Chat with us
                  </p>
                  <p className="text-[0.73rem] text-carbon-600">hey@wytnest.com</p>
                </div>

                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none"
                  className="ml-auto shrink-0 text-carbon-700 transition-all duration-300
                             group-hover:translate-x-1 group-hover:text-gold-400"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>

              {/* Decorative stat */}
              <motion.div
                className="mt-6 rounded-xl px-5 py-4"
                style={{
                  background: 'rgba(123,110,245,0.06)',
                  border: '1px solid rgba(123,110,245,0.12)',
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5, ease: E_OUT }}
              >
                <p className="font-mono text-[0.58rem] tracking-[0.2em] text-carbon-700 uppercase">
                  avg response time
                </p>
                <p className="mt-1 font-display text-[1.6rem] font-extrabold tracking-[-0.03em] text-carbon-100">
                  &lt; 2 hrs
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* ── Right — accordion ── */}
          <div className="lg:col-span-8">
            {/* Top rule */}
            <motion.div
              className="mb-1 h-px w-full"
              style={{ background: 'rgba(255,255,255,0.055)' }}
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              aria-hidden="true"
            />

            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                idx={i}
                isOpen={openIdx === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
