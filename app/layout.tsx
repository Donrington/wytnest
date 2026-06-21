import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Geist, Geist_Mono, Bricolage_Grotesque, Fraunces } from 'next/font/google'
import '@/styles/globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-quote',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
  style: ['normal', 'italic'],
})

// Satoshi — body copy, CTAs, descriptions (local variable font)
const satoshi = localFont({
  src: [
    {
      path: '../public/fonts/Satoshi-Variable.woff2',
      weight: '300 900',
      style: 'normal',
    },
    {
      path: '../public/fonts/Satoshi-VariableItalic.woff2',
      weight: '300 900',
      style: 'italic',
    },
  ],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wytnest — Proof that people believe',
  description:
    'Collect stunning video and text testimonials on autopilot. Display them in Awwwards-grade widgets that make your landing page convert. Built for the African market.',
  keywords: ['testimonials', 'social proof', 'SaaS', 'Nigeria', 'video testimonials', 'widgets'],
  authors: [{ name: 'CyberSage', url: 'https://cybersage.dev' }],
  openGraph: {
    title: 'Wytnest — Proof that people believe',
    description: 'Design-forward testimonial collection & display for modern brands.',
    url: 'https://wytnest.com',
    siteName: 'Wytnest',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wytnest — Proof that people believe',
    description: 'Design-forward testimonial collection & display for modern brands.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} ${fraunces.variable} ${satoshi.variable}`}
    >
      <body className="grain antialiased">{children}</body>
    </html>
  )
}
