'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWorkspace } from '@/lib/hooks/useWorkspace'
import { CreateCampaignModal } from '@/components/dashboard/CreateCampaignModal'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/lib/types/database'
import { DashThemeContext } from '@/lib/hooks/useDashTheme'

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
  tableRowBorder:     'rgba(255,255,255,0.05)',
  // Content area
  card:               'rgba(12,10,26,0.72)',
  cardBorder:         'rgba(255,255,255,0.07)',
  cardShadow:         '0 1px 24px -8px rgba(0,0,0,0.5)',
  heading:            '#E4E3F0',
  subheading:         '#B8B5D4',
  body:               '#6F6C92',
  muted:              '#3E3B61',
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
  tableRowBorder:     'rgba(0,0,0,0.06)',
  // Content area
  card:               '#FFFFFF',
  cardBorder:         'rgba(0,0,0,0.07)',
  cardShadow:         '0 1px 16px -4px rgba(0,0,0,0.08)',
  heading:            '#1A1835',
  subheading:         '#4E4B6A',
  body:               '#9897B3',
  muted:              '#C5C3D8',
  tableRowHoverBg:    'rgba(0,0,0,0.02)',
  tagSuccessBg:       'rgba(16,185,129,0.10)',
  tagSuccessText:     '#059669',
  tagPendingBg:       'rgba(245,158,11,0.10)',
  tagPendingText:     '#B45309',
}

type Theme = typeof DARK

// ── Nav data ──────────────────────────────────────────────────────────────────

const NAV_MAIN_BASE = [
  { id: 'overview',     label: 'Overview',     href: '/dashboard',               icon: 'grid'    },
  { id: 'campaigns',    label: 'Campaigns',    href: '/dashboard/campaigns',     icon: 'send'    },
  { id: 'testimonials', label: 'Testimonials', href: '/dashboard/testimonials',  icon: 'message' },
  { id: 'widgets',      label: 'Widgets',      href: '/dashboard/widgets',       icon: 'layout'  },
  { id: 'analytics',    label: 'Analytics',    href: '/dashboard/analytics',     icon: 'chart'   },
]

