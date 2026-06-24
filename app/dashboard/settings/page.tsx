'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'

function Field({
  label, value, onChange, type = 'text', hint, readOnly,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  hint?: string
  readOnly?: boolean
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-carbon-500">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className="w-full rounded-xl border border-paper-border bg-paper px-4 py-2.5 text-sm text-carbon-900 outline-none placeholder:text-carbon-300 focus:border-ink-600 focus:ring-2 focus:ring-ink-600/10 read-only:cursor-not-allowed read-only:opacity-60"
      />
      {hint && <p className="text-xs text-carbon-400">{hint}</p>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-paper-border bg-white">
      <div className="border-b border-paper-border px-6 py-4">
        <p className="text-sm font-semibold text-carbon-900">{title}</p>
      </div>
      <div className="flex flex-col gap-5 p-6">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
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
    <DashboardShell active="settings">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-carbon-900">Settings</h1>
        <p className="mt-1 text-carbon-500">Manage your account, brand, and workspace preferences.</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-6">

        {/* Profile */}
        <Section title="Profile">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-carbon-900">Profile photo</p>
              <p className="text-xs text-carbon-500">Update your avatar in your Supabase account.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={name} onChange={setName} />
            <Field label="Email address" value={email} readOnly hint="Email cannot be changed here." type="email" />
          </div>
        </Section>

        {/* Brand */}
        <Section title="Workspace & brand">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Workspace name"
              value={brandName}
              onChange={setBrandName}
              hint="Shown in campaign emails and widget footers."
            />
            <Field
              label="Workspace slug"
              value={workspace?.slug ?? ''}
              readOnly
              hint="Used in submission URLs. Contact support to change."
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-carbon-500">Brand color</label>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl border border-paper-border" style={{ background: brandColor }} />
              <input
                type="text"
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                placeholder="#4F3FCC"
                className="w-32 rounded-xl border border-paper-border bg-paper px-3 py-2.5 font-mono text-sm text-carbon-900 outline-none focus:border-ink-600 focus:ring-2 focus:ring-ink-600/10"
              />
              <input
                type="color"
                value={brandColor}
                onChange={e => setBrandColor(e.target.value)}
                className="h-9 w-9 cursor-pointer rounded-lg border border-paper-border bg-transparent"
              />
            </div>
          </div>
        </Section>

        {/* Plan */}
        <Section title="Plan & billing">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold capitalize text-carbon-900">{workspace?.plan ?? 'Free'} plan</p>
              <p className="mt-0.5 text-xs text-carbon-500">
                {workspace?.plan === 'agency'
                  ? 'Unlimited campaigns, widgets, and team members.'
                  : 'Upgrade to unlock more campaigns, widgets, and team features.'}
              </p>
            </div>
            {workspace?.plan !== 'agency' && (
              <a href="/dashboard/billing"
                className="shrink-0 rounded-full bg-ink-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink-800">
                Upgrade
              </a>
            )}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Email notifications">
          {[
            { label: 'New testimonial received',     sub: 'Email when a campaign collects a new response' },
            { label: 'Testimonial pending approval', sub: 'Email when a response needs your review'       },
            { label: 'Weekly digest',                sub: 'Summary of views, clicks, and conversions'     },
          ].map((n, i) => (
            <div key={i} className="flex items-start justify-between gap-4 sm:items-center">
              <div>
                <p className="text-sm font-medium text-carbon-900">{n.label}</p>
                <p className="text-xs text-carbon-500">{n.sub}</p>
              </div>
              <span className="shrink-0 rounded-full bg-carbon-100 px-2.5 py-0.5 text-xs text-carbon-500">
                Coming soon
              </span>
            </div>
          ))}
        </Section>

        {/* Danger zone */}
        <Section title="Danger zone">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-carbon-900">Delete workspace</p>
              <p className="text-xs text-carbon-500">
                Permanently removes all campaigns, testimonials, and widgets. Irreversible.
              </p>
            </div>
            <button
              className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-opacity hover:opacity-80"
              onClick={() => alert('Contact support to delete your workspace.')}
            >
              Delete workspace
            </button>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-ink-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
