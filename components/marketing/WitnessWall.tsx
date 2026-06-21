'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion'
import { MOCK_TESTIMONIALS, type MockTestimonial } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

// Accent palette — ink / gold / teal
const ACCENT = {
  ink:  { dot: '#7B6EF5', glow: 'rgba(79,63,204,0.32)',  border: 'rgba(123,110,245,0.22)' },
  gold: { dot: '#F8C352', glow: 'rgba(232,150,15,0.28)',  border: 'rgba(248,195,82,0.22)'  },
  teal: { dot: '#2DD4BF', glow: 'rgba(45,212,191,0.28)',  border: 'rgba(45,212,191,0.22)'  },
}

function Stars({ n = 5, color }: { n?: number; color: string }) {
  return (
    <div className="mb-3 flex items-center gap-[3px]">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1.5 font-mono text-[0.62rem] tracking-widest" style={{ color }}>
        5.0
      </span>
    </div>
  )
}

function WallCard({ t }: { t: MockTestimonial }) {
  const ac = ACCENT[t.accent]

  return (
    <figure
      className="group relative cursor-default overflow-hidden rounded-[1.15rem] p-5
                 transition-all duration-500 ease-out hover:-translate-y-1.5"
      style={{
        background: 'linear-gradient(160deg, rgba(30,26,66,0.62) 0%, rgba(13,11,30,0.68) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: `
          0 0 0 1px ${ac.border},
          0 1px 0 0 rgba(255,255,255,0.07) inset,
          0 24px 56px -20px rgba(0,0,0,0.85),
          0 0 48px -22px ${ac.glow}
        `,
      }}
    >
      {/* Top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

      {/* Noise grain */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '160px 160px',
        }}
      />

      {/* Hover glow bloom */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${ac.glow} 0%, transparent 72%)` }}
      />

      {/* Accent side stripe */}
      <div
        className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full opacity-55"
        style={{ background: `linear-gradient(to bottom, transparent, ${ac.dot}, transparent)` }}
      />

      <div className="relative pl-3">
        <Stars n={t.rating} color={ac.dot} />

        <blockquote
          className="testimony text-[0.9rem] leading-[1.68] text-carbon-50/78
                     transition-colors duration-300 group-hover:text-carbon-50/92"
        >
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <figcaption className="mt-4 flex items-center gap-2.5">
          <div
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                       text-[0.6rem] font-bold tracking-[0.08em]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${ac.dot}28, ${ac.dot}08)`,
              boxShadow: `0 0 0 1px ${ac.border}, inset 0 1px 0 rgba(255,255,255,0.08)`,
              color: ac.dot,
            }}
          >
            {initials(t.name)}
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[0.78rem] font-semibold text-carbon-50/95">{t.name}</div>
            <div className="truncate text-[0.68rem] text-carbon-400/80">{t.role}, {t.company}</div>
          </div>

          {t.type === 'video' && (
            <div className="relative ml-auto flex h-[22px] w-[22px] shrink-0 items-center justify-center">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-25"
                style={{ backgroundColor: ac.dot }}
              />
              <span
                className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full"
                style={{
                  background: `${ac.dot}1A`,
                  boxShadow: `0 0 0 1px ${ac.border}`,
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill={ac.dot}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          )}
        </figcaption>
      </div>
    </figure>
  )
}

// JS-driven vertical scroll — immune to CSS animation issues & prefers-reduced-motion
function Column({
  items,
  direction,
  duration,
  targetOpacity = 1,
  className = '',
}: {
  items: MockTestimonial[]
  direction: 'up' | 'down'
  duration: number
  targetOpacity?: number
  className?: string
}) {
  // Double the items so content wraps seamlessly
  const doubled = [...items, ...items]
  const colRef = useRef<HTMLDivElement>(null)
  // null = not yet initialized (we set the correct starting position on first frame)
  const posRef = useRef<number | null>(null)
  const y = useMotionValue(0)
  const op = useMotionValue(0)   // hidden until first frame sets correct position

  useAnimationFrame((_, delta) => {
    const el = colRef.current
    if (!el) return
    const halfH = el.scrollHeight / 2
    if (halfH < 1) return

    // On first frame: snap to correct starting position, then reveal
    if (posRef.current === null) {
      // 'down' content drifts downward → starts shifted up (at -halfH)
      // 'up'   content drifts upward   → starts at 0
      posRef.current = direction === 'down' ? -halfH : 0
      y.set(posRef.current)
      op.set(targetOpacity)
      return
    }

    // px per second so one full loop takes `duration` seconds
    const speed = halfH / duration

    let pos = posRef.current
    if (direction === 'up') {
      pos -= speed * (delta / 1000)
      if (pos <= -halfH) pos += halfH   // seamless wrap
    } else {
      pos += speed * (delta / 1000)
      if (pos >= 0) pos -= halfH        // seamless wrap
    }
    posRef.current = pos
    y.set(pos)
  })

  return (
    <motion.div
      ref={colRef}
      className={`witness-col ${className}`}
      style={{ y, opacity: op, willChange: 'transform' }}
    >
      {doubled.map((t, i) => <WallCard key={`${t.id}-${i}`} t={t} />)}
    </motion.div>
  )
}

export function WitnessWall() {
  const all = MOCK_TESTIMONIALS
  // Each column gets ALL testimonials starting from a different offset → 8 items before
  // doubling, 16 after. At ~190 px per card this yields ~3 200 px per column — well above
  // any viewport height — so the seamless wrap never shows an empty gap.
  const cols = ([0, 2, 4, 6] as const).map(
    offset => [...all.slice(offset), ...all.slice(0, offset)],
  )
  const dirs: ('up' | 'down')[] = ['down', 'up', 'down', 'up']
  const durations = [40, 48, 44, 52]
  const opacities  = [0.52, 0.70, 0.70, 0.52]

  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 grid grid-cols-2 gap-3.5 overflow-hidden px-3 md:grid-cols-4"
      aria-hidden="true"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)',
      }}
    >
      {cols.map((c, i) => (
        <Column
          key={i}
          items={c}
          direction={dirs[i]}
          duration={durations[i]}
          targetOpacity={opacities[i]}
          className={i > 1 ? 'hidden md:flex' : ''}
        />
      ))}
    </div>
  )
}
