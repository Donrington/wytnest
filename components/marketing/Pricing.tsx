'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion'
import { cn } from '@/lib/utils'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For solo founders testing the waters',
    ngn: { monthly: '₦15,000', annual: '₦144,000' },
    usd: { monthly: '$9', annual: '$86' },
    features: [
      { text: '50 testimonials / month', included: true },
      { text: '2 embed widgets', included: true },
      { text: 'Text testimonials', included: true },
      { text: 'Bento wall layout', included: true },
      { text: 'Wytnest badge', included: true },
      { text: 'Video testimonials', included: false },
      { text: 'White-label (no badge)', included: false },
    ],
    cta: 'Start free',
    href: '/dashboard',
    featured: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: 'For brands serious about conversion',
    ngn: { monthly: '₦35,000', annual: '₦336,000' },
    usd: { monthly: '$29', annual: '$278' },
    features: [
      { text: 'Unlimited testimonials', included: true },
      { text: 'All 3 widget types', included: true },
      { text: 'Video + text', included: true },
      { text: 'Custom domain embed', included: true },
      { text: 'White-label (no badge)', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start free',
    href: '/dashboard',
    featured: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    tagline: 'For studios managing many clients',
    ngn: { monthly: '₦80,000', annual: '₦768,000' },
    usd: { monthly: '$79', annual: '$758' },
    features: [
      { text: '10 client workspaces', included: true },
      { text: 'Everything in Growth', included: true },
      { text: 'Client sub-accounts', included: true },
      { text: 'Priority support', included: true },
      { text: 'REST API access', included: true },
      { text: 'Custom widget CSS', included: true },
      { text: 'White-label (no badge)', included: true },
    ],
    cta: 'Talk to sales',
    href: '/dashboard',
    featured: false,
  },
] as const

// ── Animated price number ────────────────────────────────────────────────────
function Price({ value, period, valueClass = 'text-carbon-50' }: { value: string; period: string; valueClass?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          className={cn('font-display text-[2.8rem] font-extrabold leading-none tracking-[-0.04em]', valueClass)}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: E_OUT }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="text-[0.8rem] text-carbon-600">/{period}</span>
    </div>
  )
}

