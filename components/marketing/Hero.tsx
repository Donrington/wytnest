'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion'
import * as THREE from 'three'
import { WitnessWall } from './WitnessWall'

const FONT_D = "var(--font-display),'Bricolage Grotesque',system-ui,sans-serif"
const FONT_Q = "var(--font-quote),'Fraunces',Georgia,serif"
const EASE_OUT = [0.16, 1, 0.3, 1] as const

// ── Animated counter ──────────────────────────────────────────────────────────
function CountUp({ to, duration = 1.9, delay = 0.7 }: { to: number; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf: number
    const origin = performance.now() + delay * 1000
    const tick = (now: number) => {
      if (now < origin) { raf = requestAnimationFrame(tick); return }
      const t = Math.min((now - origin) / (duration * 1000), 1)
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setVal(to)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration, delay])
  return <>{val.toLocaleString()}</>
}

// ── Word reveal ───────────────────────────────────────────────────────────────
const wordContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.026, delayChildren: 0.92 } },
}
const wordItem = {
  hidden: { y: '115%' },
  show:   { y: '0%', transition: { duration: 0.72, ease: EASE_OUT } },
}

function Words({ text, isMobile = false }: { text: string; isMobile?: boolean }) {
  if (isMobile) {
    return (
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9, ease: EASE_OUT }}
        aria-label={text}
      >
        {text}
      </motion.span>
    )
  }
  const parts = text.split(' ')
  return (
    <motion.span variants={wordContainer} initial="hidden" animate="show" aria-label={text}>
      {parts.map((word, i) => (
        <span key={i}>
          <span
            className="inline-block overflow-hidden"
            style={{ paddingBottom: '0.12em', marginBottom: '-0.12em', verticalAlign: 'bottom' }}
          >
            <motion.span className="inline-block" variants={wordItem}>
              {word}
            </motion.span>
          </span>
          {i < parts.length - 1 ? ' ' : ''}
        </span>
      ))}
    </motion.span>
  )
}

// ── SVG Headline — desktop only (lg+) ────────────────────────────────────────
function HeadlineSVG() {
  return (
    <svg
      viewBox="0 0 1440 395"
      width="100%"
      role="img"
      aria-label="Proof that people Believe."
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <linearGradient id="foilFill" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#F8C352" />
          <stop offset="45%"  stopColor="#E8960F">
            <animate attributeName="stop-color"
                     values="#E8960F;#FFF6B0;#F8C352;#E8960F"
                     dur="4s" begin="2.4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#B5700A" />
        </linearGradient>
        <linearGradient id="foilUnderline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"   stopColor="#F8C352" />
          <stop offset="0.6" stopColor="#E8960F" />
          <stop offset="1"   stopColor="#B5700A" />
        </linearGradient>
      </defs>

      <motion.path
        d="M0 370 C 200 361, 450 357, 662 364 S 825 373, 900 368"
        fill="none"
        stroke="url(#foilUnderline)"
        strokeWidth="5.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 1.1, delay: 0.85, ease: [0.4, 0, 0.2, 1] },
          opacity:    { duration: 0.01, delay: 0.85 },
        }}
      />

      <motion.g
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <text x="0" y="158" fill="#EDEAFF" fontWeight="900" fontSize="150"
              style={{ fontFamily: FONT_D, letterSpacing: '-0.05em' }}>
          Proof That
        </text>
      </motion.g>

      <motion.g
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
      >
        <text x="0" y="345">
          <tspan fill="#EDEAFF" fontWeight="900" fontSize="150"
                 style={{ fontFamily: FONT_D, letterSpacing: '-0.05em' }}>
            People{' '}
          </tspan>
          <tspan fill="url(#foilFill)" fontWeight="300" fontStyle="italic" fontSize="160"
                 style={{ fontFamily: FONT_Q, letterSpacing: '-0.035em' }}>
            Believe.
          </tspan>
        </text>
      </motion.g>
    </svg>
  )
}

