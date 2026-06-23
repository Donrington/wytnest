'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { BentoWall } from '@/components/widgets/BentoWall'
import { CinematicSlider, Ticker } from '@/components/widgets/Ticker'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Widget, WidgetLayout } from '@/lib/types/database'

const LAYOUTS: { id: WidgetLayout; label: string; desc: string }[] = [
  { id: 'bento_wall',        label: 'Bento wall',       desc: 'Masonry grid, staggered' },
  { id: 'cinematic_slider',  label: 'Cinematic slider', desc: 'Full-width video showcase' },
  { id: 'ticker',            label: 'Floating ticker',  desc: 'Looping marquee' },
]

const ACCENTS = ['#4F3FCC', '#E8960F', '#16A660', '#D4537E']

export default function WidgetsPage() {
  const { workspace } = useWorkspace()

  const [widgets,  setWidgets]  = useState<Widget[]>([])
  const [selected, setSelected] = useState<Widget | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName,  setNewName]  = useState('')

  // Local editable state (mirrors selected widget)
  const [name,    setName]    = useState('')
  const [layout,  setLayout]  = useState<WidgetLayout>('bento_wall')
  const [theme,   setTheme]   = useState<'light' | 'dark'>('dark')
  const [accent,  setAccent]  = useState('#4F3FCC')
  const [radius,  setRadius]  = useState(12)

  const pick = (w: Widget) => {
    setSelected(w)
    setName(w.name)
    setLayout(w.layout)
    setTheme(w.theme === 'auto' ? 'dark' : w.theme)
    setAccent(w.accent_color ?? '#4F3FCC')
    setRadius(w.border_radius)
  }

  const load = useCallback(async () => {
    if (!workspace) return
    setLoading(true)
    const { data } = await createClient()
      .from('widgets')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true })
    const ws = (data ?? []) as Widget[]
    setWidgets(ws)
    if (ws.length > 0 && !selected) pick(ws[0])
    setLoading(false)
  }, [workspace]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  const create = async () => {
    if (!workspace || !newName.trim()) return
    setSaving(true)
    const { data } = await createClient()
      .from('widgets')
      .insert({ workspace_id: workspace.id, name: newName.trim(), layout: 'bento_wall' })
      .select()
      .single()
    if (data) {
      const w = data as Widget
      setWidgets(prev => [...prev, w])
      pick(w)
    }
    setCreating(false)
    setNewName('')
    setSaving(false)
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    const { data } = await createClient()
      .from('widgets')
      .update({ name, layout, theme, accent_color: accent, border_radius: radius, updated_at: new Date().toISOString() })
      .eq('id', selected.id)
      .select()
      .single()
    if (data) {
      const updated = data as Widget
      setWidgets(prev => prev.map(w => w.id === updated.id ? updated : w))
      setSelected(updated)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const copyEmbed = () => {
    if (!selected) return
    const code = `<script src="${window.location.origin}/embed.js" data-widget="${selected.public_id}" async></script>`
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <DashboardShell active="widgets">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-carbon-900">Widget builder</h1>
          <p className="mt-1 text-carbon-500">Customize your widget and grab the embed code.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setNewName('') }}
          className="inline-flex items-center gap-2 rounded-full border border-paper-border bg-white px-4 py-2 text-sm font-medium text-carbon-700 transition-all hover:border-ink-400 hover:text-ink-700"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          New widget
        </button>
      </div>

      {/* New widget name dialog */}
      {creating && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-ink-200 bg-ink-50/50 p-4">
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Widget name (e.g. Homepage hero)"
            className="flex-1 rounded-xl border border-paper-border bg-white px-4 py-2.5 text-sm text-carbon-900 outline-none placeholder:text-carbon-300 focus:border-ink-600 focus:ring-2 focus:ring-ink-600/10"
          />
          <button onClick={create} disabled={!newName.trim() || saving}
            className="rounded-xl bg-ink-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">
            {saving ? '…' : 'Create'}
          </button>
          <button onClick={() => setCreating(false)} className="rounded-xl border border-paper-border bg-white px-4 py-2.5 text-sm font-medium text-carbon-600">
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6 text-carbon-300" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : widgets.length === 0 && !creating ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-paper-border py-20 text-center">
          <p className="font-semibold text-carbon-700">No widgets yet</p>
          <p className="mt-1 text-sm text-carbon-400">Click "New widget" above to create your first embed.</p>
        </div>
      ) : selected ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

          {/* Widget list + controls */}
          <div className="space-y-5">
            {/* Widget switcher */}
            {widgets.length > 1 && (
              <div className="space-y-1">
                {widgets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => pick(w)}
                    className={cn(
                      'w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all',
                      selected.id === w.id ? 'bg-ink-50 text-ink-700 border border-ink-200' : 'text-carbon-600 hover:bg-carbon-50',
                    )}
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}

            {/* Name */}
            <div className="rounded-2xl border border-paper-border bg-white p-5">
              <label className="mb-2 block text-xs font-medium text-carbon-500">Widget name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-paper-border bg-paper px-3 py-2.5 text-sm text-carbon-900 outline-none focus:border-ink-600 focus:ring-2 focus:ring-ink-600/10"
              />
            </div>

            {/* Layout */}
            <div className="rounded-2xl border border-paper-border bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-carbon-900">Layout</h3>
              <div className="space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left transition-all',
                      layout === l.id ? 'border-ink-600 bg-ink-50' : 'border-paper-border hover:border-carbon-300',
                    )}
                  >
                    <p className={cn('text-sm font-medium', layout === l.id ? 'text-ink-700' : 'text-carbon-700')}>{l.label}</p>
                    <p className="text-xs text-carbon-400">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="rounded-2xl border border-paper-border bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold text-carbon-900">Appearance</h3>
              <label className="mb-2 block text-xs font-medium text-carbon-500">Theme</label>
              <div className="mb-4 flex gap-2">
                {(['light', 'dark'] as const).map(th => (
                  <button key={th} onClick={() => setTheme(th)}
                    className={cn('flex-1 rounded-lg border py-2 text-sm capitalize transition-all',
                      theme === th ? 'border-ink-600 bg-ink-50 text-ink-700' : 'border-paper-border text-carbon-600')}>
                    {th}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-xs font-medium text-carbon-500">Accent color</label>
              <div className="mb-4 flex gap-2">
                {ACCENTS.map(c => (
                  <button key={c} onClick={() => setAccent(c)}
                    className={cn('h-9 w-9 rounded-lg transition-all', accent === c && 'ring-2 ring-offset-2 ring-ink-600')}
                    style={{ background: c }} aria-label={c} />
                ))}
              </div>

              <label className="mb-2 block text-xs font-medium text-carbon-500">Border radius — {radius}px</label>
              <input type="range" min={0} max={24} value={radius} onChange={e => setRadius(+e.target.value)} className="w-full accent-ink-600" />
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-full bg-ink-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save widget'}
            </button>

            {/* Embed code */}
            <div className="rounded-2xl border border-carbon-800 bg-carbon-950 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-carbon-400">Embed code</p>
                <span className="font-mono text-[0.62rem] text-carbon-600">ID: {selected.public_id}</span>
              </div>
              <code className="block break-all font-mono text-[0.7rem] leading-relaxed text-carbon-200">
                {`<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://wytnest.com'}/embed.js" data-widget="${selected.public_id}" async></script>`}
              </code>
              <button
                onClick={copyEmbed}
                className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
              >
                {copied ? '✓ Copied!' : 'Copy embed code'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div className={cn('min-h-[420px] rounded-2xl border p-6', theme === 'dark' ? 'border-white/8 bg-carbon-900' : 'border-paper-border bg-paper-surface')}>
            <div className="mb-4 flex items-center gap-2">
              <span className={cn('text-xs font-medium', theme === 'dark' ? 'text-carbon-400' : 'text-carbon-500')}>
                Live preview · {LAYOUTS.find(l => l.id === layout)?.label}
              </span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </div>
            {layout === 'bento_wall'       && <BentoWall dark={theme === 'dark'} />}
            {layout === 'cinematic_slider' && <CinematicSlider dark={theme === 'dark'} />}
            {layout === 'ticker'           && <Ticker dark={theme === 'dark'} />}
          </div>
        </div>
      ) : null}
    </DashboardShell>
  )
}