// ── Per-card mouse spotlight ──────────────────────────────────────────────────
function PricingCard({
  plan,
  currency,
  period,
  idx,
}: {
  plan: (typeof PLANS)[number]
  currency: 'ngn' | 'usd'
  period: 'monthly' | 'annual'
  idx: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotColor = plan.featured
    ? 'rgba(232,150,15,0.09)'
    : 'rgba(123,110,245,0.07)'
  const spotBg = useMotionTemplate`radial-gradient(260px circle at ${mouseX}px ${mouseY}px, ${spotColor}, transparent 70%)`

  function onMove(e: React.MouseEvent<HTMLElement>) {
    const r = cardRef.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(e.clientX - r.left)
    mouseY.set(e.clientY - r.top)
  }

  const price = plan[currency][period]

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={onMove}
      className="group relative flex flex-col overflow-hidden rounded-3xl p-8 cursor-default"
      style={
        plan.featured
          ? {
              background:
                'linear-gradient(155deg, rgba(22,18,52,0.85) 0%, rgba(10,9,23,0.92) 100%)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(248,195,82,0.32)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow:
                '0 0 0 1px rgba(248,195,82,0.1) inset, 0 32px 80px -20px rgba(232,150,15,0.28), 0 0 0 0.5px rgba(0,0,0,0.4)',
              willChange: 'transform',
            }
          : {
              background:
                'linear-gradient(155deg, rgba(18,16,38,0.65) 0%, rgba(10,9,23,0.72) 100%)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              willChange: 'transform',
            }
      }
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: plan.featured ? -20 : 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: idx * 0.1, ease: E_OUT }}
      whileHover={
        !plan.featured
          ? { y: -6, borderColor: 'rgba(123,110,245,0.22)', transition: { duration: 0.35, ease: E_OUT } }
          : { y: -26, transition: { duration: 0.35, ease: E_OUT } }
      }
    >
      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: spotBg }}
        aria-hidden="true"
      />

      {/* Top shimmer */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: plan.featured
            ? 'linear-gradient(90deg, transparent, rgba(248,195,82,0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        }}
      />

      {/* Featured: gold top-edge glow strip */}
      {plan.featured && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 -z-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(232,150,15,0.18) 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Most popular badge */}
      {plan.featured && (
        <motion.div
          className="absolute -top-px left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -4 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.45, duration: 0.4, ease: E_OUT }}
        >
          <span
            className="inline-block rounded-b-xl px-5 py-1.5 font-mono text-[0.62rem]
                       font-semibold tracking-[0.18em] text-carbon-950"
            style={{
              background: 'linear-gradient(90deg, #F8C352, #E8960F)',
              boxShadow: '0 4px 18px -4px rgba(232,150,15,0.5)',
            }}
          >
            MOST POPULAR
          </span>
        </motion.div>
      )}

      <div className="relative flex flex-1 flex-col">
        {/* Plan header */}
        <div className="mt-4">
          <h3
            className={cn(
              'text-[1.05rem] font-semibold tracking-[-0.01em]',
              plan.featured ? 'text-carbon-50' : 'text-carbon-200',
            )}
          >
            {plan.name}
          </h3>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-carbon-600">
            {plan.tagline}
          </p>
        </div>

        {/* Price */}
        <div className="mt-6">
          <Price
            value={price}
            period={period === 'annual' ? 'yr' : 'mo'}
            valueClass={plan.featured ? 'text-foil' : 'text-carbon-50'}
          />
          <AnimatePresence initial={false}>
            {period === 'annual' && (
              <motion.p
                key="annual-label"
                className="mt-1.5 font-mono text-[0.62rem] tracking-[0.14em] text-carbon-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                BILLED ANNUALLY · SAVE 20%
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div
          className="my-6 h-px w-full"
          style={{
            background: plan.featured
              ? 'linear-gradient(90deg, transparent, rgba(248,195,82,0.2), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
          }}
        />

        {/* CTA */}
        <a
          href={plan.href}
          className={cn(
            'group/btn relative inline-flex w-full items-center justify-center overflow-hidden rounded-full py-3.5 text-[0.88rem] font-semibold transition-all duration-300',
            plan.featured
              ? 'bg-gold-400 text-carbon-950 shadow-[0_8px_32px_-8px_rgba(232,150,15,0.55)] hover:bg-gold-300 hover:shadow-[0_12px_40px_-8px_rgba(232,150,15,0.7)]'
              : 'border border-ink-200/18 bg-ink-200/[0.05] text-carbon-100 hover:border-ink-200/36 hover:bg-ink-200/[0.1]',
          )}
        >
          {/* Hover shimmer on non-featured */}
          {!plan.featured && (
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 group-hover/btn:translate-x-[100%]" />
          )}
          <span className="relative">{plan.cta}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="relative ml-2 transition-transform duration-300 group-hover/btn:translate-x-1"
          >
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>

        {/* Features */}
        <ul className="mt-7 space-y-3">
          {plan.features.map((f) => (
            <li key={f.text} className="flex items-start gap-3 text-[0.82rem]">
              {f.included ? (
                <span
                  className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: plan.featured
                      ? 'rgba(232,150,15,0.15)'
                      : 'rgba(123,110,245,0.15)',
                  }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke={plan.featured ? '#F8C352' : '#7B6EF5'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              ) : (
                <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
              <span className={f.included ? 'text-carbon-300' : 'text-carbon-700 line-through decoration-carbon-800'}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom accent on featured */}
      {plan.featured && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(248,195,82,0.4), transparent)',
          }}
          aria-hidden="true"
        />
      )}
    </motion.article>
  )
}

// ── Goo toggle — adapted from the reference, Wytnest colours ─────────────────
const GOO_CSS = `
  .pt-wrap {
    --on: #E8960F;
    --off: #1C1838;
    position: relative;
    aspect-ratio: 292/142;
    height: 3rem;
    flex-shrink: 0;
    transition: filter 0.5s ease;
    cursor: pointer;
  }
  /* Gold glow when annual is active */
  .pt-wrap:has(.pt-chk:checked) {
    filter: drop-shadow(0 0 18px rgba(232,150,15,0.42));
  }
  /* Click squeeze feedback — works because label:active covers the whole row */
  .pt-wrap:active { transform: scale(0.94); transition: transform 0.1s ease; }

  .pt-chk {
    appearance: none; -webkit-appearance: none;
    position: absolute; inset: 0; z-index: 1;
    width: 100%; height: 100%; margin: 0; cursor: pointer;
  }
  .pt-svg { width: 100%; height: 100%; overflow: visible; display: block; }

  /* Background pill shape */
  .pt-bg {
    fill: var(--off);
    stroke: rgba(255,255,255,0.1);
    stroke-width: 2;
    transition: fill 0.42s ease, stroke 0.42s ease;
  }
  .pt-chk:checked + .pt-svg .pt-bg {
    fill: var(--on);
    stroke: rgba(232,150,15,0.2);
  }

  /* Centre connector rect — spring overshoot easing */
  .pt-pill {
    transition: transform 0.54s cubic-bezier(0.34, 1.5, 0.64, 1);
  }
  .pt-chk:checked + .pt-svg .pt-pill {
    transform: translateX(150px);
  }

  /*
    CRITICAL: transform-box: fill-box makes transform-origin: center
    resolve to the SVG element's own bounding box, not the viewport.
    Without it the circles scale from the wrong origin and fly off-screen.
  */
  .pt-dot {
    transform-box: fill-box;
    transform-origin: center;
  }

  /* Left circle: quick ease-in collapse */
  .pt-dot.l {
    transform: scale(1);
    transition: transform 0.28s cubic-bezier(0.4, 0, 1, 1);
  }
  .pt-chk:checked + .pt-svg .pt-dot.l {
    transform: scale(0);
  }

  /* Right circle: spring pop-in with a brief delay */
  .pt-dot.r {
    transform: scale(0);
    transition: transform 0.5s cubic-bezier(0.34, 1.5, 0.64, 1) 0.1s;
  }
  .pt-chk:checked + .pt-svg .pt-dot.r {
    transform: scale(1);
  }

  /* Icon fills */
  .pt-icon { transition: fill 0.38s ease; }
  .pt-icon.on  { fill: rgba(255,255,255,0.22); }
  .pt-chk:checked + .pt-svg .pt-icon.on  { fill: rgba(255,255,255,0.92); }
  .pt-icon.off { fill: rgba(255,255,255,0.12); }
  .pt-chk:checked + .pt-svg .pt-icon.off { fill: rgba(10,9,23,0.38); }
`

function BillingToggle({ annual, onChange }: { annual: boolean; onChange: () => void }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GOO_CSS }} />
      <div className="pt-wrap">
        <input
          type="checkbox"
          className="pt-chk"
          checked={annual}
          onChange={onChange}
          aria-label="Switch to annual billing"
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 292 142" className="pt-svg">
          <path
            d="M71 142C31.7878 142 0 110.212 0 71C0 31.7878 31.7878 0 71 0C110.212 0 119 30 146 30C173 30 182 0 221 0C260 0 292 31.7878 292 71C292 110.212 260.212 142 221 142C181.788 142 173 112 146 112C119 112 110.212 142 71 142Z"
            className="pt-bg"
          />
          {/* Monthly icon — vertical bar, left side */}
          <rect rx={6} height={64} width={12} y={39} x={64} className="pt-icon on" />
          {/* Annual icon — ring/orbit, right side */}
          <path
            d="M221 91C232.046 91 241 82.0457 241 71C241 59.9543 232.046 51 221 51C209.954 51 201 59.9543 201 71C201 82.0457 209.954 91 221 91ZM221 103C238.673 103 253 88.6731 253 71C253 53.3269 238.673 39 221 39C203.327 39 189 53.3269 189 71C189 88.6731 203.327 103 221 103Z"
            fillRule="evenodd"
            className="pt-icon off"
          />
          {/*
            feGaussianBlur stdDeviation=22 + feColorMatrix contrast=24/-10:
            the blob only merges in the goo filter when shapes are within
            ~2σ of each other. At 3rem display height the SVG scale is
            ~0.338, so σ≈22*0.338≈7.4px — enough to bridge the 35-unit gap
            between pill and right circle (35*0.338≈11.8px < 2*7.4=14.8px).
          */}
          <g filter="url('#pt-goo')">
            <rect fill="#fff" rx={29} height={58} width={116} y={42} x={13} className="pt-pill" />
            <rect fill="#fff" rx={58} height={114} width={114} y={14} x={14} className="pt-dot l" />
            <rect fill="#fff" rx={58} height={114} width={114} y={14} x={164} className="pt-dot r" />
          </g>
          <filter id="pt-goo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={22} result="blur" in="SourceGraphic" />
            <feColorMatrix
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
              mode="matrix" in="blur" result="goo"
            />
          </filter>
        </svg>
      </div>
    </>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
