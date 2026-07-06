'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRepositories } from '@/hooks/useRepositories'
import { Icon } from './primitives'
import type { Repository } from '@/store'

type Alert = { id: string; text: string; href: string; tone: 'accent' | 'warn' | 'danger' }

function deriveAlerts(repos: Repository[]): Alert[] {
  if (repos.length === 0) {
    return [{ id: 'sync', text: 'Sync your repositories to get started', href: '/dashboard', tone: 'accent' }]
  }
  const out: Alert[] = []
  const s = (n: number) => (n === 1 ? '' : 's')
  const noReadme = repos.filter((r) => !r.hasReadme).length
  const low = repos.filter((r) => (r.healthScore || 0) < 50).length
  const noDesc = repos.filter((r) => !r.description).length
  if (noReadme) out.push({ id: 'readme', text: `${noReadme} repo${s(noReadme)} missing a README`, href: '/repos', tone: 'warn' })
  if (low) out.push({ id: 'health', text: `${low} repo${s(low)} below 50 health`, href: '/repos', tone: 'danger' })
  if (noDesc) out.push({ id: 'desc', text: `${noDesc} repo${s(noDesc)} without a description`, href: '/repos', tone: 'accent' })
  return out
}

const TONE: Record<Alert['tone'], string> = { accent: 'var(--accent)', warn: 'var(--warn)', danger: 'var(--danger)' }

export function NotifBell() {
  const router = useRouter()
  const { repos } = useRepositories()
  const [open, setOpen] = useState(false)
  const alerts = deriveAlerts(repos)
  const count = alerts.length

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        style={{ width: 32, height: 32, borderRadius: 8, background: open ? 'var(--surface-2)' : 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
      >
        <Icon.Bell size={14} />
        {count > 0 && <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }} />}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div
            style={{
              position: 'absolute', top: 40, right: 0, width: 300, zIndex: 50,
              background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Notifications</span>
              {count > 0 && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{count}</span>}
            </div>
            {count === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)' }}>
                <Icon.Check size={20} style={{ color: 'var(--success)' }} />
                <div style={{ fontSize: 13, marginTop: 8 }}>You&apos;re all caught up</div>
              </div>
            ) : (
              <div style={{ padding: 6 }}>
                {alerts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setOpen(false); router.push(a.href) }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit', background: 'transparent' }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: TONE[a.tone], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text)', flex: 1 }}>{a.text}</span>
                    <Icon.ChevronR size={13} style={{ color: 'var(--text-3)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
