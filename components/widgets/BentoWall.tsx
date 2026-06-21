'use client'

import { motion } from 'framer-motion'
import { MOCK_TESTIMONIALS, type MockTestimonial } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

const ACCENT: Record<string, { dot: string; glow: string; border: string }> = {
  ink:  { dot: '#7B6EF5', glow: 'rgba(79,63,204,0.32)',  border: 'rgba(123,110,245,0.22)' },
  gold: { dot: '#F8C352', glow: 'rgba(232,150,15,0.28)',  border: 'rgba(248,195,82,0.22)'  },
  teal: { dot: '#2DD4BF', glow: 'rgba(45,212,191,0.28)',  border: 'rgba(45,212,191,0.22)'  },
}

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function Stars({ color }: { color: string }) {
  return (
    <div className="mb-3 flex items-center gap-[3px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1.5 font-mono text-[0.6rem] tracking-widest" style={{ color }}>5.0</span>
    </div>
  )
}

function Card({ t, index }: { t: MockTestimonial; index: number }) {
  const ac = ACCENT[t.accent]

  return (
    <motion.figure
      className="group relative mb-4 cursor-default overflow-hidden rounded-[1.15rem] break-inside-avoid"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.07, ease: E_OUT }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: E_OUT } }}
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
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.028]"
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

      <div className="relative p-5 pl-[1.375rem]">
        {/* Video placeholder */}
        {t.type === 'video' && (
          <div
            className="relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(20,16,50,0.9), rgba(30,26,66,0.6))',
              boxShadow: `0 0 0 1px ${ac.border}`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(circle at 70% 30%, ${ac.glow}, transparent 60%)` }}
            />
            <motion.span
              className="relative flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: `${ac.dot}22`,
                boxShadow: `0 0 0 1px ${ac.border}, 0 0 24px -6px ${ac.glow}`,
              }}
              whileHover={{ scale: 1.12 }}
              transition={{ type: 'spring', bounce: 0.3 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={ac.dot}><path d="M8 5v14l11-7z" /></svg>
            </motion.span>
          </div>
        )}

        <Stars color={ac.dot} />

        <blockquote className="testimony text-[0.88rem] leading-[1.68] text-carbon-50/78 transition-colors duration-300 group-hover:text-carbon-50/92">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <figcaption className="mt-4 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold tracking-[0.08em]"
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
                style={{ background: `${ac.dot}1A`, boxShadow: `0 0 0 1px ${ac.border}` }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill={ac.dot}><path d="M8 5v14l11-7z" /></svg>
              </span>
            </div>
          )}
        </figcaption>
      </div>
    </motion.figure>
  )
}

export function BentoWall({ dark = false }: { dark?: boolean }) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {MOCK_TESTIMONIALS.map((t, i) => (
        <Card key={t.id} t={t} index={i} />
      ))}
    </div>
  )
}
