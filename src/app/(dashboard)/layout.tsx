'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Network,
  FolderOpen,
  User,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Settings,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/graph', label: 'Graph', icon: Network },
  { href: '/repos', label: 'Repositories', icon: FolderOpen },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') toggleSidebar()
  }, [])

  useEffect(() => {
    if (sidebarCollapsed) {
      localStorage.setItem('sidebar-collapsed', 'true')
    } else {
      localStorage.setItem('sidebar-collapsed', 'false')
    }
  }, [sidebarCollapsed])

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          isActive
            ? 'bg-emerald-900/30 text-emerald-400'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!sidebarCollapsed && <span className="text-sm font-medium">{label}</span>}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-gray-900/50 backdrop-blur border-r border-gray-800 transition-all duration-300 flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-60',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className={cn('h-16 flex items-center border-b border-gray-800', sidebarCollapsed ? 'justify-center px-2' : 'px-4')}>
          <h1 className="text-xl font-bold">
            <span className="text-white">Repo</span>
            <span className="text-emerald-500">Mind</span>
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>

        <div className={cn('p-3 border-t border-gray-800', sidebarCollapsed ? 'text-center' : '')}>
          {session?.user && (
            <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
              <img
                src={session.user.image || ''}
                alt={session.user.name || ''}
                className="w-8 h-8 rounded-full"
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-200 truncate">{session.user.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {(session.user as any).githubLogin || ''}
                  </p>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => signOut()}
            className={cn(
              'mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">Sign out</span>}
          </button>
        </div>
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden bg-gray-800 p-2 rounded-md"
      >
        <Menu className="w-5 h-5 text-gray-200" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-30 bg-gray-800 p-2 rounded-md border border-gray-700 hidden lg:block"
      >
        {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-gray-400" /> : <ChevronLeft className="w-5 h-5 text-gray-400" />}
      </button>

      <main className={cn('flex-1 transition-all duration-300', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60')}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
