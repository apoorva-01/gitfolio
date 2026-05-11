'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import { useUIStore, useRepoStore } from '@/store'
import { toast } from '@/components/ui/Toast'

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const props = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, className }
  switch (icon) {
    case 'grid':
      return <svg {...props}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
    case 'chart':
      return <svg {...props}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    case 'repo':
      return <svg {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
    case 'user':
      return <svg {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
    case 'gear':
      return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    default:
      return null
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const user = session?.user
  const username = user?.name || 'User'
  const repoCount = useRepoStore((s) => s.repos.length)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const pathname = usePathname()

  const navItems = [
    { section: 'Overview', items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' },
      { href: '/analytics', label: 'Analytics', icon: 'chart' },
    ]},
    { section: 'Content', items: [
      { href: '/repos', label: 'Repositories', icon: 'repo', badge: repoCount },
      { href: '/profile', label: 'Profile', icon: 'user' },
      { href: session?.user?.email ? `/pub/${session.user.email.split('@')[0]}` : '/pub/testuser', label: 'Public Page', icon: 'globe' },
    ]},
    { section: 'Settings', items: [
      { href: '/settings', label: 'Settings', icon: 'gear' },
    ]},
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg)' }}>
      <aside
        className="fixed left-0 top-0 h-screen flex flex-col transition-all duration-200 z-30"
        style={{
          width: collapsed ? '64px' : '240px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg no-underline" style={{ color: 'var(--color-text)' }}>
            <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
              <rect width="32" height="32" rx="6" fill="#161b22"/>
              <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#58a6ff" strokeWidth="2" fill="none"/>
              <path d="M12 16l3 3 5-6" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>GitFolio</span>}
          </Link>
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center p-2 rounded cursor-pointer transition-all"
            style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: collapsed ? 'rotate(180deg)' : '' }}>
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navItems.map((section) => (
            <div key={section.section} className="mb-5">
              {!collapsed && (
                <div
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {section.section}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded text-sm no-underline mb-0.5 transition-all"
                    style={{
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                      background: isActive ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                    }}
                  >
                    <NavIcon icon={item.icon} className="flex-shrink-0" />
                    {!collapsed && (
                      <span className="flex-1" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div
        className="flex-1 min-h-screen transition-all duration-200"
        style={{ marginLeft: collapsed ? '64px' : '240px' }}
      >
        <header
          className="h-16 flex items-center justify-between px-6 sticky top-0 z-20"
          style={{
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative" style={{ width: '320px' }}>
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && searchVal.trim()) { window.location.href = `/repos?q=${encodeURIComponent(searchVal)}` } }}
                className="w-full py-2 pl-10 pr-3 text-sm rounded"
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => toast.info('No new notifications')}
              className="flex items-center justify-center p-2 rounded cursor-pointer relative"
              style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-error)' }}
              />
            </button>
            <button
              onClick={() => toast.info('No new notifications')}
              className="flex items-center justify-center p-2 rounded cursor-pointer"
              style={{ color: 'var(--color-text-secondary)', background: 'none', border: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            </button>
            <div className="relative">
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded cursor-pointer transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {user?.image ? (
                  <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 rounded-full" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-success))' }} />
                )}
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{username}</span>
              </div>
              {menuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 z-50 rounded-lg py-2 min-w-[180px]"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                >
                  <div className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>{username}</div>
                  <div style={{ borderTop: '1px solid var(--color-border)' }} />
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer border-none"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-6">{children}</main>
      </div>
    </div>
  )
}