export function Pricing() {
  const [currency, setCurrency] = useState<'ngn' | 'usd'>('ngn')
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="relative py-28">

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[800px] -translate-y-1/2"
        style={{
          background:
            'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(79,63,204,0.065), transparent)',
        }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4 text-carbon-600">Pricing</p>
          <h2 className="font-display text-display font-extrabold text-carbon-50">
            Priced for the African market
          </h2>
          <p className="mt-4 text-base leading-relaxed text-carbon-500">
            Pay in Naira or USD. Cancel anytime. No hidden fees.
          </p>
        </div>

        {/* Toggles */}
        <div className="mt-10 flex flex-col items-center gap-5">

          {/* Currency pill — sliding indicator */}
          <div
            className="relative inline-flex rounded-full p-1"
            style={{
              background: 'rgba(18,16,38,0.7)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Sliding background */}
            <motion.div
              className="absolute top-1 h-[calc(100%-8px)] rounded-full"
              style={{ background: 'linear-gradient(90deg, #E8960F, #F8C352)' }}
              animate={{
                x: currency === 'ngn' ? 0 : '100%',
                width: '50%',
              }}
              transition={{ type: 'spring', bounce: 0.22, duration: 0.42 }}
            />
            {(['ngn', 'usd'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={cn(
                  'relative z-10 min-w-[6rem] rounded-full px-5 py-2 text-[0.82rem] font-medium transition-colors duration-300',
                  currency === c ? 'text-carbon-950' : 'text-carbon-500 hover:text-carbon-300',
                )}
              >
                {c === 'ngn' ? '₦ Naira' : '$ USD'}
              </button>
            ))}
          </div>

          {/* Annual toggle */}
          <label className="inline-flex cursor-pointer select-none items-center gap-5 text-[0.84rem] leading-none">
            <span
              className={cn(
                'transition-colors duration-300',
                !annual ? 'font-medium text-carbon-100' : 'text-carbon-500',
              )}
            >
              Monthly
            </span>

            <BillingToggle annual={annual} onChange={() => setAnnual(!annual)} />

            <span
              className={cn(
                'inline-flex items-center gap-1.5 transition-colors duration-300',
                annual ? 'font-medium text-carbon-100' : 'text-carbon-500',
              )}
            >
              Annual
              <AnimatePresence>
                {annual && (
                  <motion.span
                    className="inline-block rounded-full px-2 py-0.5 font-mono text-[0.58rem]
                               font-semibold tracking-[0.12em] text-carbon-950"
                    style={{ background: 'linear-gradient(90deg, #F8C352, #E8960F)' }}
                    initial={{ opacity: 0, scale: 0.75, x: -4 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.75, x: -4 }}
                    transition={{ duration: 0.25, ease: E_OUT }}
                  >
                    SAVE 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </label>
        </div>

        {/* Cards */}
        <div className="mt-16 grid gap-5 lg:grid-cols-3 lg:items-start">
          {PLANS.map((plan, idx) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              currency={currency}
              period={annual ? 'annual' : 'monthly'}
              idx={idx}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          className="mt-12 text-center font-mono text-[0.68rem] tracking-[0.18em] text-carbon-700"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          ALL PLANS INCLUDE A 14-DAY FREE TRIAL · NO CARD REQUIRED · PAYSTACK & STRIPE
        </motion.p>
      </div>
    </section>
  )
}
