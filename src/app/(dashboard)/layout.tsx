'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './layout.css'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/repos', label: 'Repositories' },
  { href: '/profile', label: 'Profile' },
  { href: '/analytics', label: 'Analytics' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="dashboard-shell">
      <header className="top-nav">
        <div className="top-nav-inner">
          <Link href="/dashboard" className="nav-logo">
            GitFolio
          </Link>
          <nav className="nav-tabs">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-tab ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="nav-actions">
            <Link href="/settings" className="nav-tab">
              Settings
            </Link>
            <div className="nav-avatar">
              {session?.user?.name ? getInitials(session.user.name) : 'U'}
            </div>
          </div>
        </div>
      </header>
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}