const NAV_MANAGE = [
  { id: 'integrations', label: 'Integrations', href: '/dashboard/integrations',  icon: 'plug'     },
  { id: 'settings',     label: 'Settings',     href: '/dashboard/settings',      icon: 'settings' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

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
  send:     <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  message:  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  layout: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  chart:    <path d="M3 3v18h18M7 16l4-6 4 3 5-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  plug:     <path d="M12 22v-3m0 0a4 4 0 01-4-4v-2h8v2a4 4 0 01-4 4zM8 8V3M16 8V3M8 8h8v3.5H8V8z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
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
      {isActive && !collapsed && (
        <span
          className="absolute left-0 top-1/2 h-[1.4rem] w-[3px] -translate-y-1/2 rounded-r-full"
          style={{ background: 'linear-gradient(to bottom, #F8C352, #E8960F)' }}
          aria-hidden="true"
        />
      )}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ background: T.navHoverBg }}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 transition-colors duration-150"
            style={{ color: isActive ? T.navIconActive : T.navIconInactive }}>
        <Ico id={item.icon} />
      </span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            className="relative z-10 flex flex-1 items-center gap-2 overflow-hidden"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.16, ease: E_OUT }}
          >
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span
                className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 font-mono text-[0.55rem] font-bold"
                style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}
              >
                {item.badge}
              </span>
            ) : null}
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
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
      style={{ background: T.pillBg, borderWidth: '1px', borderStyle: 'solid', borderColor: T.pillBorder, transition: 'background 0.3s, border-color 0.3s' }}
    >
      <motion.span
        animate={{ x: isDark ? 22 : 0 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.36 }}
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: T.pillThumb, boxShadow: T.pillThumbShadow, willChange: 'transform', transition: 'background 0.3s' }}
      >
        {isDark ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="#B0A8FC" stroke="#B0A8FC" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="4.5" fill="#E8960F"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#E8960F" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </motion.span>
    </button>
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
  const [collapsed,    setCollapsed]    = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const [isDark,       setIsDark]       = useState(true)
  const [showCreate,   setShowCreate]   = useState(false)
  const [authUser,     setAuthUser]     = useState<{ name: string; email: string; initials: string } | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [notifs,       setNotifs]       = useState<{ title: string; body: string; time: string }[]>([])

  const notifRef = useRef<HTMLDivElement>(null)
  const { workspace } = useWorkspace()
  const T = isDark ? DARK : LIGHT

  const pageTitle = [...NAV_MAIN_BASE, ...NAV_MANAGE].find(n => n.id === active)?.label ?? 'Dashboard'

  // Nav items with live pending badge
  const navMain = NAV_MAIN_BASE.map(item =>
    item.id === 'testimonials' && pendingCount > 0
      ? { ...item, badge: pendingCount }
      : item,
  )

  // Restore persisted theme
  useEffect(() => {
    if (localStorage.getItem('wytnest-dash-theme') === 'light') setIsDark(false)
  }, [])

  // Auth user (session-cached)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('wytnest-auth-user')
      if (cached) { setAuthUser(JSON.parse(cached)); return }
    } catch {}
    createClient().auth.getUser().then(({ data }) => {
      if (!data.user) return
      const name     = (data.user.user_metadata?.full_name as string | undefined) || data.user.email?.split('@')[0] || 'User'
      const email    = data.user.email ?? ''
      const initials = name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()
      const u = { name, email, initials }
      setAuthUser(u)
      try { sessionStorage.setItem('wytnest-auth-user', JSON.stringify(u)) } catch {}
    })
  }, [])

  // Pending testimonials → nav badge + notifications
  const loadPending = useCallback(async () => {
    if (!workspace) return
    const { data, count } = await createClient()
      .from('testimonials')
      .select('id, submitter_name, submitter_company, created_at', { count: 'exact' })
      .eq('workspace_id', workspace.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5)
    setPendingCount(count ?? 0)
    setNotifs(
      (data as Pick<Testimonial, 'id' | 'submitter_name' | 'submitter_company' | 'created_at'>[] ?? []).map(t => ({
        title: 'New testimonial received',
        body: `${t.submitter_name}${t.submitter_company ? ` · ${t.submitter_company}` : ''} submitted a testimonial pending review.`,
        time:  relTime(t.created_at),
      })),
    )
  }, [workspace])

  useEffect(() => { loadPending() }, [loadPending])

  const handleSignOut = async () => {
    try { sessionStorage.removeItem('wytnest-auth-user') } catch {}
    await createClient().auth.signOut()
    window.location.href = '/'
  }

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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [notifOpen])

  // Upgrade pill text
  const planLabel = workspace?.plan === 'agency' ? 'Agency' : workspace?.plan === 'growth' ? 'Growth' : workspace?.plan === 'starter' ? 'Starter' : 'Free'
  const nextPlan  = workspace?.plan === 'free' ? 'Starter' : workspace?.plan === 'starter' ? 'Growth' : workspace?.plan === 'growth' ? 'Agency' : null

  // Sidebar nav shared between desktop and mobile
  function SidebarNav({ collapsed: c, onClick }: { collapsed: boolean; onClick?: () => void }) {
    return (
      <div className={cn('relative flex flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-3 py-4', onClick && 'cursor-pointer')}
           onClick={onClick}>
        <SectionLabel label="Main" collapsed={c} T={T} />
        {navMain.map(item => <NavItem key={item.id} item={item} active={active} collapsed={c} T={T} />)}
        <div className="my-3 h-px" style={{ background: T.divider, transition: 'background 0.25s' }} />
        <SectionLabel label="Manage" collapsed={c} T={T} />
        {NAV_MANAGE.map(item => <NavItem key={item.id} item={item} active={active} collapsed={c} T={T} />)}
        <div className="my-3 h-px" style={{ background: T.divider, transition: 'background 0.25s' }} />
        <a href="/dashboard/help" title={c ? 'Help & Support' : undefined}
           className={cn('group relative flex items-center rounded-xl text-[0.82rem] font-medium', c ? 'h-10 w-10 justify-center' : 'gap-3 px-3 py-2.5')}
           style={{ color: T.navInactiveText, transition: 'color 0.2s' }}>
          <span className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-150 group-hover:opacity-100" style={{ background: T.navHoverBg }} aria-hidden="true" />
          <span className="relative z-10 transition-colors duration-150" style={{ color: T.navIconInactive }}><Ico id="help" /></span>
          <AnimatePresence initial={false}>
            {!c && (
              <motion.span className="relative z-10 flex-1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16, ease: E_OUT }}>
                Help & Support
              </motion.span>
            )}
          </AnimatePresence>
        </a>
      </div>
    )
  }

  // Sidebar user section shared
  function SidebarUser({ collapsed: c }: { collapsed: boolean }) {
    return (
      <div className="shrink-0 px-3 pb-4 pt-3" style={{ borderTop: `1px solid ${T.sidebarBorder}`, transition: 'border-color 0.3s' }}>
        <AnimatePresence initial={false}>
          {!c && (
            <motion.a
              href="/dashboard/settings"
              className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5"
              style={{ background: T.upgradeBg, borderWidth: '1px', borderStyle: 'solid', borderColor: T.upgradeBorder, transition: 'background 0.25s, border-color 0.25s' }}
              initial={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 12, overflow: 'visible' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              transition={{ duration: 0.2, ease: E_OUT }}
              whileHover={{ opacity: 0.82 }}
            >
              <div className="min-w-0">
                <p className="text-[0.72rem] font-semibold" style={{ color: T.upgradePlan }}>{planLabel} plan</p>
                <p className="text-[0.64rem]" style={{ color: T.upgradeSub }}>
                  {nextPlan ? `Upgrade to ${nextPlan} →` : 'You\'re on the top tier'}
                </p>
              </div>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: T.upgradeIconBg, transition: 'background 0.25s' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#E8960F" stroke="#E8960F" strokeWidth="0.5" strokeLinejoin="round"/>
                </svg>
              </span>
            </motion.a>
          )}
        </AnimatePresence>

        <div className={cn('flex items-center gap-3 rounded-xl px-3 py-2', c && 'justify-center px-0')}>
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tracking-wide text-white"
               style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
            {authUser?.initials ?? '··'}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400"
                  style={{ border: `2px solid ${T.avatarRing}`, transition: 'border-color 0.25s' }} title="Online" />
          </div>
          <AnimatePresence initial={false}>
            {!c && (
              <motion.div className="min-w-0 flex-1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16, ease: E_OUT }}>
                <p className="truncate text-[0.8rem] font-semibold" style={{ color: T.userName }}>{authUser?.name ?? '·····'}</p>
                <p className="truncate text-[0.66rem]" style={{ color: T.userEmail }}>{authUser?.email ?? ''}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {!c && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}
                onClick={handleSignOut} title="Sign out"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ color: T.navInactiveText }}
                onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {c && (
          <div className="mt-1 flex justify-center">
            <button onClick={handleSignOut} title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors"
              style={{ color: T.navInactiveText }}
              onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <DashThemeContext.Provider value={{ isDark, T }}>
    <div className="flex min-h-screen" style={{ background: T.rootBg, transition: 'background 0.3s' }}>

      {showCreate && workspace && (
        <CreateCampaignModal
          workspaceId={workspace.id}
          plan={workspace.plan ?? 'starter'}
          isDark={isDark}
          onCreated={() => setShowCreate(false)}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* ── Desktop sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.42 }}
        className="relative hidden flex-col overflow-hidden lg:flex"
        style={{
          minWidth:   collapsed ? 72 : 240,
          maxWidth:   collapsed ? 72 : 240,
          borderRight: `1px solid ${T.sidebarBorder}`,
          background:  T.sidebarBg,
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: T.ambientGlow }} aria-hidden="true" />

        {/* Logo */}
        <div className="relative flex h-16 shrink-0 items-center gap-2.5 px-4"
             style={{ borderBottom: `1px solid ${T.sidebarBorder}`, transition: 'border-color 0.3s' }}>
          <a href="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)', boxShadow: '0 0 0 1px rgba(123,110,245,0.28), 0 0 18px -4px rgba(79,63,204,0.55)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="2" fill="#E8960F" />
              </svg>
            </span>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight" style={{ color: T.logoWordmark, transition: 'color 0.25s' }}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16, ease: E_OUT }}>
                  wyt<span style={{ fontWeight: 300, color: T.logoSub, transition: 'color 0.25s' }}>nest</span>
                </motion.span>
              )}
            </AnimatePresence>
          </a>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                onClick={() => setCollapsed(true)} aria-label="Collapse sidebar"
                className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
                style={{ color: T.collapseBtnColor }}
                onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M11 19l-7-7 7-7M21 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <SidebarNav collapsed={collapsed} />
        <SidebarUser collapsed={collapsed} />
      </motion.aside>

      {/* ── Mobile sidebar drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col overflow-hidden lg:hidden"
              style={{ background: T.sidebarBg, borderRight: `1px solid ${T.sidebarBorder}`, transition: 'background 0.3s' }}
              initial={{ x: -268 }} animate={{ x: 0 }} exit={{ x: -268 }} transition={{ type: 'spring', bounce: 0.06, duration: 0.38 }}>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: T.ambientGlow }} aria-hidden="true" />

              <div className="relative flex h-16 shrink-0 items-center gap-2.5 px-4" style={{ borderBottom: `1px solid ${T.sidebarBorder}` }}>
                <a href="/" className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)', boxShadow: '0 0 0 1px rgba(123,110,245,0.28), 0 0 18px -4px rgba(79,63,204,0.55)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="7" r="2" fill="#E8960F" />
                    </svg>
                  </span>
                  <span className="whitespace-nowrap text-[0.95rem] font-extrabold tracking-tight" style={{ color: T.logoWordmark }}>
                    wyt<span style={{ fontWeight: 300, color: T.logoSub }}>nest</span>
                  </span>
                </a>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu"
                  className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ color: T.collapseBtnColor }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.collapseBtnHoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <SidebarNav collapsed={false} onClick={() => setMobileOpen(false)} />
              <SidebarUser collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* Topbar */}
        <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 px-3 sm:px-5"
          style={{ borderBottom: `1px solid ${T.topbarBorder}`, background: T.topbarBg, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', transition: 'background 0.3s, border-color 0.3s' }}>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.innerWidth < 1024) setMobileOpen(v => !v)
                else setCollapsed(v => !v)
              }}
              aria-label="Toggle sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
              style={{ color: T.menuBtnColor }}
              onMouseEnter={e => (e.currentTarget.style.background = T.menuBtnHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>

            <a href="/" className="flex items-center gap-2 lg:hidden">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #4F3FCC, #7B6EF5)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M6 7L12 17L18 7" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="2" fill="#E8960F" />
                </svg>
              </span>
              <span className="hidden text-[0.88rem] font-extrabold tracking-tight sm:block" style={{ color: T.logoWordmark }}>
                wyt<span style={{ fontWeight: 300, color: T.logoSub }}>nest</span>
              </span>
            </a>

            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[0.7rem]" style={{ color: T.breadcrumbParent }}>Dashboard</span>
              <span className="text-[0.6rem]" style={{ color: T.breadcrumbSep }}>/</span>
              <span className="text-[0.8rem] font-medium" style={{ color: T.breadcrumbCurrent }}>{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <label className="hidden h-9 cursor-text items-center gap-2 rounded-xl px-3 sm:flex"
              style={{ background: T.searchBg, borderWidth: '1px', borderStyle: 'solid', borderColor: T.searchBorder, transition: 'background 0.25s, border-color 0.25s' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: T.searchPlaceholder }}>
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.75" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <input type="search" placeholder="Search…" className="w-32 bg-transparent text-[0.78rem] focus:outline-none lg:w-44" style={{ color: T.searchText }} />
              <kbd className="hidden rounded px-1.5 py-0.5 font-mono text-[0.52rem] lg:block"
                   style={{ background: T.searchKbdBg, color: T.searchKbdText, transition: 'background 0.25s' }}>⌘K</kbd>
            </label>

            <ThemeToggle isDark={isDark} onToggle={toggleTheme} T={T} />

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(v => !v)}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                style={{ color: T.notifIconColor }}
                onMouseEnter={e => (e.currentTarget.style.background = T.menuBtnHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                aria-label="Notifications">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {pendingCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-1 font-mono text-[0.5rem] font-bold"
                        style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', color: '#080716' }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[22rem] overflow-hidden rounded-2xl"
                    style={{ background: T.notifDropBg, borderWidth: '1px', borderStyle: 'solid', borderColor: T.notifDropBorder, boxShadow: T.notifDropShadow, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                    initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: E_OUT }}>

                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.notifHdrBorder}` }}>
                      <p className="text-[0.78rem] font-semibold" style={{ color: T.notifTitle }}>
                        Notifications {pendingCount > 0 && <span className="ml-1.5 font-mono text-[0.6rem] text-gold-600">({pendingCount})</span>}
                      </p>
                      <a href="/dashboard/testimonials" className="text-[0.68rem] transition-opacity hover:opacity-70" style={{ color: T.notifMarkRead }}>
                        Review all →
                      </a>
                    </div>

                    {notifs.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-[0.78rem]" style={{ color: T.notifBody }}>No pending testimonials</p>
                        <p className="mt-1 text-[0.68rem]" style={{ color: T.notifTime }}>You&apos;re all caught up.</p>
                      </div>
                    ) : (
                      notifs.map((n, i) => (
                        <a key={i} href="/dashboard/testimonials"
                          className="flex cursor-pointer gap-3 px-4 py-3 transition-colors"
                          style={{ borderBottom: i < notifs.length - 1 ? `1px solid ${T.notifItemBorder}` : undefined }}
                          onMouseEnter={e => (e.currentTarget.style.background = T.notifItemHoverBg)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#E8960F' }} />
                          <div className="min-w-0">
                            <p className="text-[0.76rem] font-medium" style={{ color: T.notifTitle }}>{n.title}</p>
                            <p className="mt-0.5 text-[0.7rem] leading-relaxed" style={{ color: T.notifBody }}>{n.body}</p>
                            <p className="mt-1 text-[0.62rem]" style={{ color: T.notifTime }}>{n.time}</p>
                          </div>
                        </a>
                      ))
                    )}

                    <div className="px-4 py-3">
                      <a href="/dashboard/testimonials"
                        className="block w-full rounded-xl py-2 text-center text-[0.73rem] transition-opacity hover:opacity-70"
                        style={{ background: T.notifFooterBg, color: T.notifFooterText }}>
                        View all testimonials
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* New campaign */}
            <motion.button onClick={() => setShowCreate(true)}
              className="flex h-9 items-center gap-2 rounded-xl px-4 text-[0.8rem] font-semibold"
              style={{ background: 'linear-gradient(135deg, #F8C352, #E8960F)', boxShadow: '0 4px 20px -6px rgba(232,150,15,0.5)', color: '#080716', willChange: 'transform' }}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 30px -6px rgba(232,150,15,0.65)', transition: { duration: 0.2, ease: E_OUT } }}
              whileTap={{ scale: 0.96, transition: { duration: 0.1 } }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">New campaign</span>
            </motion.button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ background: T.contentBg, transition: 'background 0.3s' }}>
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
    </DashThemeContext.Provider>
  )
}
