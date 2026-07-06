'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Logo, Icon, Avatar, type IconName } from './primitives'
import { CommandPalette } from './CommandPalette'
import { NotifBell } from './NotifBell'

type NavItem = { label: string; icon: IconName; href: string }

const NAV: NavItem[] = [
  { label: 'Dashboard', icon: 'Home', href: '/dashboard' },
  { label: 'Repositories', icon: 'Repo', href: '/repos' },
  { label: 'Graph', icon: 'Compass', href: '/graph' },
  { label: 'Analytics', icon: 'Chart', href: '/analytics' },
  { label: 'Profile', icon: 'User', href: '/profile' },
]

export function Sidebar() {
  const pathname = usePathname() || ''
  const { data: session } = useSession()
  const login = (session?.user as { githubLogin?: string } | undefined)?.githubLogin

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const linkStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, position: 'relative', textDecoration: 'none',
    color: active ? 'var(--text)' : 'var(--text-2)',
    background: active ? 'var(--surface-2)' : 'transparent',
  })

  return (
    <aside style={{
      width: 224, flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      borderRight: '1px solid var(--border)', background: 'var(--bg-2)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}><Logo size={28} /></Link>
      </div>

      <nav style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {NAV.map((it) => {
          const Ico = Icon[it.icon]
          const active = isActive(it.href)
          return (
            <Link key={it.href} href={it.href} style={linkStyle(active)}>
              {active && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, borderRadius: 1, background: 'var(--accent)' }} />}
              <Ico size={16} />
              <span>{it.label}</span>
            </Link>
          )
        })}
        {login && (
          <Link href={`/pub/${login}`} style={linkStyle(isActive('/pub'))}>
            <Icon.Globe size={16} />
            <span>Public Page</span>
          </Link>
        )}

        <div style={{ height: 16 }} />
        <div style={{ padding: '0 10px', fontSize: 10, fontWeight: 600, letterSpacing: 1.2, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>AI</div>
        <Link href="/analytics" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          color: 'var(--ai-2)', background: 'var(--ai-soft)', border: '1px solid color-mix(in oklab, var(--ai) 25%, transparent)', textDecoration: 'none',
        }}>
          <Icon.Sparkle size={16} />
          <span>Insights</span>
        </Link>
      </nav>

      <div style={{ borderTop: '1px solid var(--border)', padding: 10, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Link href="/settings" style={linkStyle(isActive('/settings'))}>
          <Icon.Settings size={16} />
          <span>Settings</span>
        </Link>
        <button onClick={() => signOut({ callbackUrl: '/' })} style={{ ...linkStyle(false), border: 'none', background: 'transparent', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}>
          <Icon.Logout size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export function TopNav({ title, subtitle, search = true, actions }: {
  title: string; subtitle?: string; search?: boolean; actions?: ReactNode
}) {
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header style={{
      height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      borderBottom: '1px solid var(--border)', background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
      backdropFilter: 'blur(12px)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 20,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: -0.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{subtitle}</div>}
      </div>
      {search && <CommandPalette />}
      {actions}
      <NotifBell />
      <Avatar src={user?.image} name={user?.name || 'User'} size={28} />
    </header>
  )
}

/** Wraps a page: sticky TopNav + a scrollable content region. */
export function PageShell({ topNav, children }: { topNav: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {topNav}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
