'use client'

import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { LogoMarquee, HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { Pricing } from '@/components/marketing/Pricing'
import { CTA, Footer } from '@/components/marketing/CTA'
import { FAQ } from '@/components/marketing/FAQ'
import { useScrollReveal } from '@/lib/use-scroll-reveal'

export default function HomePage() {
  useScrollReveal()

  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <LogoMarquee />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  )
}
