'use client'

import { useState } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { BentoWall } from '@/components/widgets/BentoWall'
import { cn } from '@/lib/utils'

const LAYOUTS = [
  { id: 'bento', label: 'Bento wall' },
  { id: 'slider', label: 'Cinematic slider' },
  { id: 'ticker', label: 'Floating ticker' },
] as const

export default function WidgetsPage() {
  const [layout, setLayout] = useState<typeof LAYOUTS[number]['id']>('bento')
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [accent, setAccent] = useState('#4F3FCC')
  const [radius, setRadius] = useState(12)

  return (
    <DashboardShell active="widgets">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Widget builder</h1>
        <p className="mt-1 text-carbon-500">Customize your widget and grab the embed code.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Controls */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-paper-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-carbon-900">Layout</h3>
            <div className="space-y-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  className={cn('w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all', layout === l.id ? 'border-ink-600 bg-ink-50 text-ink-700' : 'border-paper-border text-carbon-600 hover:border-carbon-300')}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-paper-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-carbon-900">Appearance</h3>
            <label className="mb-2 block text-xs font-medium text-carbon-500">Theme</label>
            <div className="mb-4 flex gap-2">
              {(['light', 'dark'] as const).map((th) => (
                <button key={th} onClick={() => setTheme(th)} className={cn('flex-1 rounded-lg border py-2 text-sm capitalize transition-all', theme === th ? 'border-ink-600 bg-ink-50 text-ink-700' : 'border-paper-border text-carbon-600')}>
                  {th}
                </button>
              ))}
            </div>

            <label className="mb-2 block text-xs font-medium text-carbon-500">Accent color</label>
            <div className="mb-4 flex gap-2">
              {['#4F3FCC', '#E8960F', '#16A660', '#D4537E'].map((c) => (
                <button key={c} onClick={() => setAccent(c)} className={cn('h-9 w-9 rounded-lg transition-all', accent === c && 'ring-2 ring-offset-2 ring-ink-600')} style={{ background: c }} aria-label={`Accent ${c}`} />
              ))}
            </div>

            <label className="mb-2 block text-xs font-medium text-carbon-500">Border radius — {radius}px</label>
            <input type="range" min={0} max={24} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full accent-ink-600" />
          </div>

          <div className="rounded-2xl border border-carbon-800 bg-carbon-950 p-4">
            <p className="mb-2 text-xs text-carbon-400">Embed code</p>
            <code className="block break-all font-mono text-xs leading-relaxed text-carbon-200">
              &lt;script src=&quot;cdn.wytnest.com/wytnest.js&quot; data-widget-id=&quot;abc123&quot; async&gt;&lt;/script&gt;
            </code>
            <button className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15">Copy code</button>
          </div>
        </div>

        {/* Live preview */}
        <div className={cn('rounded-2xl border p-6', theme === 'dark' ? 'border-white/8 bg-carbon-900' : 'border-paper-border bg-paper-surface')}>
          <div className="mb-4 flex items-center gap-2">
            <span className={cn('text-xs font-medium', theme === 'dark' ? 'text-carbon-400' : 'text-carbon-500')}>Live preview</span>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          </div>
          <BentoWall dark={theme === 'dark'} />
        </div>
      </div>
    </DashboardShell>
  )
}
