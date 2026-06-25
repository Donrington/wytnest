'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useDashTheme } from '@/lib/hooks/useDashTheme'

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Get notified in Slack when a testimonial is received or approved.',
    color: '#4A154B',
    soon: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    id: 'zapier',
    name: 'Zapier',
    desc: 'Trigger Zaps when testimonials are collected — send to CRMs, sheets, or anywhere.',
    color: '#FF4F00',
    soon: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.5 2L3 13.5h7.5L9 22l12-11.5H13.5L14.5 2z" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    desc: 'Send real-time POST events to your own endpoint on any testimonial lifecycle event.',
    color: '#7B6EF5',
    soon: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    desc: 'Auto-sync approved testimonials to a Notion database for your content team.',
    color: '#000000',
    soon: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l3.222-.187z" />
      </svg>
    ),
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    desc: 'Map testimonials to HubSpot contacts and log activity automatically.',
    color: '#FF7A59',
    soon: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.164 7.931V5.085a1.724 1.724 0 0 0 .997-1.56V3.5A1.724 1.724 0 0 0 17.437 1.776h-.025A1.724 1.724 0 0 0 15.688 3.5v.025c0 .694.413 1.295.997 1.56v2.846a4.885 4.885 0 0 0-2.325 1.025L6.4 2.987a1.922 1.922 0 0 0 .048-.427 1.938 1.938 0 1 0-1.938 1.938c.331 0 .638-.088.91-.237l7.83 5.87A4.876 4.876 0 0 0 12.43 12c0 .668.134 1.305.374 1.886l-2.367 1.368A2.844 2.844 0 0 0 8.58 14.71a2.866 2.866 0 1 0 2.866 2.866 2.839 2.839 0 0 0-.44-1.515l2.34-1.353A4.912 4.912 0 0 0 17.425 16.9 4.9 4.9 0 0 0 22.338 12a4.9 4.9 0 0 0-4.174-4.069z" />
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google Reviews',
    desc: 'Import and sync your Google Business reviews as testimonials automatically.',
    color: '#4285F4',
    soon: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
]

const EMBED_STEPS = [
  { n: '1', text: 'Go to Widgets, create or pick a widget, then copy the embed snippet.' },
  { n: '2', text: 'Paste the script tag just before </body> on any page of your site.' },
  { n: '3', text: 'Save & deploy — your widget appears automatically, no page reload needed.' },
]

function IntegrationsContent() {
  const { T } = useDashTheme()
  const [copied, setCopied] = useState(false)

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  const copyExample = () => {
    navigator.clipboard.writeText('<script src="https://wytnest.com/embed.js" data-widget="YOUR_WIDGET_ID" async></script>')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="mb-6">
        <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Integrations</h1>
        <p style={{ color: T.body }} className="mt-1">Embed Wytnest on your site and connect to your stack.</p>
      </div>

      {/* ── Website embed ──────────────────────────────────────────── */}
      <div className="mb-4">
        <p style={{ color: T.muted }} className="mb-3 text-xs font-semibold uppercase tracking-widest">
          Website embed
        </p>
      </div>

      <div
        className="mb-8 overflow-hidden rounded-2xl"
        style={{ border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow }}
      >
        {/* Top: description + CTA */}
        <div
          className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: T.card }}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(79,63,204,0.12)', color: '#7B6EF5' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <div>
              <p style={{ color: T.heading }} className="font-semibold">Script tag embed</p>
              <p style={{ color: T.body }} className="mt-1 max-w-md text-sm leading-relaxed">
                Add one line to your HTML and your widget appears on any page — no framework required. Works with Webflow, Framer, Shopify, WordPress, and plain HTML.
              </p>
            </div>
          </div>
          <a
            href="/dashboard/widgets"
            className="shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            Open widget builder
          </a>
        </div>

        {/* Bottom: code example + steps */}
        <div
          className="grid gap-0 sm:grid-cols-2"
          style={{ borderTop: `1px solid ${T.tableRowBorder}` }}
        >
          {/* Code block */}
          <div
            className="p-5"
            style={{ background: 'rgba(8,7,16,0.88)', borderRight: `1px solid rgba(255,255,255,0.05)` }}
          >
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wide" style={{ color: '#4E4B72' }}>
              Example snippet
            </p>
            <pre className="font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap break-all" style={{ color: '#B8B5D4' }}>
{`<script
  src="https://wytnest.com/embed.js"
  data-widget="YOUR_WIDGET_ID"
  async
></script>`}
            </pre>
            <button
              onClick={copyExample}
              className="mt-3 w-full rounded-lg py-1.5 text-xs font-medium transition-all hover:opacity-90"
              style={
                copied
                  ? { background: 'rgba(52,211,153,0.15)', color: '#34D399' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#E4E3F0' }
              }
            >
              {copied ? '✓ Copied!' : 'Copy example'}
            </button>
          </div>

          {/* Install steps */}
          <div className="p-5" style={{ background: T.card }}>
            <p style={{ color: T.muted }} className="mb-3 text-[0.65rem] font-semibold uppercase tracking-wide">
              How to install
            </p>
            <div className="space-y-4">
              {EMBED_STEPS.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold"
                    style={{ background: 'rgba(79,63,204,0.15)', color: '#7B6EF5' }}
                  >
                    {s.n}
                  </span>
                  <p style={{ color: T.body }} className="text-sm leading-snug">{s.text}</p>
                </div>
              ))}
            </div>

            {/* Supported platforms */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              {['Webflow', 'Framer', 'Next.js', 'React', 'Vue', 'Shopify', 'WordPress'].map(p => (
                <span
                  key={p}
                  className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium"
                  style={{ background: T.tableRowHoverBg, color: T.muted }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── App integrations ───────────────────────────────────────── */}
      <div className="mb-3">
        <p style={{ color: T.muted }} className="mb-3 text-xs font-semibold uppercase tracking-widest">
          App integrations
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map(intg => (
          <div key={intg.id} style={cardStyle} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${intg.color}18`, color: intg.color }}
              >
                {intg.icon}
              </div>
              {intg.soon ? (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: T.tableRowHoverBg, color: T.muted }}>
                  Coming soon
                </span>
              ) : (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: T.tagSuccessBg, color: T.tagSuccessText }}>
                  Available
                </span>
              )}
            </div>
            <div className="flex-1">
              <p style={{ color: T.heading }} className="text-sm font-semibold">{intg.name}</p>
              <p style={{ color: T.body }} className="mt-1 text-xs leading-relaxed">{intg.desc}</p>
            </div>
            <button
              disabled={intg.soon}
              className="w-full rounded-xl py-2 text-xs font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
              style={
                intg.soon
                  ? { background: T.tableRowHoverBg, color: T.muted }
                  : { background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }
              }
            >
              {intg.soon ? 'Coming soon' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export default function IntegrationsPage() {
  return (
    <DashboardShell active="integrations">
      <IntegrationsContent />
    </DashboardShell>
  )
}
