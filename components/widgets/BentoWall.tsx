'use client'

import { motion } from 'framer-motion'
import { MOCK_TESTIMONIALS, type MockTestimonial } from '@/lib/mock-data'
import { initials } from '@/lib/utils'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(79,63,204,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

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

function Card({
  t,
  index,
  dark,
  accent,
  radius,
}: {
  t: MockTestimonial
  index: number
  dark: boolean
  accent: string
  radius: number
}) {
  const glow   = hexToRgba(accent, dark ? 0.32 : 0.16)
  const border = hexToRgba(accent, dark ? 0.22 : 0.14)
  const cr     = `${Math.max(radius, 4)}px`

  return (
    <motion.figure
      className="group relative mb-4 cursor-default overflow-hidden break-inside-avoid"
      style={{
        borderRadius: cr,
        background: dark
          ? 'linear-gradient(160deg, rgba(30,26,66,0.62) 0%, rgba(13,11,30,0.68) 100%)'
          : 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(248,246,255,0.86) 100%)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: dark
          ? `0 0 0 1px ${border}, 0 1px 0 0 rgba(255,255,255,0.07) inset, 0 24px 56px -20px rgba(0,0,0,0.85), 0 0 48px -22px ${glow}`
          : `0 0 0 1px ${border}, 0 1px 0 0 rgba(255,255,255,0.96) inset, 0 6px 28px -6px rgba(0,0,0,0.09), 0 0 40px -20px ${glow}`,
      }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.07, ease: E_OUT }}
      whileHover={{ y: -4, transition: { duration: 0.3, ease: E_OUT } }}
    >
      {/* Top-edge highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: dark
            ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)'
            : 'linear-gradient(to right, transparent, rgba(255,255,255,0.95), transparent)',
        }}
      />

      {/* Noise grain — dark only */}
      {dark && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.028]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px 160px',
          }}
        />
      )}

      {/* Hover glow bloom */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${glow} 0%, transparent 72%)` }}
      />

      {/* Accent side stripe */}
      <div
        className="absolute left-0 top-5 bottom-5 w-[2px] rounded-full"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent}, transparent)`,
          opacity: dark ? 0.55 : 0.65,
        }}
      />

      <div className="relative p-5 pl-[1.375rem]">
        {t.type === 'video' && (
          <div
            className="relative mb-4 flex aspect-video items-center justify-center overflow-hidden"
            style={{
              background: dark
                ? 'linear-gradient(135deg, rgba(20,16,50,0.9), rgba(30,26,66,0.6))'
                : 'linear-gradient(135deg, rgba(235,232,255,0.9), rgba(218,214,255,0.7))',
              boxShadow: `0 0 0 1px ${border}`,
              borderRadius: `${Math.max(radius - 4, 4)}px`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{ background: `radial-gradient(circle at 70% 30%, ${glow}, transparent 60%)` }}
            />
            <motion.span
              className="relative flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: `${accent}22`,
                boxShadow: `0 0 0 1px ${border}, 0 0 24px -6px ${glow}`,
              }}
              whileHover={{ scale: 1.12 }}
              transition={{ type: 'spring', bounce: 0.3 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={accent}><path d="M8 5v14l11-7z" /></svg>
            </motion.span>
          </div>
        )}

        <Stars color={accent} />

        <blockquote
          className="testimony text-[0.88rem] leading-[1.68] transition-colors duration-300"
          style={{ color: dark ? 'rgba(220,216,255,0.78)' : '#3D3A5C' }}
        >
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <figcaption className="mt-4 flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold tracking-[0.08em]"
            style={{
              background: `radial-gradient(circle at 35% 30%, ${accent}28, ${accent}08)`,
              boxShadow: `0 0 0 1px ${border}, inset 0 1px 0 ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'}`,
              color: accent,
            }}
          >
            {initials(t.name)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div
              className="truncate text-[0.78rem] font-semibold"
              style={{ color: dark ? 'rgba(240,238,255,0.95)' : '#0F0D24' }}
            >
              {t.name}
            </div>
            <div
              className="truncate text-[0.68rem]"
              style={{ color: dark ? 'rgba(155,152,190,0.80)' : '#7A77A0' }}
            >
              {t.role}, {t.company}
            </div>
          </div>
          {t.type === 'video' && (
            <div className="relative ml-auto flex h-[22px] w-[22px] shrink-0 items-center justify-center">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-25"
                style={{ backgroundColor: accent }}
              />
              <span
                className="relative inline-flex h-[22px] w-[22px] items-center justify-center rounded-full"
                style={{ background: `${accent}1A`, boxShadow: `0 0 0 1px ${border}` }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill={accent}><path d="M8 5v14l11-7z" /></svg>
              </span>
            </div>
          )}
        </figcaption>
      </div>
    </motion.figure>
  )
}

export function BentoWall({
  dark   = true,
  accent = '#4F3FCC',
  radius = 12,
}: {
  dark?:   boolean
  accent?: string
  radius?: number
}) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
      {MOCK_TESTIMONIALS.map((t, i) => (
        <Card key={t.id} t={t} index={i} dark={dark} accent={accent} radius={radius} />
      ))}
    </div>
  )
}
