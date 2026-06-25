'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { LogoMarquee, HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { Pricing } from '@/components/marketing/Pricing'
import { CTA, Footer } from '@/components/marketing/CTA'
import { FAQ } from '@/components/marketing/FAQ'
import { useScrollReveal } from '@/lib/use-scroll-reveal'

function WytnestWidget() {
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://wytnest.vercel.app/embed.js'
    s.dataset.widget = 'f8d30a947af8'
    s.async = true
    document.body.appendChild(s)
    return () => {
      if (document.body.contains(s)) document.body.removeChild(s)
    }
  }, [])
  return <div id="wytnest-widget" />
}

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="btt"
          onClick={scrollTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{    opacity: 0, y: 12, scale: 0.85 }}
          transition={{ duration: 0.38, ease: E_OUT }}
          whileHover={{ scale: 1.1 }}
          whileTap={{  scale: 0.92 }}
          className="group fixed bottom-7 right-7 z-50 flex h-11 w-11 items-center justify-center rounded-full"
          style={{
            background:    'rgba(8,7,22,0.72)',
            backdropFilter:'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border:        '1px solid rgba(248,195,82,0.22)',
            boxShadow:     '0 0 0 1px rgba(0,0,0,0.4), 0 8px 32px -8px rgba(0,0,0,0.7), 0 0 24px -8px rgba(232,150,15,0.25)',
          }}
        >
          {/* Gold glow on hover */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 120%, rgba(232,150,15,0.28) 0%, transparent 70%)' }}
          />
          {/* Chevron icon */}
          <svg
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            className="relative transition-colors duration-200"
            style={{ color: 'rgba(248,195,82,0.80)' }}
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export default function HomePage() {
  useScrollReveal()

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />

      {/* Live widget demo */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3 text-xs uppercase tracking-widest" style={{ color: 'rgba(248,195,82,0.75)' }}>Live demo</p>
          <h2 className="font-display text-3xl font-extrabold text-white">See it in action</h2>
          <p className="mt-3 text-base" style={{ color: '#9390B8' }}>This widget is embedded directly on this page using a single script tag.</p>
        </div>
        <WytnestWidget />
      </section>

      <HowItWorks />
      <Pricing />
      <CTA />
      <FAQ />
      <Footer />
      <BackToTop />
    </main>
  )
}
