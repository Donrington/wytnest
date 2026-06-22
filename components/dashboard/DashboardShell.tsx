'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const E_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

// ── Theme tokens ──────────────────────────────────────────────────────────────
const DARK = {
  rootBg:             '#080716',
  sidebarBg:          'linear-gradient(180deg, rgba(13,11,30,0.99) 0%, rgba(9,8,20,1) 100%)',
  sidebarBorder:      'rgba(255,255,255,0.06)',
  ambientGlow:        'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(79,63,204,0.10), transparent)',
  logoWordmark:       '#E4E3F0',
  logoSub:            '#3E3B61',
  collapseBtnHoverBg: 'rgba(255,255,255,0.06)',
  collapseBtnColor:   '#3E3B61',
  navActiveBg:        'rgba(232,150,15,0.09)',
  navHoverBg:         'rgba(255,255,255,0.04)',
  navActiveText:      '#E4E3F0',
  navInactiveText:    '#6F6C92',
  navIconActive:      '#E8960F',
  navIconInactive:    '#3E3B61',
  sectionLabel:       '#231F4A',
  divider:            'rgba(255,255,255,0.05)',
  upgradeBg:          'rgba(232,150,15,0.07)',
  upgradeBorder:      'rgba(232,150,15,0.14)',
  upgradePlan:        '#E8960F',
  upgradeSub:         '#6F6C92',
  upgradeIconBg:      'rgba(232,150,15,0.14)',
  avatarRing:         '#0A0917',
  userName:           '#E4E3F0',
  userEmail:          '#3E3B61',
  topbarBg:           'rgba(9,8,20,0.88)',
  topbarBorder:       'rgba(255,255,255,0.06)',
  menuBtnColor:       '#6F6C92',
  menuBtnHoverBg:     'rgba(255,255,255,0.05)',
  breadcrumbParent:   '#231F4A',
  breadcrumbSep:      '#1A1635',
  breadcrumbCurrent:  '#B8B5D4',
  searchBg:           'rgba(255,255,255,0.04)',
  searchBorder:       'rgba(255,255,255,0.07)',
  searchText:         '#B8B5D4',
  searchPlaceholder:  '#3E3B61',
  searchKbdBg:        'rgba(255,255,255,0.05)',
  searchKbdText:      '#231F4A',
  notifIconColor:     '#6F6C92',
  notifDropBg:        'rgba(13,11,30,0.98)',
  notifDropBorder:    'rgba(255,255,255,0.09)',
  notifDropShadow:    '0 24px 80px -16px rgba(0,0,0,0.8)',
  notifHdrBorder:     'rgba(255,255,255,0.06)',
  notifTitle:         '#E4E3F0',
  notifMarkRead:      '#7B6EF5',
  notifBody:          '#6F6C92',
  notifTime:          '#231F4A',
  notifItemBorder:    'rgba(255,255,255,0.04)',
  notifItemHoverBg:   'rgba(255,255,255,0.03)',
  notifFooterBg:      'rgba(255,255,255,0.03)',
  notifFooterText:    '#6F6C92',
  contentBg:          'linear-gradient(180deg, rgba(11,9,24,0.98) 0%, rgba(8,7,16,1) 100%)',
  pillBg:             'rgba(255,255,255,0.07)',
  pillBorder:         'rgba(255,255,255,0.11)',
  pillThumb:          'rgba(255,255,255,0.14)',
  pillThumbShadow:    '0 1px 4px rgba(0,0,0,0.5)',
  // Content area
  card:               'rgba(12,10,26,0.72)',
  cardBorder:         'rgba(255,255,255,0.07)',
  cardShadow:         '0 1px 24px -8px rgba(0,0,0,0.5)',
  heading:            '#E4E3F0',
  subheading:         '#B8B5D4',
  body:               '#6F6C92',
  muted:              '#3E3B61',
  tableRowBorder:     'rgba(255,255,255,0.05)',
  tableRowHoverBg:    'rgba(255,255,255,0.03)',
  tagSuccessBg:       'rgba(52,211,153,0.12)',
  tagSuccessText:     '#34D399',
  tagPendingBg:       'rgba(251,191,36,0.12)',
  tagPendingText:     '#FBBF24',
}

const LIGHT = {
  rootBg:             '#F2EFFF',
  sidebarBg:          'linear-gradient(180deg, #FFFFFF 0%, #FAFAFE 100%)',
  sidebarBorder:      'rgba(0,0,0,0.07)',
  ambientGlow:        'radial-gradient(ellipse 100% 50% at 50% 0%, rgba(79,63,204,0.05), transparent)',
  logoWordmark:       '#1A1835',
  logoSub:            '#C5C3D8',
  collapseBtnHoverBg: 'rgba(0,0,0,0.06)',
  collapseBtnColor:   '#C5C3D8',
  navActiveBg:        'rgba(232,150,15,0.08)',
  navHoverBg:         'rgba(0,0,0,0.04)',
  navActiveText:      '#1A1835',
  navInactiveText:    '#9897B3',
  navIconActive:      '#C87D09',
  navIconInactive:    '#C5C3D8',
  sectionLabel:       '#C5C3D8',
  divider:            'rgba(0,0,0,0.07)',
  upgradeBg:          'rgba(232,150,15,0.06)',
  upgradeBorder:      'rgba(232,150,15,0.22)',
  upgradePlan:        '#C87D09',
  upgradeSub:         '#9897B3',
  upgradeIconBg:      'rgba(232,150,15,0.12)',
  avatarRing:         '#F2EFFF',
  userName:           '#1A1835',
  userEmail:          '#A09DC0',
  topbarBg:           'rgba(255,255,255,0.92)',
  topbarBorder:       'rgba(0,0,0,0.07)',
  menuBtnColor:       '#A09DC0',
  menuBtnHoverBg:     'rgba(0,0,0,0.05)',
  breadcrumbParent:   '#C5C3D8',
  breadcrumbSep:      '#DDD9EE',
  breadcrumbCurrent:  '#4E4B6A',
  searchBg:           'rgba(0,0,0,0.04)',
  searchBorder:       'rgba(0,0,0,0.08)',
  searchText:         '#4E4B6A',
  searchPlaceholder:  '#C5C3D8',
  searchKbdBg:        'rgba(0,0,0,0.06)',
  searchKbdText:      '#C5C3D8',
  notifIconColor:     '#A09DC0',
  notifDropBg:        'rgba(255,255,255,0.99)',
  notifDropBorder:    'rgba(0,0,0,0.09)',
  notifDropShadow:    '0 24px 80px -16px rgba(0,0,0,0.18)',
  notifHdrBorder:     'rgba(0,0,0,0.06)',
  notifTitle:         '#1A1835',
  notifMarkRead:      '#4F3FCC',
  notifBody:          '#9897B3',
  notifTime:          '#C5C3D8',
  notifItemBorder:    'rgba(0,0,0,0.05)',
  notifItemHoverBg:   'rgba(0,0,0,0.02)',
  notifFooterBg:      'rgba(0,0,0,0.02)',
  notifFooterText:    '#9897B3',
  contentBg:          'linear-gradient(180deg, #EDE9FF 0%, #F2EFFF 100%)',
  pillBg:             'rgba(0,0,0,0.07)',
  pillBorder:         'rgba(0,0,0,0.10)',
  pillThumb:          '#FFFFFF',
  pillThumbShadow:    '0 1px 6px rgba(0,0,0,0.14)',
  // Content area
  card:               '#FFFFFF',
  cardBorder:         'rgba(0,0,0,0.07)',
  cardShadow:         '0 1px 16px -4px rgba(0,0,0,0.08)',
  heading:            '#1A1835',
  subheading:         '#4E4B6A',
  body:               '#9897B3',
  muted:              '#C5C3D8',
  tableRowBorder:     'rgba(0,0,0,0.06)',
  tableRowHoverBg:    'rgba(0,0,0,0.02)',
  tagSuccessBg:       'rgba(16,185,129,0.10)',
  tagSuccessText:     '#059669',
  tagPendingBg:       'rgba(245,158,11,0.10)',
  tagPendingText:     '#B45309',
}

