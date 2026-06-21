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

function Words({ text }: { text: string }) {
  const parts = text.split(' ')
  return (
    <motion.span variants={wordContainer} initial="hidden" animate="show" aria-label={text}>
      {parts.map((word, i) => (
        // Space sits OUTSIDE overflow:hidden — CSS collapses trailing whitespace
        // inside inline-block blocks, causing words to appear stuck together.
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

// ── Hero ─────────────────────────────────────────────────────────────────────
export function Hero() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const spotlight = useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, rgba(79,63,204,0.11) 0%, transparent 70%)`

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden
                 pt-24 pb-14 sm:pt-28 sm:pb-20"
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY) }}
    >
      <ParticleField />
      <WitnessWall />

      {/* Cursor spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 -z-[3]"
        style={{ background: spotlight }}
        aria-hidden="true"
      />

      {/* Violet aurora */}
      <div
        className="pointer-events-none absolute left-1/2 top-[44%] -z-[5]
                   h-[900px] w-[1200px] -translate-x-1/2 -translate-y-1/2
                   rounded-full opacity-[0.28] blur-[180px] animate-glow-pulse"
        style={{ background: 'radial-gradient(ellipse, #4F3FCC 0%, #7B6EF5 40%, transparent 70%)' }}
        aria-hidden="true"
      />
      {/* Night vignette */}
      <div
        className="pointer-events-none absolute inset-0 -z-[4]"
        style={{
          background: 'radial-gradient(ellipse 80% 65% at 50% 46%, rgba(10,9,23,0.93) 0%, rgba(10,9,23,0.76) 48%, rgba(10,9,23,0.40) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-9xl px-6 sm:px-10 lg:px-16 xl:px-20">

        {/* ── Eyebrow — centred on mobile, left on lg+ ── */}
        <div className="mb-8 flex justify-center sm:mb-10 lg:justify-start">
          <motion.div
            className="inline-flex items-center gap-3 rounded-full
                       bg-ink-200/[0.06] px-5 py-2.5 backdrop-blur-md"
            style={{ boxShadow: '0 0 0 1px rgba(176,168,252,0.15), 0 0 20px -4px rgba(79,63,204,0)' }}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)', boxShadow: '0 0 0 1px rgba(176,168,252,0.15), 0 0 20px -4px rgba(79,63,204,0)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', boxShadow: ['0 0 0 1px rgba(176,168,252,0.15), 0 0 20px -4px rgba(79,63,204,0)', '0 0 0 1px rgba(176,168,252,0.35), 0 0 28px -4px rgba(79,63,204,0.45)', '0 0 0 1px rgba(176,168,252,0.15), 0 0 20px -4px rgba(79,63,204,0)'] }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE_OUT, boxShadow: { delay: 1.8, duration: 2.8, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-400" />
            </span>
            <span className="eyebrow tracking-[0.22em] text-ink-100/80">
              <CountUp to={1247} /> testimonials captured today
            </span>
          </motion.div>
        </div>

        {/* ── Mobile / tablet heading (hidden on lg+) ── */}
        <div className="mb-8 text-center sm:mb-10 lg:hidden">
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

          {/* Foil underline — draws in from centre */}
          <motion.div
            className="mx-auto mt-3 rounded-full"
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

        {/* ── Bottom row ── */}
        <div className="mt-8 flex flex-col items-center gap-8
                        sm:mt-10 lg:mt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20 xl:mt-14">

          {/* Description */}
          <p className="max-w-[34ch] text-center text-[1rem] leading-[1.82] tracking-[0.012em] text-carbon-300
                        sm:max-w-[46ch] sm:text-[1.15rem]
                        lg:max-w-[42ch] lg:text-left lg:text-[1.3rem]">
            <Words text="Collect video and text testimonials on autopilot. Display them in widgets so well-made your landing page looks agency-built — and converts like it." />
          </p>

          <div className="flex w-full shrink-0 flex-col items-center gap-5 sm:w-auto lg:items-start">
            {/* CTA pair */}
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <motion.a
                href="/dashboard"
                className="btn-magnetic group inline-flex items-center justify-center gap-2.5
                           rounded-full bg-gold-400 px-8 py-4 font-body text-[1rem] font-semibold
                           text-carbon-950 sm:text-[1.05rem] whitespace-nowrap"
                style={{
                  boxShadow: '0 12px 56px -12px rgba(232,150,15,0.6)',
                  willChange: 'transform',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 1.55, ease: EASE_OUT }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 16px 64px -10px rgba(232,150,15,0.75)',
                  transition: { duration: 0.25, ease: EASE_OUT },
                }}
                whileTap={{ scale: 0.97, transition: { duration: 0.12 } }}
              >
                Start collecting free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>

              <motion.a
                href="#widgets"
                className="inline-flex items-center justify-center gap-2.5 rounded-full
                           px-8 py-4 font-body text-[1rem] font-medium text-carbon-50
                           sm:text-[1.05rem] whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(176,168,252,0.05)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(176,168,252,0.2)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  willChange: 'transform',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 1.7, ease: EASE_OUT }}
                whileHover={{
                  scale: 1.02,
                  borderColor: 'rgba(176,168,252,0.4)',
                  backgroundColor: 'rgba(176,168,252,0.1)',
                  transition: { duration: 0.25, ease: EASE_OUT },
                }}
                whileTap={{ scale: 0.97, transition: { duration: 0.12 } }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 8l5 4-5 4V8z" fill="currentColor" />
                </svg>
                See live widgets
              </motion.a>
            </div>

            {/* Trust badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.85, ease: EASE_OUT }}
            >
              {['No card required', '14-day trial', 'Paystack & cards'].map((label, i, arr) => (
                <span key={label} className="flex items-center gap-4">
                  <span className="eyebrow tracking-[0.16em] text-carbon-500">{label}</span>
                  {i < arr.length - 1 && <span className="h-px w-4 bg-carbon-800" aria-hidden="true" />}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="group absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.1, ease: EASE_OUT }}
        whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        aria-label="Scroll down"
      >
        {/* Mouse body */}
        <motion.div
          className="relative flex h-10 w-[1.45rem] items-start justify-center overflow-hidden rounded-[20px] pt-[7px]"
          style={{
            border: '1.5px solid rgba(176,168,252,0.18)',
            background: 'rgba(18,16,38,0.45)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
          whileHover={{
            borderColor: 'rgba(248,195,82,0.45)',
            boxShadow: '0 0 18px -4px rgba(232,150,15,0.28)',
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Scrolling dot */}
          <motion.div
            className="h-[5px] w-[5px] shrink-0 rounded-full"
            style={{ background: '#E8960F' }}
            animate={{ y: [0, 11, 0], opacity: [1, 0.35, 1] }}
            transition={{
              duration: 1.55,
              repeat: Infinity,
              ease: [0.4, 0, 0.6, 1],
              repeatDelay: 0.25,
            }}
          />
        </motion.div>

        <span className="eyebrow tracking-[0.26em] text-carbon-700 transition-colors duration-300
                         group-hover:text-carbon-400">
          scroll
        </span>
      </motion.button>
    </section>
  )
}
