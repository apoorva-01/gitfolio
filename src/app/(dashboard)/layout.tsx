'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/gf/AppShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ''
  // onboarding is a full-screen wizard — no sidebar chrome
  if (pathname.startsWith('/onboarding')) {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>{children}</div>
  }
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