type Theme = typeof DARK

// ── Nav data ──────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { id: 'overview',     label: 'Overview',     href: '/dashboard',               icon: 'grid'    },
  { id: 'campaigns',    label: 'Campaigns',    href: '/dashboard/campaigns',     icon: 'send'    },
  { id: 'testimonials', label: 'Testimonials', href: '/dashboard/testimonials',  icon: 'message', badge: 3 },
  { id: 'widgets',      label: 'Widgets',      href: '/dashboard/widgets',       icon: 'layout'  },
  { id: 'analytics',    label: 'Analytics',    href: '/dashboard/analytics',     icon: 'chart'   },
]

const NAV_MANAGE = [
  { id: 'integrations', label: 'Integrations', href: '/dashboard/integrations',  icon: 'plug'     },
  { id: 'settings',     label: 'Settings',     href: '/dashboard/settings',      icon: 'settings' },
]

const NOTIFICATIONS = [
  {
    title: 'New testimonial received',
    body: 'TechCorp Lagos submitted a 45-second video testimonial.',
    time: '2m ago',
  },
  {
    title: 'Widget live',
    body: 'Your Bento wall widget is now embedded and collecting views.',
    time: '1h ago',
  },
  {
    title: 'Campaign reminder',
    body: '"Q4 Reviews" has 5 pending responses waiting for your approval.',
    time: '3h ago',
  },
]

// ── Icon map ──────────────────────────────────────────────────────────────────
const PATHS: Record<string, React.ReactNode> = {
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  message: <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  chart: <path d="M3 3v18h18M7 16l4-6 4 3 5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  plug: <path d="M12 22v-3m0 0a4 4 0 01-4-4v-2h8v2a4 4 0 01-4 4zM8 8V3M16 8V3M8 8h8v3.5H8V8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
}

function Ico({ id, size = 18 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      {PATHS[id]}
    </svg>
  )
}

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({
  item, active, collapsed, T,
}: {
  item: { id: string; label: string; href: string; icon: string; badge?: number }
  active: string
  collapsed: boolean
  T: Theme
}) {
  const isActive = active === item.id

  return (
    <a
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        'group relative flex items-center rounded-xl text-[0.82rem] font-medium',
        collapsed ? 'h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5',
      )}
      style={{
        color:      isActive ? T.navActiveText : T.navInactiveText,
        background: isActive ? T.navActiveBg   : undefined,
        transition: 'color 0.2s',
      }}
    >
      {/* Gold active bar */}
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 h-[1.4rem] w-[3px] -translate-y-1/2 rounded-r-full"
          style={{ background: 'linear-gradient(to bottom, #F8C352, #E8960F)' }}
          aria-hidden="true"
        />
      )}

      {/* Hover surface */}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ background: T.navHoverBg }}
          aria-hidden="true"
        />
      )}

      {/* Icon */}
      <span
        className="relative z-10 transition-colors duration-150"
        style={{ color: isActive ? T.navIconActive : T.navIconInactive }}
      >
        <Ico id={item.icon} />
      </span>

      {/* Label + badge */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            className="relative z-10 flex flex-1 items-center gap-2 overflow-hidden"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.16, ease: E_OUT }}
          >
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span
                className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full
                           px-1.5 font-mono text-[0.55rem] font-bold"
                style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              >
                {item.badge}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, collapsed, T }: { label: string; collapsed: boolean; T: Theme }) {
  return (
    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.p
          className="mb-1 px-3 font-mono text-[0.54rem] tracking-[0.24em] uppercase"
          style={{ color: T.sectionLabel }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {label}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

// ── Theme toggle pill ─────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, T }: { isDark: boolean; onToggle: () => void; T: Theme }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex h-[30px] w-[52px] shrink-0 items-center rounded-full p-[3px]"
      style={{
        background:  T.pillBg,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: T.pillBorder,
        transition:  'background 0.3s, border-color 0.3s',
      }}
    >
      <motion.span
        animate={{ x: isDark ? 22 : 0 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.36 }}
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{
          background: T.pillThumb,
          boxShadow:  T.pillThumbShadow,
          willChange: 'transform',
          transition: 'background 0.3s',
        }}
      >
        {isDark ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  fill="#B0A8FC" stroke="#B0A8FC" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="#E8960F"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="#E8960F" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </motion.span>
    </button>
  )
}

// ── Overview content ─────────────────────────────────────────────────────────
function StatCard({
  label, value, delta, deltaPos, icon, T,
}: {
  label: string; value: string; delta: string; deltaPos: boolean; icon: string; T: Theme
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background:  T.card,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: T.cardBorder,
        boxShadow:   T.cardShadow,
        transition:  'background 0.3s, border-color 0.3s',
      }}
    >
      <div className="flex items-start justify-between">
        <p
          className="font-mono text-[0.58rem] tracking-[0.2em] uppercase"
          style={{ color: T.muted }}
        >
          {label}
        </p>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: 'rgba(123,110,245,0.1)', color: '#7B6EF5' }}
        >
          <Ico id={icon} size={14} />
        </span>
      </div>
      <p
        className="mt-3 font-display text-[1.75rem] font-bold tracking-tight"
        style={{ color: T.heading }}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[0.7rem]">
        <span style={{ color: deltaPos ? T.tagSuccessText : '#F87171' }}>
          {deltaPos ? '↑' : '↓'} {delta}
        </span>
        <span style={{ color: T.muted }}> vs last month</span>
      </p>
    </div>
  )
}

const STATS = [
  { label: 'Total Testimonials', value: '124',   delta: '12 new', deltaPos: true,  icon: 'message' },
  { label: 'Active Campaigns',   value: '6',     delta: '2 added', deltaPos: true, icon: 'send'    },
  { label: 'Widget Views',       value: '8,241', delta: '31%',    deltaPos: true,  icon: 'layout'  },
  { label: 'Conversion Rate',    value: '4.2%',  delta: '0.8%',   deltaPos: true,  icon: 'chart'   },
]

const RECENT_TESTIMONIALS = [
  { name: 'Amara Osei',   company: 'TechCorp Lagos',    time: '2m ago',  status: 'pending'  },
  { name: 'Femi Adeyemi', company: 'BuildWave HQ',      time: '41m ago', status: 'approved' },
  { name: 'Zainab Usman', company: 'Paystack Africa',   time: '3h ago',  status: 'approved' },
  { name: 'Chidi Okeke',  company: 'Konga Commerce',    time: '5h ago',  status: 'pending'  },
]

const ACTIVE_CAMPAIGNS = [
  { name: 'Q4 Reviews',       collected: 18, goal: 25 },
  { name: 'Product Launch',   collected: 7,  goal: 10 },
  { name: 'Onboarding Flow',  collected: 24, goal: 30 },
]

