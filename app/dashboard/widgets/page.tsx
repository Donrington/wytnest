'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { BentoWall } from '@/components/widgets/BentoWall'
import { CinematicSlider, Ticker } from '@/components/widgets/Ticker'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Widget, WidgetLayout } from '@/lib/types/database'

const LAYOUTS: { id: WidgetLayout; label: string; desc: string }[] = [
  { id: 'bento_wall',        label: 'Bento wall',       desc: 'Masonry grid, staggered' },
  { id: 'cinematic_slider',  label: 'Cinematic slider', desc: 'Full-width video showcase' },
  { id: 'ticker',            label: 'Floating ticker',  desc: 'Looping marquee' },
]

const ACCENTS = [
  '#4F3FCC', '#7B6EF5', '#E8960F', '#F8C352',
  '#16A660', '#2DD4BF', '#D4537E', '#F87171',
]

function WidgetsContent() {
  const { T } = useDashTheme()
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
  const [name,      setName]      = useState('')
  const [layout,    setLayout]    = useState<WidgetLayout>('bento_wall')
  const [theme,     setTheme]     = useState<'light' | 'dark'>('dark')
  const [accent,    setAccent]    = useState('#4F3FCC')
  const [radius,    setRadius]    = useState(12)
  const [embedTab,  setEmbedTab]  = useState<'HTML' | 'React' | 'Vue'>('HTML')

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

  const embedSnippet = (tab: 'HTML' | 'React' | 'Vue', id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://wytnest.com'
    if (tab === 'HTML') return `<script\n  src="${origin}/embed.js"\n  data-widget="${id}"\n  async\n></script>`
    if (tab === 'React') return `import { useEffect } from 'react'\n\nexport function WytnestWidget() {\n  useEffect(() => {\n    const s = document.createElement('script')\n    s.src = '${origin}/embed.js'\n    s.dataset.widget = '${id}'\n    s.async = true\n    document.body.appendChild(s)\n    return () => { document.body.removeChild(s) }\n  }, [])\n  return <div id="wytnest-widget" />\n}`
    // Vue
    return `<template>\n  <div id="wytnest-widget" />\n</template>\n\n<script setup>\nimport { onMounted, onUnmounted } from 'vue'\nlet el\nonMounted(() => {\n  el = document.createElement('script')\n  el.src = '${origin}/embed.js'\n  el.dataset.widget = '${id}'\n  el.async = true\n  document.body.appendChild(el)\n})\nonUnmounted(() => { el && document.body.removeChild(el) })\n</script>`
  }

  const copyEmbed = () => {
    if (!selected) return
    navigator.clipboard.writeText(embedSnippet(embedTab, selected.public_id))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  const inputStyle = {
    background: T.tableRowHoverBg,
    border:     `1px solid ${T.cardBorder}`,
    color:      T.heading,
    borderRadius: '12px',
    outline:    'none',
    width:      '100%',
    padding:    '10px 14px',
    fontSize:   '0.875rem',
  }

  return (
    <>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Widget builder</h1>
          <p style={{ color: T.body }} className="mt-1">Customize your widget and grab the embed code.</p>
        </div>
        <button
          onClick={() => { setCreating(true); setNewName('') }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-75"
          style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          New widget
        </button>
      </div>

      {/* New widget name dialog */}
      {creating && (
        <div
          className="mb-6 flex items-center gap-3 p-4"
          style={cardStyle}
        >
          <input
            autoFocus
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') create(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Widget name (e.g. Homepage hero)"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            onClick={create}
            disabled={!newName.trim() || saving}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
          >
            {saving ? '…' : 'Create'}
          </button>
          <button
            onClick={() => setCreating(false)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}`, color: T.body }}
          >
            Cancel
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin h-6 w-6" style={{ color: T.muted }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="15" strokeLinecap="round" />
          </svg>
        </div>
      ) : widgets.length === 0 && !creating ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ ...cardStyle, borderStyle: 'dashed' }}
        >
          <p style={{ color: T.heading }} className="font-semibold">No widgets yet</p>
          <p style={{ color: T.body }} className="mt-1 text-sm">Click &ldquo;New widget&rdquo; above to create your first embed.</p>
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
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all"
                    style={
                      selected.id === w.id
                        ? { background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }
                        : { background: T.tableRowHoverBg, color: T.body }
                    }
                  >
                    {w.name}
                  </button>
                ))}
              </div>
            )}

            {/* Name */}
            <div style={cardStyle} className="p-5">
              <label style={{ color: T.muted }} className="mb-2 block text-xs font-medium">Widget name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Layout */}
            <div style={cardStyle} className="p-5">
              <h3 style={{ color: T.heading }} className="mb-3 text-sm font-semibold">Layout</h3>
              <div className="space-y-2">
                {LAYOUTS.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setLayout(l.id)}
                    className="w-full rounded-xl px-4 py-3 text-left transition-all"
                    style={
                      layout === l.id
                        ? { border: `1px solid #E8960F`, background: 'rgba(232,150,15,0.08)' }
                        : { border: `1px solid ${T.cardBorder}`, background: 'transparent' }
                    }
                  >
                    <p style={{ color: layout === l.id ? '#E8960F' : T.heading }} className="text-sm font-medium">{l.label}</p>
                    <p style={{ color: T.muted }} className="text-xs">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div style={cardStyle} className="p-5">
              <h3 style={{ color: T.heading }} className="mb-3 text-sm font-semibold">Appearance</h3>
              <label style={{ color: T.muted }} className="mb-2 block text-xs font-medium">Theme</label>
              <div className="mb-4 flex gap-2">
                {(['light', 'dark'] as const).map(th => (
                  <button
                    key={th}
                    onClick={() => setTheme(th)}
                    className="flex-1 rounded-lg py-2 text-sm capitalize transition-all"
                    style={
                      theme === th
                        ? { border: `1px solid #E8960F`, background: 'rgba(232,150,15,0.08)', color: '#E8960F' }
                        : { border: `1px solid ${T.cardBorder}`, color: T.body }
                    }
                  >
                    {th}
                  </button>
                ))}
              </div>

              <label style={{ color: T.muted }} className="mb-2 block text-xs font-medium">Accent color</label>
              <div className="mb-4 grid grid-cols-4 gap-2">
                {ACCENTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className="h-8 w-full rounded-lg transition-all"
                    style={{
                      background:    c,
                      outline:       accent === c ? `2px solid ${T.heading}` : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                    aria-label={c}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded-lg"
                  style={{ border: `1px solid ${T.cardBorder}`, background: 'transparent', padding: '1px' }}
                  title="Custom color"
                />
                <input
                  type="text"
                  value={accent}
                  onChange={e => setAccent(e.target.value)}
                  placeholder="#4F3FCC"
                  className="flex-1"
                  style={{
                    background:   T.tableRowHoverBg,
                    border:       `1px solid ${T.cardBorder}`,
                    color:        T.heading,
                    borderRadius: '10px',
                    padding:      '6px 10px',
                    fontFamily:   'monospace',
                    fontSize:     '0.8rem',
                    outline:      'none',
                  }}
                />
              </div>

              <label style={{ color: T.muted }} className="mb-2 block text-xs font-medium">Border radius — {radius}px</label>
              <input type="range" min={0} max={24} value={radius} onChange={e => setRadius(+e.target.value)} className="w-full" style={{ accentColor: '#E8960F' }} />
            </div>

            {/* Save */}
            <button
              onClick={save}
              disabled={saving}
              className="w-full rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save widget'}
            </button>

            {/* Embed panel */}
            <div
              className="overflow-hidden rounded-2xl"
              style={{ background: 'rgba(8,7,16,0.92)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              {/* Panel header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: '#E4E3F0' }}>Embed code</p>
                  <p className="mt-0.5 font-mono text-[0.58rem]" style={{ color: '#3E3B61' }}>
                    ID: {selected.public_id}
                  </p>
                </div>
                {/* Framework tabs */}
                <div
                  className="flex gap-0.5 rounded-lg p-0.5"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  {(['HTML', 'React', 'Vue'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => { setEmbedTab(tab); setCopied(false) }}
                      className="rounded-md px-2.5 py-1 text-[0.65rem] font-medium transition-all"
                      style={
                        embedTab === tab
                          ? { background: 'rgba(79,63,204,0.45)', color: '#A89FF5' }
                          : { color: '#4E4B72' }
                      }
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code block */}
              <div className="px-4 pt-3 pb-1">
                <pre
                  className="overflow-x-auto font-mono text-[0.68rem] leading-relaxed"
                  style={{ color: '#B8B5D4', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                >
                  {embedSnippet(embedTab, selected.public_id)}
                </pre>
              </div>

              {/* Copy button */}
              <div className="px-4 pb-3">
                <button
                  onClick={copyEmbed}
                  className="mt-2 w-full rounded-lg py-2 text-xs font-medium transition-all hover:opacity-90"
                  style={
                    copied
                      ? { background: 'rgba(52,211,153,0.15)', color: '#34D399' }
                      : { background: 'rgba(255,255,255,0.07)', color: '#E4E3F0' }
                  }
                >
                  {copied ? '✓ Copied!' : 'Copy snippet'}
                </button>
              </div>

              {/* Install steps */}
              <div
                className="space-y-2.5 px-4 py-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-wide" style={{ color: '#4E4B72' }}>
                  How to install
                </p>
                {[
                  embedTab === 'HTML'  ? 'Paste the snippet just before </body>' : 'Drop the component anywhere on your page',
                  'Save & deploy your site',
                  'The widget loads automatically',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-bold"
                      style={{ background: 'rgba(79,63,204,0.3)', color: '#7B6EF5' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs leading-snug" style={{ color: '#6F6C92' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div
            className="min-h-[420px] rounded-2xl overflow-hidden"
            style={
              theme === 'dark'
                ? { background: '#0B0919', border: '1px solid rgba(255,255,255,0.07)', boxShadow: T.cardShadow }
                : { background: '#F5F4FC', border: `1px solid ${T.cardBorder}`, boxShadow: T.cardShadow }
            }
          >
            {/* Preview chrome bar */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderBottom: theme === 'dark'
                  ? '1px solid rgba(255,255,255,0.06)'
                  : `1px solid ${T.tableRowBorder}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: theme === 'dark' ? '#6F6C92' : T.muted }}
                >
                  Live preview · {LAYOUTS.find(l => l.id === layout)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ background: accent, boxShadow: `0 0 6px ${accent}66` }}
                />
                <span
                  className="font-mono text-[0.65rem]"
                  style={{ color: theme === 'dark' ? '#3E3B61' : T.muted }}
                >
                  {accent}
                </span>
              </div>
            </div>

            <div className="p-6">
              {layout === 'bento_wall'       && <BentoWall dark={theme === 'dark'} accent={accent} radius={radius} />}
              {layout === 'cinematic_slider' && <CinematicSlider dark={theme === 'dark'} accent={accent} radius={radius} />}
              {layout === 'ticker'           && <Ticker dark={theme === 'dark'} accent={accent} radius={radius} />}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default function WidgetsPage() {
  return (
    <DashboardShell active="widgets">
      <WidgetsContent />
    </DashboardShell>
  )
}
