'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import type { Theme } from '@/lib/hooks/useDashTheme'

function Field({
  label, value, onChange, type = 'text', hint, readOnly, T,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  hint?: string
  readOnly?: boolean
  T: Theme
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ color: T.muted }} className="text-xs font-medium">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className="read-only:cursor-not-allowed read-only:opacity-60"
        style={{
          background:   T.tableRowHoverBg,
          border:       `1px solid ${T.cardBorder}`,
          color:        T.heading,
          borderRadius: '12px',
          padding:      '10px 14px',
          fontSize:     '0.875rem',
          outline:      'none',
          width:        '100%',
        }}
      />
      {hint && <p style={{ color: T.muted }} className="text-xs">{hint}</p>}
    </div>
  )
}

function Section({ title, children, T }: { title: string; children: React.ReactNode; T: Theme }) {
  return (
    <div
      style={{
        background:   T.card,
        border:       `1px solid ${T.cardBorder}`,
        boxShadow:    T.cardShadow,
        borderRadius: '16px',
        overflow:     'hidden',
      }}
    >
      <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="px-6 py-4">
        <p style={{ color: T.heading }} className="text-sm font-semibold">{title}</p>
      </div>
      <div className="flex flex-col gap-5 p-6">{children}</div>
    </div>
  )
}

function SettingsContent() {
  const { T } = useDashTheme()
  const { workspace } = useWorkspace()

  const [name,       setName]       = useState('')
  const [email,      setEmail]      = useState('')
  const [brandName,  setBrandName]  = useState('')
  const [brandColor, setBrandColor] = useState('#4F3FCC')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState('')

  // Load real auth user
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const fullName = (data.user.user_metadata?.full_name as string | undefined)
        || data.user.email?.split('@')[0]
        || ''
      setName(fullName)
      setEmail(data.user.email ?? '')
    })
  }, [])

  // Load workspace data
  useEffect(() => {
    if (!workspace) return
    setBrandName(workspace.name ?? '')
    setBrandColor(workspace.brand_color || '#4F3FCC')
  }, [workspace])

  const save = async () => {
    if (!workspace) return
    setSaving(true)
    setError('')
    const { error: err } = await createClient()
      .from('workspaces')
      .update({
        name:        brandName.trim() || workspace.name,
        brand_color: brandColor,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', workspace.id)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2200)
    }
  }

  const initials = name.split(' ').slice(0, 2).map(n => n[0] || '').join('').toUpperCase() || '??'

  return (
    <>
      <div className="mb-6">
        <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Settings</h1>
        <p style={{ color: T.body }} className="mt-1">Manage your account, brand, and workspace preferences.</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">

        {/* Profile */}
        <Section title="Profile" T={T}>
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}
            >
              {initials}
            </div>
            <div>
              <p style={{ color: T.heading }} className="text-sm font-medium">Profile photo</p>
              <p style={{ color: T.body }} className="text-xs">Update your avatar in your Supabase account.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} T={T} />
            <Field label="Email address" value={email} readOnly hint="Email cannot be changed here." type="email" T={T} />
          </div>
        </Section>

        {/* Brand */}
        <Section title="Workspace & brand" T={T}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Workspace name"
              value={brandName}
              onChange={setBrandName}
              hint="Shown in campaign emails and widget footers."
              T={T}
            />
            <Field
              label="Workspace slug"
              value={workspace?.slug ?? ''}
              readOnly
              hint="Used in submission URLs. Contact support to change."
              T={T}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ color: T.muted }} className="text-xs font-medium">Brand color</label>
            <div className="flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl"
                style={{ background: brandColor, border: `1px solid ${T.cardBorder}` }}
              />
              <input
                type="text"
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                placeholder="#4F3FCC"
                className="w-32"
                style={{
                  background:   T.tableRowHoverBg,
                  border:       `1px solid ${T.cardBorder}`,
                  color:        T.heading,
                  borderRadius: '12px',
                  padding:      '8px 12px',
                  fontFamily:   'monospace',
                  fontSize:     '0.875rem',
                  outline:      'none',
                }}
              />
              <input
                type="color"
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg"
                style={{ border: `1px solid ${T.cardBorder}`, background: 'transparent' }}
              />
            </div>
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan & billing" T={T}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: T.heading }} className="text-sm font-semibold capitalize">{workspace?.plan ?? 'Free'} plan</p>
              <p style={{ color: T.body }} className="mt-0.5 text-xs">
                {workspace?.plan === 'agency'
                  ? 'Unlimited campaigns, widgets, and team members.'
                  : 'Upgrade to unlock more campaigns, widgets, and team features.'}
              </p>
            </div>
            {workspace?.plan !== 'agency' && (
              <a
                href="/dashboard/billing"
                className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              >
                Upgrade
              </a>
            )}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Email notifications" T={T}>
          {[
            { label: 'New testimonial received',     sub: 'Email when a campaign collects a new response' },
            { label: 'Testimonial pending approval', sub: 'Email when a response needs your review'       },
            { label: 'Weekly digest',                sub: 'Summary of views, clicks, and conversions'     },
          ].map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-4 sm:items-center">
              <div>
                <p style={{ color: T.heading }} className="text-sm font-medium">{n.label}</p>
                <p style={{ color: T.body }} className="text-xs">{n.sub}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: T.tableRowHoverBg, color: T.muted }}
              >
                Coming soon
              </span>
            </div>
          ))}
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone" T={T}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p style={{ color: T.heading }} className="text-sm font-medium">Delete workspace</p>
              <p style={{ color: T.body }} className="text-xs">
                Permanently removes all campaigns, testimonials, and widgets. Irreversible.
              </p>
            </div>
            <button
              className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
              onClick={() => alert('Contact support to delete your workspace.')}
            >
              Delete workspace
            </button>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <p style={{ color: '#F87171' }} className="text-sm">{error}</p>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}

export default function SettingsPage() {
  return (
    <DashboardShell active="settings">
      <SettingsContent />
    </DashboardShell>
  )
}