function OverviewContent({ T }: { T: Theme }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-7">

      {/* Greeting */}
      <div>
        <h1
          className="font-display text-[1.55rem] font-bold tracking-tight"
          style={{ color: T.heading, transition: 'color 0.3s' }}
        >
          {greeting}, Sage
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          {dateStr} · Here's what's happening with your social proof today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} T={T} />
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Recent testimonials */}
        <div
          className="overflow-hidden rounded-2xl lg:col-span-3"
          style={{
            background:  T.card,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: T.cardBorder,
            boxShadow:   T.cardShadow,
            transition:  'background 0.3s, border-color 0.3s',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}
          >
            <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>
              Recent testimonials
            </p>
            <a href="/dashboard/testimonials" className="text-[0.72rem]" style={{ color: '#7B6EF5' }}>
              View all →
            </a>
          </div>

          {RECENT_TESTIMONIALS.map((r, i) => {
            const initials = r.name.split(' ').map(n => n[0]).join('')
            const isApproved = r.status === 'approved'
            return (
              <div
                key={i}
                className="flex cursor-pointer items-center gap-3 px-5 py-3"
                style={{
                  borderBottom: i < RECENT_TESTIMONIALS.length - 1
                    ? `1px solid ${T.tableRowBorder}`
                    : undefined,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.tableRowHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                             text-[0.62rem] font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.78rem] font-medium" style={{ color: T.heading }}>
                    {r.name}
                  </p>
                  <p className="truncate text-[0.68rem]" style={{ color: T.body }}>
                    {r.company}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-[0.62rem] font-semibold capitalize"
                    style={
                      isApproved
                        ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                        : { background: T.tagPendingBg, color: T.tagPendingText }
                    }
                  >
                    {r.status}
                  </span>
                  <span className="hidden text-[0.64rem] sm:block" style={{ color: T.muted }}>{r.time}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Active campaigns */}
        <div
          className="overflow-hidden rounded-2xl lg:col-span-2"
          style={{
            background:  T.card,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: T.cardBorder,
            boxShadow:   T.cardShadow,
            transition:  'background 0.3s, border-color 0.3s',
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}
          >
            <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>
              Active campaigns
            </p>
            <a href="/dashboard/campaigns" className="text-[0.72rem]" style={{ color: '#7B6EF5' }}>
              Manage →
            </a>
          </div>

          <div className="flex flex-col gap-5 px-5 py-5">
            {ACTIVE_CAMPAIGNS.map((c, i) => {
              const pct = Math.round((c.collected / c.goal) * 100)
              return (
                <div key={i}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[0.78rem] font-medium" style={{ color: T.heading }}>
                      {c.name}
                    </p>
                    <p className="text-[0.68rem]" style={{ color: T.muted }}>
                      {c.collected} / {c.goal}
                    </p>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: T.tableRowBorder, transition: 'background 0.3s' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #F8C352, #E8960F)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.85, delay: i * 0.12, ease: E_OUT }}
                    />
                  </div>
                  <p className="mt-1.5 text-[0.62rem]" style={{ color: T.muted }}>
                    {pct}% complete
                  </p>
                </div>
              )
            })}
          </div>

          {/* Quick action */}
          <div className="px-5 pb-5">
            <motion.a
              href="/dashboard/campaigns/new"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-xl
                         text-[0.78rem] font-semibold"
              style={{
                background:  'linear-gradient(135deg, #F8C352, #E8960F)',
                color:       '#080716',
                willChange:  'transform',
              }}
              whileHover={{ scale: 1.02, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/>
              </svg>
              New campaign
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Campaigns page ───────────────────────────────────────────────────────────
const CAMPAIGNS_DATA = [
  { name: 'Q4 Reviews',      desc: 'End of year customer satisfaction',   status: 'active',    collected: 18, goal: 25, created: 'Nov 12, 2025', pending: 5 },
  { name: 'Product Launch',  desc: 'New feature testimonials for v2.0',    status: 'active',    collected: 7,  goal: 10, created: 'Dec 2, 2025',  pending: 0 },
  { name: 'Onboarding Flow', desc: 'First-week experience reviews',         status: 'active',    collected: 24, goal: 30, created: 'Oct 28, 2025', pending: 3 },
  { name: 'Summer Campaign', desc: 'Seasonal promotional testimonials',     status: 'draft',     collected: 0,  goal: 15, created: 'Jun 1, 2025',  pending: 0 },
  { name: 'Agency Partners', desc: 'Partner network social proof',          status: 'completed', collected: 20, goal: 20, created: 'Sep 15, 2025', pending: 0 },
  { name: 'Beta Testers',    desc: 'Early access user feedback',            status: 'completed', collected: 12, goal: 12, created: 'Aug 5, 2025',  pending: 0 },
]

function CampaignsContent({ T }: { T: Theme }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
            Campaigns
          </h1>
          <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
            {CAMPAIGNS_DATA.length} campaigns · Manage testimonial collection flows.
          </p>
        </div>
        <motion.a
          href="/dashboard/campaigns/new"
          className="flex h-9 items-center gap-2 rounded-xl px-4 text-[0.8rem] font-semibold"
          style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716', willChange: 'transform' }}
          whileHover={{ scale: 1.04, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"/>
          </svg>
          New campaign
        </motion.a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPAIGNS_DATA.map((c, i) => {
          const pct = c.goal > 0 ? Math.round((c.collected / c.goal) * 100) : 0
          const statusStyle =
            c.status === 'active'    ? { bg: T.tagSuccessBg, text: T.tagSuccessText } :
            c.status === 'completed' ? { bg: 'rgba(123,110,245,0.12)', text: '#7B6EF5' } :
                                       { bg: T.tagPendingBg,  text: T.tagPendingText  }
          return (
            <motion.div
              key={i}
              className="flex flex-col gap-4 rounded-2xl p-5"
              style={{
                background: T.card, borderWidth: '1px', borderStyle: 'solid',
                borderColor: T.cardBorder, boxShadow: T.cardShadow,
                transition: 'background 0.3s, border-color 0.3s', willChange: 'transform',
              }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-semibold" style={{ color: T.heading }}>{c.name}</p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed" style={{ color: T.body }}>{c.desc}</p>
                </div>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-semibold capitalize"
                      style={{ background: statusStyle.bg, color: statusStyle.text }}>
                  {c.status}
                </span>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[0.68rem]" style={{ color: T.muted }}>Collected</span>
                  <span className="text-[0.68rem] font-medium" style={{ color: T.subheading }}>{c.collected} / {c.goal}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: T.tableRowBorder, transition: 'background 0.3s' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: c.status === 'completed' ? '#7B6EF5' : 'linear-gradient(90deg, #F8C352, #E8960F)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.85, delay: i * 0.07, ease: E_OUT }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[0.65rem]" style={{ color: T.muted }}>{c.created}</span>
                <div className="flex items-center gap-2">
                  {c.pending > 0 && (
                    <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold"
                          style={{ background: T.tagPendingBg, color: T.tagPendingText }}>
                      {c.pending} pending
                    </span>
                  )}
                  <a href="#" className="text-[0.7rem] font-medium" style={{ color: '#7B6EF5' }}>Edit →</a>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Testimonials page ─────────────────────────────────────────────────────────
const TESTIMONIALS_DATA = [
  { name: 'Amara Osei',   company: 'TechCorp Lagos',    quote: 'Wytnest completely transformed how we collect social proof. Setup took 5 minutes and our conversion rate jumped immediately.',            rating: 5, date: 'Jun 21, 2026', status: 'pending',  type: 'video' },
  { name: 'Femi Adeyemi', company: 'BuildWave HQ',      quote: 'The widget integration was seamless. Conversion rate up 23% in the first week. The bento wall looks incredible on our landing page.',    rating: 5, date: 'Jun 20, 2026', status: 'approved', type: 'text'  },
  { name: 'Zainab Usman', company: 'Paystack Africa',   quote: 'I was skeptical at first but the bento wall alone paid for itself in the first month. Video testimonials feel so authentic.',             rating: 4, date: 'Jun 20, 2026', status: 'approved', type: 'video' },
  { name: 'Chidi Okeke',  company: 'Konga Commerce',    quote: 'The magic-link campaign flow is genius. Zero friction for customers. We went from 2% to 18% testimonial completion rate overnight.',      rating: 5, date: 'Jun 19, 2026', status: 'pending',  type: 'text'  },
  { name: 'Ngozi Eze',    company: 'Flutterwave',       quote: 'Setup took under 10 minutes. The ROI on social proof is immediately visible in analytics. Highly recommend to any SaaS founder.',        rating: 5, date: 'Jun 18, 2026', status: 'approved', type: 'video' },
]

type TFilter = 'all' | 'pending' | 'approved'

function TestimonialsContent({ T }: { T: Theme }) {
  const [filter, setFilter] = useState<TFilter>('all')
  const filtered = filter === 'all' ? TESTIMONIALS_DATA : TESTIMONIALS_DATA.filter(t => t.status === filter)

  const tabs: { id: TFilter; label: string; count: number }[] = [
    { id: 'all',      label: 'All',      count: TESTIMONIALS_DATA.length },
    { id: 'pending',  label: 'Pending',  count: TESTIMONIALS_DATA.filter(t => t.status === 'pending').length },
    { id: 'approved', label: 'Approved', count: TESTIMONIALS_DATA.filter(t => t.status === 'approved').length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
          Testimonials
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          {TESTIMONIALS_DATA.length} total · Review and manage customer testimonials.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl p-1" style={{ background: T.tableRowBorder, transition: 'background 0.3s' }}>
        {tabs.map(tab => {
          const isActive = filter === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-[0.78rem] font-medium transition-all duration-200"
              style={isActive ? { background: T.card, color: T.heading, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' } : { color: T.body }}
            >
              {tab.label}
              <span
                className="rounded-full px-1.5 py-0.5 font-mono text-[0.55rem] font-bold"
                style={isActive
                  ? { background: 'rgba(232,150,15,0.12)', color: '#E8960F' }
                  : { background: T.cardBorder, color: T.muted }}
              >
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => {
            const initials = t.name.split(' ').map(n => n[0]).join('')
            const isApproved = t.status === 'approved'
            return (
              <motion.div
                key={t.name}
                layout
                className="rounded-2xl p-5"
                style={{
                  background: T.card, borderWidth: '1px', borderStyle: 'solid',
                  borderColor: T.cardBorder, boxShadow: T.cardShadow,
                  transition: 'background 0.3s, border-color 0.3s',
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, delay: i * 0.04, ease: E_OUT }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold text-white"
                       style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>{t.name}</p>
                        <span style={{ color: T.muted }}>·</span>
                        <p className="text-[0.72rem]" style={{ color: T.body }}>{t.company}</p>
                        <span className="rounded-full px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wide"
                              style={{ background: 'rgba(123,110,245,0.1)', color: '#7B6EF5' }}>
                          {t.type}
                        </span>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[0.62rem] font-semibold capitalize"
                            style={isApproved
                              ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                              : { background: T.tagPendingBg, color: T.tagPendingText }}>
                        {t.status}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="mt-1.5 flex gap-0.5">
                      {[...Array(5)].map((_, si) => (
                        <svg key={si} width="11" height="11" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={si < t.rating ? '#E8960F' : T.tableRowBorder}
                                stroke={si < t.rating ? '#E8960F' : T.tableRowBorder}
                                strokeWidth="1" strokeLinejoin="round"/>
                        </svg>
                      ))}
                    </div>

                    <p className="mt-2.5 text-[0.78rem] leading-relaxed" style={{ color: T.body }}>
                      "{t.quote}"
                    </p>

                    <div className="mt-3.5 flex items-center justify-between">
                      <span className="text-[0.65rem]" style={{ color: T.muted }}>{t.date}</span>
                      {!isApproved && (
                        <div className="flex gap-2">
                          <button className="rounded-lg px-3 py-1.5 text-[0.7rem] font-medium transition-opacity hover:opacity-70"
                                  style={{ background: T.tagSuccessBg, color: T.tagSuccessText }}>
                            Approve
                          </button>
                          <button className="rounded-lg px-3 py-1.5 text-[0.7rem] font-medium transition-opacity hover:opacity-70"
                                  style={{ background: T.tableRowBorder, color: T.body }}>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Widgets page ──────────────────────────────────────────────────────────────
const WIDGETS_DATA = [
  {
    id: 'bento', name: 'Bento Wall', color: '#4F3FCC', status: 'live', views: 5241, conversions: 312,
    desc: 'Masonry grid for landing pages. Renders your best testimonials in an eye-catching mosaic layout.',
    code: `<script src="https://cdn.wytnest.com/w/bento.js" data-id="wn_abc123"></script>`,
  },
  {
    id: 'ticker', name: 'Ticker', color: '#E8960F', status: 'live', views: 2108, conversions: 89,
    desc: 'Infinite horizontal scroll for headers and nav bars. Subtle, persistent social proof everywhere.',
    code: `<script src="https://cdn.wytnest.com/w/ticker.js" data-id="wn_def456"></script>`,
  },
  {
    id: 'cinematic', name: 'Cinematic Slider', color: '#34D399', status: 'paused', views: 892, conversions: 0,
    desc: 'Full-bleed quote carousel for homepage heroes. Supports video and text testimonials.',
    code: `<script src="https://cdn.wytnest.com/w/cinematic.js" data-id="wn_ghi789"></script>`,
  },
]

function WidgetsContent({ T }: { T: Theme }) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copy = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
          Widgets
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          Embed testimonial widgets anywhere with a single script tag.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {WIDGETS_DATA.map((w, i) => {
          const isLive = w.status === 'live'
          const isCopied = copiedId === w.id
          return (
            <motion.div
              key={w.id}
              className="overflow-hidden rounded-2xl"
              style={{
                background: T.card, borderWidth: '1px', borderStyle: 'solid',
                borderColor: T.cardBorder, boxShadow: T.cardShadow,
                transition: 'background 0.3s, border-color 0.3s',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.06, ease: E_OUT }}
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                {/* Icon dot */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                     style={{ background: `${w.color}18` }}>
                  <div className="h-3 w-3 rounded-full" style={{ background: w.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="text-[0.9rem] font-semibold" style={{ color: T.heading }}>{w.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold capitalize"
                          style={isLive
                            ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                            : { background: T.tagPendingBg, color: T.tagPendingText }}>
                      {w.status}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.75rem] leading-relaxed" style={{ color: T.body }}>{w.desc}</p>
                  <div className="mt-3 flex gap-6">
                    {[{ label: 'Views', val: w.views.toLocaleString() }, { label: 'Conversions', val: w.conversions.toString() }].map(s => (
                      <div key={s.label}>
                        <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase" style={{ color: T.muted }}>{s.label}</p>
                        <p className="mt-0.5 text-[0.95rem] font-bold" style={{ color: T.heading }}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
                  <button className="rounded-lg px-3 py-1.5 text-[0.72rem] font-medium transition-opacity hover:opacity-70"
                          style={{ background: 'rgba(123,110,245,0.1)', color: '#7B6EF5' }}>
                    Configure
                  </button>
                  <button className="rounded-lg px-3 py-1.5 text-[0.72rem] font-medium transition-opacity hover:opacity-70"
                          style={isLive
                            ? { background: T.tableRowBorder, color: T.body }
                            : { background: T.tagSuccessBg, color: T.tagSuccessText }}>
                    {isLive ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>

              {/* Embed code row */}
              <div className="flex items-center gap-3 px-5 py-3"
                   style={{ borderTop: `1px solid ${T.tableRowBorder}`, background: T.tableRowHoverBg, transition: 'background 0.3s' }}>
                <code className="min-w-0 flex-1 truncate font-mono text-[0.68rem]" style={{ color: T.body }}>
                  {w.code}
                </code>
                <button
                  onClick={() => copy(w.id, w.code)}
                  className="shrink-0 rounded-lg px-3 py-1.5 text-[0.68rem] font-medium transition-all"
                  style={isCopied
                    ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                    : { background: T.card, color: T.body, borderWidth: '1px', borderStyle: 'solid', borderColor: T.cardBorder }}
                >
                  {isCopied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Analytics page ────────────────────────────────────────────────────────────
const ANALYTICS_STATS = [
  { label: 'Total Widget Views',  value: '8,241', delta: '31%', deltaPos: true },
  { label: 'Unique Visitors',     value: '3,190', delta: '18%', deltaPos: true },
  { label: 'Click-through Rate',  value: '4.2%',  delta: '0.8%', deltaPos: true },
  { label: 'Avg. Time on Widget', value: '14s',   delta: '3s',   deltaPos: true },
]

const CHART_POINTS = [
  { day: 'Mon', views: 820  },
  { day: 'Tue', views: 932  },
  { day: 'Wed', views: 1241 },
  { day: 'Thu', views: 1098 },
  { day: 'Fri', views: 1345 },
  { day: 'Sat', views: 900  },
  { day: 'Sun', views: 905  },
]

const TOP_TESTIMONIALS_ANALYTICS = [
  { name: 'Ngozi Eze',    company: 'Flutterwave',     widget: 'Bento Wall', views: 1842, ctr: '6.2%' },
  { name: 'Femi Adeyemi', company: 'BuildWave HQ',    widget: 'Ticker',     views: 1200, ctr: '4.1%' },
  { name: 'Zainab Usman', company: 'Paystack Africa',  widget: 'Bento Wall', views: 980,  ctr: '3.8%' },
  { name: 'Amara Osei',   company: 'TechCorp Lagos',  widget: 'Bento Wall', views: 741,  ctr: '5.0%' },
]

function AnalyticsContent({ T }: { T: Theme }) {
  const maxViews = Math.max(...CHART_POINTS.map(d => d.views))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
          Analytics
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          Last 7 days · Widget performance and testimonial engagement.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {ANALYTICS_STATS.map((s, i) => (
          <div
            key={i}
            className="rounded-2xl p-5"
            style={{
              background: T.card, borderWidth: '1px', borderStyle: 'solid',
              borderColor: T.cardBorder, boxShadow: T.cardShadow,
              transition: 'background 0.3s, border-color 0.3s',
            }}
          >
            <p className="font-mono text-[0.58rem] tracking-[0.18em] uppercase" style={{ color: T.muted }}>{s.label}</p>
            <p className="mt-2 font-display text-[1.6rem] font-bold tracking-tight" style={{ color: T.heading }}>{s.value}</p>
            <p className="mt-1.5 text-[0.7rem]">
              <span style={{ color: s.deltaPos ? T.tagSuccessText : '#F87171' }}>
                {s.deltaPos ? '↑' : '↓'} {s.delta}
              </span>
              <span style={{ color: T.muted }}> this week</span>
            </p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: T.card, borderWidth: '1px', borderStyle: 'solid',
          borderColor: T.cardBorder, boxShadow: T.cardShadow,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>Widget views · last 7 days</p>
          <span className="text-[0.68rem]" style={{ color: T.muted }}>Total 8,241</span>
        </div>

        <div className="flex h-36 items-end gap-3">
          {CHART_POINTS.map((d, i) => {
            const heightPct = (d.views / maxViews) * 100
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-col items-center justify-end" style={{ height: 112 }}>
                  <motion.div
                    className="w-full rounded-t-lg"
                    style={{ background: 'linear-gradient(to top, #E8960F, #F8C352)', minHeight: 4 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.06, ease: E_OUT }}
                  />
                </div>
                <p className="font-mono text-[0.58rem]" style={{ color: T.muted }}>{d.day}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top testimonials table */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: T.card, borderWidth: '1px', borderStyle: 'solid',
          borderColor: T.cardBorder, boxShadow: T.cardShadow,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}>
          <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>Top performing testimonials</p>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}>
              {['Testimonial', 'Widget', 'Views', 'CTR'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-mono text-[0.58rem] tracking-[0.16em] uppercase"
                    style={{ color: T.muted }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TOP_TESTIMONIALS_ANALYTICS.map((r, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < TOP_TESTIMONIALS_ANALYTICS.length - 1 ? `1px solid ${T.tableRowBorder}` : undefined,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.tableRowHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-5 py-3.5">
                  <p className="text-[0.78rem] font-medium" style={{ color: T.heading }}>{r.name}</p>
                  <p className="text-[0.68rem]" style={{ color: T.body }}>{r.company}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full px-2 py-0.5 text-[0.62rem] font-medium"
                        style={{ background: 'rgba(123,110,245,0.1)', color: '#7B6EF5' }}>
                    {r.widget}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[0.78rem] font-medium" style={{ color: T.heading }}>
                  {r.views.toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-[0.78rem] font-semibold" style={{ color: T.tagSuccessText }}>
                  {r.ctr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

// ── Integrations page ────────────────────────────────────────────────────────
const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Get notified in Slack when a new testimonial is received or approved.',
    status: 'connected',
    meta: 'Connected to #testimonials',
    color: '#4A154B',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'zapier',
    name: 'Zapier',
    desc: 'Trigger Zaps when testimonials are collected — send to CRMs, sheets, or anywhere.',
    status: 'connected',
    meta: '2 active Zaps',
    color: '#FF4F00',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M14.5 2L3 13.5h7.5L9 22l12-11.5H13.5L14.5 2z" fill="currentColor" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    desc: 'Auto-sync approved testimonials to a Notion database for your content team.',
    status: 'disconnected',
    meta: null,
    color: '#000000',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466l1.823 1.447zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933l3.222-.187z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    desc: 'Map testimonials to HubSpot contacts and log activity automatically.',
    status: 'disconnected',
    meta: null,
    color: '#FF7A59',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M18.164 7.931V5.085a1.724 1.724 0 0 0 .997-1.56V3.5A1.724 1.724 0 0 0 17.437 1.776h-.025A1.724 1.724 0 0 0 15.688 3.5v.025c0 .694.413 1.295.997 1.56v2.846a4.885 4.885 0 0 0-2.325 1.025L6.4 2.987a1.922 1.922 0 0 0 .048-.427 1.938 1.938 0 1 0-1.938 1.938c.331 0 .638-.088.91-.237l7.83 5.87A4.876 4.876 0 0 0 12.43 12c0 .668.134 1.305.374 1.886l-2.367 1.368A2.844 2.844 0 0 0 8.58 14.71a2.866 2.866 0 1 0 2.866 2.866 2.839 2.839 0 0 0-.44-1.515l2.34-1.353A4.912 4.912 0 0 0 17.425 16.9 4.9 4.9 0 0 0 22.338 12a4.9 4.9 0 0 0-4.174-4.069z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    desc: 'Send real-time POST events to your own endpoint on any testimonial lifecycle event.',
    status: 'connected',
    meta: 'https://api.mybrand.com/hooks/wn',
    color: '#7B6EF5',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google Reviews',
    desc: 'Import and sync your Google Business reviews as testimonials automatically.',
    status: 'disconnected',
    meta: null,
    color: '#4285F4',
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

function IntegrationsContent({ T }: { T: Theme }) {
  const connected = INTEGRATIONS.filter(i => i.status === 'connected').length
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
          Integrations
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          {connected} of {INTEGRATIONS.length} connected · Link Wytnest to your existing stack.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((intg, i) => {
          const isConnected = intg.status === 'connected'
          return (
            <motion.div
              key={intg.id}
              className="flex flex-col gap-4 rounded-2xl p-5"
              style={{
                background: T.card, borderWidth: '1px', borderStyle: 'solid',
                borderColor: T.cardBorder, boxShadow: T.cardShadow,
                transition: 'background 0.3s, border-color 0.3s', willChange: 'transform',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: i * 0.05, ease: E_OUT }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                     style={{ background: `${intg.color}18`, color: intg.color }}>
                  {intg.icon}
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold capitalize"
                  style={isConnected
                    ? { background: T.tagSuccessBg, color: T.tagSuccessText }
                    : { background: T.tableRowBorder, color: T.muted }}
                >
                  {intg.status}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="text-[0.88rem] font-semibold" style={{ color: T.heading }}>{intg.name}</p>
                <p className="mt-1 text-[0.73rem] leading-relaxed" style={{ color: T.body }}>{intg.desc}</p>
                {intg.meta && (
                  <p className="mt-2 truncate font-mono text-[0.64rem]" style={{ color: T.muted }}>
                    {intg.meta}
                  </p>
                )}
              </div>

              {/* Action */}
              <button
                className="w-full rounded-xl py-2 text-[0.75rem] font-semibold transition-opacity hover:opacity-80"
                style={isConnected
                  ? { background: T.tableRowBorder, color: T.body }
                  : { background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)', color: '#fff' }}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── Settings page ─────────────────────────────────────────────────────────────
function SettingsContent({ T }: { T: Theme }) {
  const [name,      setName]      = useState('Sage Okonkwo')
  const [email,     setEmail]     = useState('kicsworldwide@gmail.com')
  const [brandName, setBrandName] = useState('Wytnest')
  const [fromName,  setFromName]  = useState('Sage from Wytnest')
  const [saved,     setSaved]     = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }

  const fieldStyle = {
    background: T.tableRowHoverBg,
    borderWidth: '1px', borderStyle: 'solid', borderColor: T.cardBorder,
    color: T.heading,
    transition: 'background 0.3s, border-color 0.3s',
  }
  const labelStyle = { color: T.muted }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: T.card, borderWidth: '1px', borderStyle: 'solid',
        borderColor: T.cardBorder, boxShadow: T.cardShadow,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.tableRowBorder}` }}>
        <p className="text-[0.82rem] font-semibold" style={{ color: T.heading }}>{title}</p>
      </div>
      <div className="flex flex-col gap-5 p-6">{children}</div>
    </div>
  )

  const Field = ({ label, value, onChange, type = 'text', hint }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; hint?: string
  }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.72rem] font-medium" style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-[0.82rem] outline-none ring-0 focus:ring-2"
        style={{ ...fieldStyle, '--tw-ring-color': '#4F3FCC55' } as React.CSSProperties}
      />
      {hint && <p className="text-[0.65rem]" style={{ color: T.muted }}>{hint}</p>}
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-[1.55rem] font-bold tracking-tight" style={{ color: T.heading, transition: 'color 0.3s' }}>
          Settings
        </h1>
        <p className="mt-1 text-[0.82rem]" style={{ color: T.body, transition: 'color 0.3s' }}>
          Manage your account, brand, and notification preferences.
        </p>
      </div>

      {/* Profile */}
      <Section title="Profile">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[0.9rem] font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
            SO
          </div>
          <div>
            <p className="text-[0.8rem] font-medium" style={{ color: T.heading }}>Profile photo</p>
            <p className="text-[0.7rem]" style={{ color: T.body }}>JPG, PNG or WebP · max 2 MB</p>
            <button className="mt-1.5 text-[0.7rem] font-medium" style={{ color: '#7B6EF5' }}>Upload photo</button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={name} onChange={setName} />
          <Field label="Email address" value={email} onChange={setEmail} type="email" />
        </div>
      </Section>

      {/* Brand */}
      <Section title="Brand">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand / company name" value={brandName} onChange={setBrandName}
                 hint="Shown in campaign emails and widget footers." />
          <Field label="From name" value={fromName} onChange={setFromName}
                 hint="The sender name customers see in collection emails." />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[0.72rem] font-medium" style={labelStyle}>Brand color</label>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl border" style={{ background: '#4F3FCC', borderColor: T.cardBorder }} />
            <input
              type="text"
              defaultValue="#4F3FCC"
              className="w-36 rounded-xl px-4 py-2.5 text-[0.82rem] outline-none font-mono"
              style={fieldStyle}
            />
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        {[
          { label: 'New testimonial received',      sub: 'Email when a campaign collects a new response', on: true  },
          { label: 'Testimonial pending approval',  sub: 'Email when a response needs your review',       on: true  },
          { label: 'Weekly digest',                 sub: 'Summary of views, clicks, and conversions',     on: true  },
          { label: 'Product updates',               sub: 'New features, tips, and changelog',             on: false },
        ].map((n, i) => (
          <div key={i} className="flex items-start justify-between gap-4 sm:items-center">
            <div>
              <p className="text-[0.8rem] font-medium" style={{ color: T.heading }}>{n.label}</p>
              <p className="text-[0.7rem]" style={{ color: T.body }}>{n.sub}</p>
            </div>
            <button
              className="relative flex h-[26px] w-[46px] shrink-0 items-center rounded-full p-[3px]"
              style={n.on
                ? { background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }
                : { background: T.tableRowBorder, transition: 'background 0.3s' }}
            >
              <span
                className="h-5 w-5 rounded-full bg-white"
                style={{ transform: n.on ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
              />
            </button>
          </div>
        ))}
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.8rem] font-medium" style={{ color: T.heading }}>Delete account</p>
            <p className="text-[0.7rem]" style={{ color: T.body }}>Permanently removes all campaigns, testimonials, and widgets. Irreversible.</p>
          </div>
          <button
            className="shrink-0 rounded-xl px-4 py-2 text-[0.75rem] font-semibold transition-opacity hover:opacity-80"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', borderWidth: '1px', borderStyle: 'solid', borderColor: 'rgba(248,113,113,0.2)' }}
          >
            Delete account
          </button>
        </div>
      </Section>

      {/* Save bar */}
      <div className="flex justify-end">
        <motion.button
          onClick={save}
          className="flex h-10 items-center gap-2 rounded-xl px-6 text-[0.8rem] font-semibold"
          style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716', willChange: 'transform' }}
          whileHover={{ scale: 1.04, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
        >
          {saved ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved
            </>
          ) : 'Save changes'}
        </motion.button>
      </div>
    </div>
  )
}

// ── DashboardShell ────────────────────────────────────────────────────────────
export function DashboardShell({
  children,
  active = 'overview',
}: {
  children?: React.ReactNode
  active?: string
}) {
  const [collapsed,  setCollapsed]  = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen,  setNotifOpen]  = useState(false)
  const [isDark,     setIsDark]     = useState(true)
  const notifRef = useRef<HTMLDivElement>(null)

  const T = isDark ? DARK : LIGHT

  const pageTitle =
    [...NAV_MAIN, ...NAV_MANAGE].find((n) => n.id === active)?.label ?? 'Dashboard'

  // Restore persisted theme preference
  useEffect(() => {
    if (localStorage.getItem('wytnest-dash-theme') === 'light') setIsDark(false)
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      localStorage.setItem('wytnest-dash-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Close notifications on outside click
  useEffect(() => {
    if (!notifOpen) return
    function handle(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [notifOpen])

  return (
    <div
      className="flex min-h-screen"
      style={{ background: T.rootBg, transition: 'background 0.3s' }}
    >

      {/* ── Sidebar (desktop only) ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.42 }}
        className="relative hidden flex-col overflow-hidden lg:flex"
        style={{
          minWidth:    collapsed ? 72 : 240,
          maxWidth:    collapsed ? 72 : 240,
          borderRight: `1px solid ${T.sidebarBorder}`,
          background:   T.sidebarBg,
          transition:  'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40"
          style={{ background: T.ambientGlow }}
          aria-hidden="true"
        />

        {/* ── Logo row ── */}
        <div
          className="relative flex h-16 shrink-0 items-center gap-2.5 px-4"
          style={{ borderBottom: `1px solid ${T.sidebarBorder}`, transition: 'border-color 0.3s' }}
        >
          <a href="/" className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)',
                boxShadow:  '0 0 0 1px rgba(123,110,245,0.28), 0 0 18px -4px rgba(79,63,204,0.55)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3"
                      strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="2" fill="#E8960F" />
              </svg>
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight"
                  style={{ color: T.logoWordmark, transition: 'color 0.25s' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16, ease: E_OUT }}
                >
                  wyt<span style={{ fontWeight: 300, color: T.logoSub, transition: 'color 0.25s' }}>nest</span>
                </motion.span>
              )}
            </AnimatePresence>
          </a>

          {/* Collapse arrow */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ color: T.collapseBtnColor }}
                onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M11 19l-7-7 7-7M21 19l-7-7 7-7" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav ── */}
        <div className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-3 py-4">

          <SectionLabel label="Main" collapsed={collapsed} T={T} />

          {NAV_MAIN.map((item) => (
            <NavItem key={item.id} item={item} active={active} collapsed={collapsed} T={T} />
          ))}

          <div className="my-3 h-px" style={{ background: T.divider, transition: 'background 0.25s' }} />

          <SectionLabel label="Manage" collapsed={collapsed} T={T} />

          {NAV_MANAGE.map((item) => (
            <NavItem key={item.id} item={item} active={active} collapsed={collapsed} T={T} />
          ))}

          <div className="my-3 h-px" style={{ background: T.divider, transition: 'background 0.25s' }} />

          {/* Help */}
          <a
            href="/dashboard/help"
            title={collapsed ? 'Help & Support' : undefined}
            className={cn(
              'group relative flex items-center rounded-xl text-[0.82rem] font-medium',
              collapsed ? 'h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5',
            )}
            style={{ color: T.navInactiveText, transition: 'color 0.2s' }}
          >
            <span
              className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              style={{ background: T.navHoverBg }}
              aria-hidden="true"
            />
            <span className="relative z-10 transition-colors duration-150"
                  style={{ color: T.navIconInactive }}>
              <Ico id="help" />
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  className="relative z-10 flex-1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16, ease: E_OUT }}
                >
                  Help & Support
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        </div>

        {/* ── User section ── */}
        <div
          className="shrink-0 px-3 pb-4 pt-3"
          style={{ borderTop: `1px solid ${T.sidebarBorder}`, transition: 'border-color 0.3s' }}
        >
          {/* Upgrade pill */}
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.a
                href="/dashboard/billing"
                className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{
                  background:  T.upgradeBg,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: T.upgradeBorder,
                  transition:  'background 0.25s, border-color 0.25s',
                }}
                initial={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 12, overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2, ease: E_OUT }}
                whileHover={{ opacity: 0.82 }}
              >
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold" style={{ color: T.upgradePlan }}>
                    Growth plan
                  </p>
                  <p className="text-[0.64rem]" style={{ color: T.upgradeSub }}>
                    Upgrade to Agency →
                  </p>
                </div>
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: T.upgradeIconBg, transition: 'background 0.25s' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                          fill="#E8960F" stroke="#E8960F" strokeWidth="0.5" strokeLinejoin="round"/>
                  </svg>
                </span>
              </motion.a>
            )}
          </AnimatePresence>

          {/* Avatar row */}
          <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2', collapsed && 'justify-center px-0')}>
            <div
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                         text-[0.7rem] font-bold tracking-wide text-white"
              style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}
            >
              SA
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
                style={{ border: `2px solid ${T.avatarRing}`, transition: 'border-color 0.25s' }}
                title="Online"
              />
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div
                  className="min-w-0 flex-1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.16, ease: E_OUT }}
                >
                  <p className="truncate text-[0.8rem] font-semibold" style={{ color: T.userName }}>Sage</p>
                  <p className="truncate text-[0.66rem]" style={{ color: T.userEmail }}>kicsworldwide@gmail.com</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* ── Mobile sidebar drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer panel */}
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col overflow-hidden lg:hidden"
              style={{ background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, transition: 'background 0.3s' }}
              initial={{ x: -268 }} animate={{ x: 0 }} exit={{ x: -268 }}
              transition={{ type: 'spring', bounce: 0.06, duration: 0.38 }}
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40"
                   style={{ background: T.ambientGlow }} aria-hidden="true" />

              {/* Logo row */}
              <div className="relative flex h-16 shrink-0 items-center gap-2.5 px-4"
                   style={{ borderBottom: `1px solid ${T.sidebarBorder}` }}>
                <a href="/" className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)', boxShadow: '0 0 0 1px rgba(123,110,245,0.28), 0 0 18px -4px rgba(79,63,204,0.55)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="2" fill="#E8960F" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight"
                        style={{ color: T.logoWordmark }}>
                    wyt<span style={{ fontWeight: 300, color: T.logoSub }}>nest</span>
                  </span>
                </a>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                  style={{ color: T.collapseBtnColor }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Nav — clicks close the drawer */}
              <div className="relative flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-3 py-4"
                   onClick={() => setMobileOpen(false)}>
                <SectionLabel label="Main" collapsed={false} T={T} />
                {NAV_MAIN.map(item => (
                  <NavItem key={item.id} item={item} active={active} collapsed={false} T={T} />
                ))}
                <div className="my-3 h-px" style={{ background: T.divider }} />
                <SectionLabel label="Manage" collapsed={false} T={T} />
                {NAV_MANAGE.map(item => (
                  <NavItem key={item.id} item={item} active={active} collapsed={false} T={T} />
                ))}
                <div className="my-3 h-px" style={{ background: T.divider }} />
                <a href="/dashboard/help"
                   className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium"
                   style={{ color: T.navInactiveText }}>
                  <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                        style={{ background: T.navHoverBg }} aria-hidden="true" />
                  <span className="relative z-10" style={{ color: T.navIconInactive }}><Ico id="help" /></span>
                  <span className="relative z-10">Help & Support</span>
                </a>
              </div>

              {/* User section */}
              <div className="shrink-0 px-3 pb-4 pt-3"
                   style={{ borderTop: `1px solid ${T.sidebarBorder}` }}>
                <a href="/dashboard/billing"
                   className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
                   style={{ background: T.upgradeBg, border: `1px solid ${T.upgradeBorder}`, transition: 'background 0.3s' }}>
                  <div>
                    <p className="text-[0.72rem] font-bold" style={{ color: T.upgradePlan }}>Starter Plan</p>
                    <p className="text-[0.62rem]" style={{ color: T.upgradeSub }}>Upgrade for more</p>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ background: T.upgradeIconBg }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                            fill="#E8960F" stroke="#E8960F" strokeWidth="0.5" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </a>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tracking-wide text-white"
                       style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
                    SA
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
                          style={{ border: `2px solid ${T.avatarRing}` }} title="Online" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.8rem] font-semibold" style={{ color: T.userName }}>Sage</p>
                    <p className="truncate text-[0.66rem]" style={{ color: T.userEmail }}>kicsworldwide@gmail.com</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Topbar ── */}
        <header
          className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 px-3 sm:px-5"
          style={{
            borderBottom:         `1px solid ${T.topbarBorder}`,
            background:            T.topbarBg,
            backdropFilter:       'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            transition:           'background 0.3s, border-color 0.3s',
          }}
        >
          {/* Left: sidebar toggle + mobile logo + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setMobileOpen(v => !v)
                } else {
                  setCollapsed(v => !v)
                }
              }}
              aria-label="Toggle sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
              style={{ color: T.menuBtnColor }}
              onMouseEnter={e => (e.currentTarget.style.background = T.menuBtnHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>

            {/* Mobile logo — visible only when sidebar is hidden */}
            <a href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl"
                    style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="2" fill="#E8960F" />
                </svg>
              </span>
              <span className="hidden text-[0.88rem] font-extrabold tracking-tight sm:block"
                    style={{ color: T.logoWordmark }}>
                wyt<span style={{ fontWeight: 300, color: T.logoSub }}>nest</span>
              </span>
            </a>

            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[0.7rem]" style={{ color: T.breadcrumbParent }}>Dashboard</span>
              <span className="text-[0.6rem]" style={{ color: T.breadcrumbSep }}>/</span>
              <span className="text-[0.8rem] font-medium" style={{ color: T.breadcrumbCurrent }}>{pageTitle}</span>
            </div>
          </div>

          {/* Right: search · theme toggle · notifications · CTA */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <label
              className="hidden h-9 cursor-text items-center gap-2 rounded-xl px-3 sm:flex"
              style={{
                background:  T.searchBg,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: T.searchBorder,
                transition:  'background 0.25s, border-color 0.25s',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                   className="shrink-0" style={{ color: T.searchPlaceholder }}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.75" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                placeholder="Search…"
                className="w-32 bg-transparent text-[0.78rem] focus:outline-none lg:w-44"
                style={{ color: T.searchText }}
              />
              <kbd
                className="hidden rounded px-1.5 py-0.5 font-mono text-[0.52rem] lg:block"
                style={{ background: T.searchKbdBg, color: T.searchKbdText, transition: 'background 0.25s' }}
              >
                ⌘K
              </kbd>
            </label>

            {/* Theme toggle */}
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} T={T} />

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                style={{ color: T.notifIconColor }}
                onMouseEnter={e => (e.currentTarget.style.background = T.menuBtnHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Notifications"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span
                  className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center
                             justify-center rounded-full px-1 font-mono text-[0.5rem] font-bold"
                  style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
                >
                  {NOTIFICATIONS.length}
                </span>
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[22rem] overflow-hidden rounded-2xl"
                    style={{
                      background:           T.notifDropBg,
                      borderWidth:          '1px',
                      borderStyle:          'solid',
                      borderColor:          T.notifDropBorder,
                      boxShadow:            T.notifDropShadow,
                      backdropFilter:       'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                    }}
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: E_OUT }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: `1px solid ${T.notifHdrBorder}` }}
                    >
                      <p className="text-[0.78rem] font-semibold" style={{ color: T.notifTitle }}>
                        Notifications
                      </p>
                      <button
                        className="text-[0.68rem] transition-opacity hover:opacity-70"
                        style={{ color: T.notifMarkRead }}
                      >
                        Mark all read
                      </button>
                    </div>

                    {NOTIFICATIONS.map((n, i) => (
                      <div
                        key={i}
                        className="flex cursor-pointer gap-3 px-4 py-3"
                        style={{
                          borderBottom: i < NOTIFICATIONS.length - 1
                            ? `1px solid ${T.notifItemBorder}`
                            : undefined,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.notifItemHoverBg)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: '#E8960F' }} />
                        <div className="min-w-0">
                          <p className="text-[0.76rem] font-medium" style={{ color: T.notifTitle }}>{n.title}</p>
                          <p className="mt-0.5 text-[0.7rem] leading-relaxed" style={{ color: T.notifBody }}>{n.body}</p>
                          <p className="mt-1 text-[0.62rem]" style={{ color: T.notifTime }}>{n.time}</p>
                        </div>
                      </div>
                    ))}

                    <div className="px-4 py-3">
                      <button
                        className="w-full rounded-xl py-2 text-[0.73rem] transition-opacity hover:opacity-70"
                        style={{ background: T.notifFooterBg, color: T.notifFooterText }}
                      >
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* New campaign */}
            <motion.a
              href="/dashboard/campaigns/new"
              className="flex h-9 items-center gap-2 rounded-xl px-4 text-[0.8rem] font-semibold"
              style={{
                background: 'linear-gradient(135deg, #F8C352, #E8960F)',
                boxShadow:  '0 4px 20px -6px rgba(232,150,15,0.5)',
                color:      '#080716',
                willChange: 'transform',
              }}
              whileHover={{
                scale:     1.04,
                boxShadow: '0 8px 30px -6px rgba(232,150,15,0.65)',
                transition: { duration: 0.2, ease: E_OUT },
              }}
              whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">New campaign</span>
            </motion.a>
          </div>
        </header>

        {/* ── Page content ── */}
        <main
          className="flex-1 overflow-auto"
          style={{ background: T.contentBg, transition: 'background 0.3s' }}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {active === 'overview'      ? <OverviewContent      T={T} /> :
             active === 'campaigns'    ? <CampaignsContent    T={T} /> :
             active === 'testimonials' ? <TestimonialsContent T={T} /> :
             active === 'widgets'      ? <WidgetsContent      T={T} /> :
             active === 'analytics'     ? <AnalyticsContent     T={T} /> :
             active === 'integrations' ? <IntegrationsContent T={T} /> :
             active === 'settings'     ? <SettingsContent     T={T} /> :
             children}
          </div>
        </main>
      </div>
    </div>
  )
}
