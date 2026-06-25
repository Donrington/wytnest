'use client'

import { useEffect, useState, useCallback } from 'react'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { createClient } from '@/lib/supabase/client'
import { useDashTheme } from '@/lib/hooks/useDashTheme'
import { fmtNow } from '@/lib/utils'
import { PLAN_LIMITS, PRICING } from '@/lib/types/database'
import type { PlanTier, CurrencyCode } from '@/lib/types/database'

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIER_ORDER: PlanTier[] = ['free', 'starter', 'growth', 'agency']

function fmtPrice(tier: PlanTier, currency: CurrencyCode, annual: boolean): string {
  const amount = PRICING[currency][tier][annual ? 'annual' : 'monthly']
  if (amount === 0) return 'Free'
  if (currency === 'NGN') {
    const m = annual ? Math.round(amount / 12) : amount
    return `₦${m.toLocaleString('en-NG')}`
  }
  const m = annual ? Math.round(amount / 12 / 100) : Math.round(amount / 100)
  return `$${m}`
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PLAN_FEATURES: Record<PlanTier, string[]> = {
  free:    ['5 testimonials', '1 widget', '1 campaign', 'Text only'],
  starter: ['50 testimonials', '2 widgets', '5 campaigns', 'Text only'],
  growth:  ['Unlimited testimonials', '10 widgets', '20 campaigns', 'Video testimonials', 'White-label widgets'],
  agency:  ['Unlimited testimonials', '50 widgets', '100 campaigns', 'Video testimonials', 'White-label + custom CSS', 'API access', '10 workspaces'],
}

const PLAN_LABELS: Record<PlanTier, string> = {
  free: 'Free', starter: 'Starter', growth: 'Growth', agency: 'Agency',
}

// ── Usage bar ─────────────────────────────────────────────────────────────────

function UsageBar({
  label, used, limit, T,
}: {
  label: string
  used: number
  limit: number | null
  T: ReturnType<typeof useDashTheme>['T']
}) {
  const pct = limit === null ? 0 : Math.min(Math.round((used / limit) * 100), 100)
  const warn = limit !== null && pct >= 80
  const barColor = warn ? '#F87171' : 'linear-gradient(90deg, #F8C352, #E8960F)'

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span style={{ color: T.body }} className="text-sm">{label}</span>
        <span style={{ color: warn ? '#F87171' : T.heading }} className="text-sm font-semibold tabular-nums">
          {used.toLocaleString()}
          {limit !== null ? ` / ${limit.toLocaleString()}` : ' / ∞'}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: T.tableRowHoverBg }}>
        {limit !== null && (
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor }}
          />
        )}
        {limit === null && (
          <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg, #F8C35222, #E8960F22)' }} />
        )}
      </div>
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  tier, current, currency, annual, T,
}: {
  tier: PlanTier
  current: PlanTier
  currency: CurrencyCode
  annual: boolean
  T: ReturnType<typeof useDashTheme>['T']
}) {
  const isCurrent  = tier === current
  const isUpgrade  = TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(current)
  const price      = fmtPrice(tier, currency, annual)
  const features   = PLAN_FEATURES[tier]
  const isPopular  = tier === 'growth'

  return (
    <div
      className="relative flex flex-col rounded-2xl p-5"
      style={{
        background:   isCurrent ? 'rgba(232,150,15,0.05)' : T.card,
        border:       isCurrent
          ? '1.5px solid rgba(232,150,15,0.40)'
          : `1px solid ${T.cardBorder}`,
        boxShadow:    isCurrent
          ? '0 0 0 1px rgba(232,150,15,0.10), ' + T.cardShadow
          : T.cardShadow,
      }}
    >
      {isPopular && !isCurrent && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[0.65rem] font-semibold"
          style={{ background: 'linear-gradient(135deg,#F8C352,#E8960F)', color: '#080716' }}
        >
          Most popular
        </span>
      )}
      {isCurrent && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[0.65rem] font-semibold"
          style={{ background: T.tagSuccessBg, color: T.tagSuccessText }}
        >
          Current plan
        </span>
      )}

      <p style={{ color: T.heading }} className="font-display text-base font-bold">
        {PLAN_LABELS[tier]}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span style={{ color: T.heading }} className="font-display text-2xl font-extrabold">
          {price}
        </span>
        {price !== 'Free' && (
          <span style={{ color: T.muted }} className="mb-0.5 text-xs">/mo</span>
        )}
      </div>
      {annual && price !== 'Free' && (
        <p style={{ color: T.muted }} className="mt-0.5 text-[0.65rem]">billed annually</p>
      )}

      <ul className="mt-4 flex-1 space-y-2">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-xs" style={{ color: T.body }}>
            <svg
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
              className="mt-px shrink-0"
              style={{ color: isCurrent ? '#E8960F' : T.tagSuccessText }}
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        disabled={isCurrent || !isUpgrade}
        className="mt-5 w-full rounded-full py-2.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        style={
          isCurrent
            ? { background: T.tableRowHoverBg, color: T.muted }
            : isUpgrade
            ? { background: 'linear-gradient(135deg,#F8C352,#E8960F)', color: '#080716' }
            : { background: T.tableRowHoverBg, color: T.muted }
        }
        onClick={() => {
          if (isUpgrade) {
            window.location.href = `mailto:hello@wytnest.com?subject=Upgrade to ${PLAN_LABELS[tier]}&body=Hi, I'd like to upgrade my Wytnest workspace to the ${PLAN_LABELS[tier]} plan.`
          }
        }}
      >
        {isCurrent ? 'Current plan' : isUpgrade ? 'Upgrade' : 'Downgrade'}
      </button>
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, T }: { status: string | null; T: ReturnType<typeof useDashTheme>['T'] }) {
  if (!status || status === 'active') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: T.tagSuccessBg, color: T.tagSuccessText }}>
        Active
      </span>
    )
  }
  if (status === 'trialing') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: T.tagPendingBg, color: T.tagPendingText }}>
        Trial
      </span>
    )
  }
  if (status === 'past_due') {
    return (
      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171' }}>
        Past due
      </span>
    )
  }
  return (
    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize" style={{ background: T.tableRowHoverBg, color: T.muted }}>
      {status}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

interface Usage { testimonials: number; widgets: number; campaigns: number }

function BillingContent() {
  const { T }          = useDashTheme()
  const { workspace }  = useWorkspace()
  const [now, setNow]  = useState('')
  const [annual, setAnnual] = useState(false)
  const [usage, setUsage]   = useState<Usage>({ testimonials: 0, widgets: 0, campaigns: 0 })

  useEffect(() => {
    setNow(fmtNow())
    const id = setInterval(() => setNow(fmtNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  const loadUsage = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()
    const wid      = workspace.id
    const [
      { count: testimonials },
      { count: widgets },
      { count: campaigns },
    ] = await Promise.all([
      supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('workspace_id', wid).eq('status', 'approved'),
      supabase.from('widgets').select('*', { count: 'exact', head: true }).eq('workspace_id', wid),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', wid),
    ])
    setUsage({ testimonials: testimonials ?? 0, widgets: widgets ?? 0, campaigns: campaigns ?? 0 })
  }, [workspace])

  useEffect(() => { loadUsage() }, [loadUsage])

  const plan     = (workspace?.plan ?? 'free') as PlanTier
  const currency = (workspace?.currency ?? 'NGN') as CurrencyCode
  const limits   = PLAN_LIMITS[plan]
  const price    = fmtPrice(plan, currency, annual)
  const cardStyle = {
    background:   T.card,
    border:       `1px solid ${T.cardBorder}`,
    boxShadow:    T.cardShadow,
    borderRadius: '16px',
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ color: T.heading }} className="font-display text-2xl font-extrabold">Billing</h1>
        <p style={{ color: T.body }} className="mt-1 flex flex-wrap items-center gap-2">
          Manage your plan, usage, and invoices.
          {now && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
              style={{ background: T.tableRowHoverBg, color: T.muted }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {now}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">

        {/* Current plan summary */}
        <div style={cardStyle} className="overflow-hidden">
          <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="px-6 py-4">
            <p style={{ color: T.heading }} className="text-sm font-semibold">Current plan</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(232,150,15,0.10)', border: '1px solid rgba(232,150,15,0.20)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill="#E8960F" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p style={{ color: T.heading }} className="font-display text-lg font-bold capitalize">
                    {PLAN_LABELS[plan]} plan
                  </p>
                  <StatusBadge status={workspace?.subscription_status ?? 'active'} T={T} />
                </div>
                <p style={{ color: T.muted }} className="mt-0.5 text-sm">
                  {price !== 'Free' ? `${price} / month` : 'Free forever'}
                  {workspace?.current_period_end && (
                    <> · Renews {fmtDate(workspace.current_period_end)}</>
                  )}
                  {workspace?.trial_ends_at && workspace.subscription_status === 'trialing' && (
                    <> · Trial ends {fmtDate(workspace.trial_ends_at)}</>
                  )}
                </p>
              </div>
            </div>

            {plan !== 'agency' && (
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                  style={{ background: T.tableRowHoverBg, color: T.muted }}
                >
                  Payment integration coming soon
                </span>
                <a
                  href={`mailto:hello@wytnest.com?subject=Upgrade Plan&body=Hi, I'd like to upgrade my Wytnest workspace from ${PLAN_LABELS[plan]} to a higher plan.`}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg,#F8C352,#E8960F)', color: '#080716' }}
                >
                  Upgrade
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Usage */}
        <div style={cardStyle} className="overflow-hidden">
          <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="px-6 py-4">
            <p style={{ color: T.heading }} className="text-sm font-semibold">Usage this period</p>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-3">
            <UsageBar label="Approved testimonials" used={usage.testimonials} limit={limits.testimonials} T={T} />
            <UsageBar label="Widgets" used={usage.widgets} limit={limits.widgets} T={T} />
            <UsageBar label="Campaigns" used={usage.campaigns} limit={limits.campaigns} T={T} />
          </div>
          {/* Feature flags */}
          <div style={{ borderTop: `1px solid ${T.tableRowBorder}` }} className="flex flex-wrap gap-x-6 gap-y-2 px-6 py-4">
            {[
              { label: 'Video testimonials',  on: limits.videoAllowed },
              { label: 'White-label widgets', on: limits.whiteLabelAllowed },
              { label: 'Custom CSS',          on: limits.customCssAllowed },
              { label: 'API access',          on: limits.apiAccessAllowed },
              { label: 'Sub-accounts',        on: limits.subAccountsAllowed },
            ].map(f => (
              <span key={f.label} className="flex items-center gap-1.5 text-xs" style={{ color: f.on ? T.tagSuccessText : T.muted }}>
                {f.on ? (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Plan comparison */}
        <div style={cardStyle} className="overflow-hidden">
          <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="flex items-center justify-between px-6 py-4">
            <p style={{ color: T.heading }} className="text-sm font-semibold">Available plans</p>

            {/* Annual toggle */}
            <div
              className="flex items-center gap-2 rounded-xl p-1"
              style={{ background: T.tableRowHoverBg, border: `1px solid ${T.cardBorder}` }}
            >
              {(['Monthly', 'Annual'] as const).map(b => {
                const isAnnual = b === 'Annual'
                const active   = annual === isAnnual
                return (
                  <button
                    key={b}
                    onClick={() => setAnnual(isAnnual)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                    style={
                      active
                        ? { background: 'linear-gradient(135deg,#F8C352,#E8960F)', color: '#080716' }
                        : { color: T.body }
                    }
                  >
                    {b}
                    {isAnnual && (
                      <span
                        className="rounded-full px-1.5 py-px text-[0.6rem] font-semibold"
                        style={{
                          background: active ? 'rgba(0,0,0,0.15)' : T.tagSuccessBg,
                          color:      active ? '#080716' : T.tagSuccessText,
                        }}
                      >
                        −20%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {TIER_ORDER.map(tier => (
              <PlanCard
                key={tier}
                tier={tier}
                current={plan}
                currency={currency}
                annual={annual}
                T={T}
              />
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${T.tableRowBorder}` }} className="px-6 py-3">
            <p style={{ color: T.muted }} className="text-xs">
              Payment integration is coming soon. To upgrade now, email{' '}
              <a href="mailto:hello@wytnest.com" style={{ color: '#7B6EF5' }} className="hover:underline">
                hello@wytnest.com
              </a>{' '}
              and we&apos;ll get you sorted within 24 hours.
            </p>
          </div>
        </div>

        {/* Billing history */}
        <div style={cardStyle} className="overflow-hidden">
          <div style={{ borderBottom: `1px solid ${T.tableRowBorder}` }} className="px-6 py-4">
            <p style={{ color: T.heading }} className="text-sm font-semibold">Billing history</p>
          </div>
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: T.tableRowHoverBg }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: T.muted }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <p style={{ color: T.heading }} className="text-sm font-semibold">No invoices yet</p>
            <p style={{ color: T.body }} className="mt-1 text-xs">
              Your billing history will appear here once payment is enabled.
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

export default function BillingPage() {
  return (
    <DashboardShell active="billing">
      <BillingContent />
    </DashboardShell>
  )
}