// ── Three.js particle field ───────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Skip on touch/mobile — Three.js WebGL is too GPU-intensive
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 5

    const count     = 220
    const positions = new Float32Array(count * 3)
    const colors    = new Float32Array(count * 3)
    const palettes  = [
      new THREE.Color('#7B6EF5'),
      new THREE.Color('#4F3FCC'),
      new THREE.Color('#B0A8FC'),
      new THREE.Color('#E8960F'),
    ]
    for (let i = 0; i < count; i++) {
      positions[i*3]   = (Math.random()-0.5)*16
      positions[i*3+1] = (Math.random()-0.5)*10
      positions[i*3+2] = (Math.random()-0.5)*10
      const c = palettes[Math.floor(Math.random() * palettes.length)]
      colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true })
    const pts = new THREE.Points(geo, mat)
    scene.add(pts)

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x =  (e.clientX/window.innerWidth - 0.5)*2
      mouseRef.current.y = -(e.clientY/window.innerHeight - 0.5)*2
    }
    const onResize = () => {
      camera.aspect = window.innerWidth/window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('resize', onResize)

    let raf: number, t = 0
    const tick = () => {
      raf = requestAnimationFrame(tick); t += 0.0005
      pts.rotation.y = t*0.04  + mouseRef.current.x*0.05
      pts.rotation.x = t*0.016 + mouseRef.current.y*0.025
      camera.position.x += (mouseRef.current.x*0.22 - camera.position.x)*0.035
      camera.position.y += (mouseRef.current.y*0.16 - camera.position.y)*0.035
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', onResize)
      geo.dispose(); mat.dispose(); renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 -z-20" aria-hidden="true" />
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(79,63,204,0.10) 0%, transparent 70%)`
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(hover: none) and (pointer: coarse)').matches)
  }, [])

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden pb-16 pt-20 sm:justify-end sm:pb-20 sm:pt-24 lg:pt-28"
      onMouseMove={isMobile ? undefined : (e) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }}
    >
      <ParticleField />
      <WitnessWall />

      {/* Cursor spotlight — desktop only */}
      {!isMobile && (
        <motion.div
          className="pointer-events-none absolute inset-0 -z-[3]"
          style={{ background: spotlight }}
          aria-hidden="true"
        />
      )}

      {/* Violet aurora — shifted right so WitnessWall glows on the right half */}
      <div
        className="pointer-events-none absolute right-[4%] top-[42%] -z-[5] -translate-y-1/2 rounded-full
                   h-[280px] w-[320px] opacity-[0.16] blur-[80px]
                   sm:h-[860px] sm:w-[1000px] sm:opacity-[0.24] sm:blur-[170px] sm:animate-glow-pulse"
        style={{ background: 'radial-gradient(ellipse, #4F3FCC 0%, #7B6EF5 42%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Mobile vignette — uniform center-dark so text is readable over full-width WitnessWall */}
      <div
        className="pointer-events-none absolute inset-0 -z-[4] sm:hidden"
        style={{
          background: 'radial-gradient(ellipse 110% 80% at 50% 60%, rgba(8,7,22,0.96) 0%, rgba(8,7,22,0.88) 45%, rgba(8,7,22,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Desktop vignette — heavy left (text readable), dissolves right (WitnessWall shows through) */}
      <div
        className="pointer-events-none absolute inset-0 -z-[4] hidden sm:block"
        style={{
          background: 'linear-gradient(102deg, rgba(8,7,22,0.98) 0%, rgba(8,7,22,0.93) 24%, rgba(8,7,22,0.62) 48%, rgba(8,7,22,0.14) 72%, rgba(8,7,22,0.03) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top & bottom edge vignette */}
      <div
        className="pointer-events-none absolute inset-0 -z-[3]"
        style={{
          background: 'linear-gradient(to bottom, rgba(8,7,22,0.78) 0%, transparent 17%, transparent 72%, rgba(8,7,22,0.88) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-9xl px-6 sm:px-10 lg:px-16 xl:px-20">

        {/* ── Eyebrow — architectural: gold rule + pulse dot + tracking label ── */}
        <motion.div
          className="mb-7 flex items-center justify-center gap-3 sm:mb-9 sm:justify-start sm:gap-3.5"
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: EASE_OUT }}
        >
          <div
            className="h-px w-9 shrink-0"
            style={{ background: 'linear-gradient(90deg, #F8C352, #E8960F)' }}
          />
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gold-400" />
          </span>
          <span className="eyebrow tracking-[0.14em] text-carbon-500 sm:tracking-[0.22em]">
            <CountUp to={2847} /> testimonials captured today
          </span>
        </motion.div>

        {/* ── Mobile / tablet heading (hidden on lg+) ── */}
        <div className="mb-6 text-center sm:mb-10 sm:text-left lg:hidden">
          <motion.h1
            className="font-black leading-[1.04] tracking-[-0.04em]"
            style={{ fontFamily: FONT_D, fontSize: 'clamp(2.6rem, 9.5vw, 4.5rem)', color: '#EDEAFF' }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            Proof That People
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="font-light italic leading-[1.04] tracking-[-0.035em]"
              style={{
                fontFamily: FONT_Q,
                fontSize: 'clamp(2.85rem, 10.5vw, 4.85rem)',
                background: 'linear-gradient(100deg, #F8C352 0%, #E8960F 55%, #B5700A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'block',
              }}
            >
              Believe.
            </span>
          </motion.div>

          {/* Foil underline */}
          <motion.div
            className="mx-auto mt-3 rounded-full sm:mx-0"
            style={{
              height: 3,
              width: 'min(54%, 220px)',
              background: 'linear-gradient(90deg, #F8C352 0%, #E8960F 60%, #B5700A 100%)',
              originX: 0.5,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.85, ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        {/* ── Desktop SVG heading (lg+) ── */}
        <div className="hidden lg:block">
          <HeadlineSVG />
        </div>

        {/* ── Below headline: asymmetric editorial split ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[54fr_46fr] xl:mt-12">

          {/* LEFT — description + CTAs + stats */}
          <div className="flex flex-col gap-6">

            {/* Description */}
            <p className="max-w-none text-center text-[0.95rem] leading-[1.75] tracking-[0.01em] text-carbon-300
                          sm:max-w-[46ch] sm:text-left sm:text-[1.1rem] lg:max-w-[38ch] lg:text-[1.22rem]">
              <Words text="Collect video and text testimonials on autopilot. Display them in widgets so well-made your landing page looks agency-built — and converts like it." isMobile={isMobile} />
            </p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 1.55, ease: EASE_OUT }}
            >
              {/* Primary — button-in-button pattern */}
              <motion.a
                href="/signup"
                className="group inline-flex w-full items-center justify-between gap-0 rounded-full bg-gold-400 py-1.5 pl-7 pr-1.5 sm:w-auto sm:justify-start"
                style={{ boxShadow: '0 12px 48px -12px rgba(232,150,15,0.55)', willChange: 'transform' }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 16px 56px -10px rgba(232,150,15,0.72)',
                  transition: { duration: 0.25, ease: EASE_OUT },
                }}
                whileTap={{ scale: 0.97, transition: { duration: 0.12 } }}
              >
                <span className="pr-5 font-body text-[0.95rem] font-semibold text-carbon-950 whitespace-nowrap">
                  Start collecting free
                </span>
                {/* Nested icon circle */}
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/[0.09]
                             transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
                             group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:bg-black/[0.14]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </motion.a>

              {/* Secondary — icon circle + text link (no ghost pill border) */}
              <motion.a
                href="#widgets"
                className="inline-flex items-center gap-2.5 text-[0.88rem] font-medium text-carbon-400
                           transition-colors duration-300 hover:text-carbon-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 1.7, ease: EASE_OUT }}
                whileTap={{ scale: 0.97 }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                             transition-colors duration-300"
                  style={{
                    background: 'rgba(176,168,252,0.06)',
                    border: '1px solid rgba(176,168,252,0.14)',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M10 8l5 4-5 4V8z" fill="currentColor" />
                  </svg>
                </span>
                See live widgets
              </motion.a>
            </motion.div>

            {/* Stats row — concrete numbers replace generic trust badges */}
            <motion.div
              className="flex flex-wrap justify-center gap-x-5 gap-y-4 border-t pt-5 sm:justify-start sm:gap-x-8 sm:pt-6"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.85, ease: EASE_OUT }}
            >
              {[
                { value: '2,847', label: 'testimonials captured' },
                { value: '94.3%', label: 'publish rate' },
                { value: '47 sec', label: 'avg to collect' },
              ].map((s, i) => (
                <div key={i} className="shrink-0 text-center sm:text-left">
                  <p
                    className="font-mono text-[1.15rem] font-semibold tracking-tight text-ink-100"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[0.6rem] tracking-[0.12em] uppercase text-carbon-600">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>

          </div>

          {/* RIGHT — empty; directional vignette dissolves here so WitnessWall glows through */}
          <div className="hidden lg:block" aria-hidden="true" />

        </div>
      </div>

      {/* Scroll indicator — hidden on mobile, bottom-left on sm+ */}
      <motion.button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="group absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.15, ease: EASE_OUT }}
        aria-label="Scroll down"
      >
        <motion.div
          className="relative flex h-8 w-5 items-start justify-center overflow-hidden rounded-[12px] pt-[5px]"
          style={{
            border: '1px solid rgba(176,168,252,0.13)',
            background: 'rgba(18,16,38,0.32)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          whileHover={{
            borderColor: 'rgba(248,195,82,0.32)',
            boxShadow: '0 0 12px -4px rgba(232,150,15,0.18)',
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="h-1 w-1 shrink-0 rounded-full"
            style={{ background: '#E8960F' }}
            animate={{ y: [0, 8, 0], opacity: [1, 0.35, 1] }}
            transition={{ duration: 1.55, repeat: Infinity, ease: [0.4, 0, 0.6, 1], repeatDelay: 0.25 }}
          />
        </motion.div>
        <span className="eyebrow text-[0.48rem] tracking-[0.32em] text-carbon-700
                         transition-colors duration-300 group-hover:text-carbon-500">
          scroll
        </span>
      </motion.button>
    </section>
  )
}
