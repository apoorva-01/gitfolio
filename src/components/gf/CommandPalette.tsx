'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRepositories } from '@/hooks/useRepositories'
import { Icon, Kbd, LangDot } from './primitives'
import type { Repository } from '@/store'

type Item = { id: string; label: string; hint?: string; href: string; icon: 'Repo' | 'Home' | 'Chart' | 'Compass' | 'User' | 'Settings' | 'Globe'; lang?: string }

export function CommandPalette() {
  const router = useRouter()
  const { repos } = useRepositories()
  const { data: session } = useSession()
  const login = (session?.user as { githubLogin?: string } | undefined)?.githubLogin

  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 20)
      return () => clearTimeout(t)
    }
  }, [open])

  const pages: Item[] = useMemo(() => {
    const p: Item[] = [
      { id: 'p-dashboard', label: 'Dashboard', href: '/dashboard', icon: 'Home' },
      { id: 'p-repos', label: 'Repositories', href: '/repos', icon: 'Repo' },
      { id: 'p-graph', label: 'Graph', href: '/graph', icon: 'Compass' },
      { id: 'p-analytics', label: 'Analytics', href: '/analytics', icon: 'Chart' },
      { id: 'p-profile', label: 'Profile', href: '/profile', icon: 'User' },
      { id: 'p-settings', label: 'Settings', href: '/settings', icon: 'Settings' },
    ]
    if (login) p.push({ id: 'p-pub', label: 'Public page', hint: `/pub/${login}`, href: `/pub/${login}`, icon: 'Globe' })
    return p
  }, [login])

  const query = q.trim().toLowerCase()

  const repoItems: Item[] = useMemo(() => {
    const list = query
      ? repos.filter((r: Repository) =>
          r.name.toLowerCase().includes(query) ||
          (r.description || '').toLowerCase().includes(query) ||
          (r.language || '').toLowerCase().includes(query))
      : repos.slice(0, 6)
    return list.slice(0, 8).map((r: Repository) => ({
      id: `r-${r.id}`, label: r.name, hint: r.description || undefined, href: `/repos/${r.id}`, icon: 'Repo' as const, lang: r.language || undefined,
    }))
  }, [repos, query])

  const pageItems = query ? pages.filter((p) => p.label.toLowerCase().includes(query)) : pages
  const results: { section: string; items: Item[] }[] = [
    { section: 'Repositories', items: repoItems },
    { section: 'Go to', items: pageItems },
  ].filter((g) => g.items.length > 0)

  const flat = results.flatMap((g) => g.items)

  const go = (item?: Item) => {
    if (!item) return
    setOpen(false)
    router.push(item.href)
  }

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(flat.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(flat[active]) }
  }

  return (
    <>
      {/* trigger — visually the top-nav search box */}
      <button
        onClick={() => setOpen(true)}
        className="gf-topnav-search"
        style={{
          width: 280, height: 32, padding: '0 8px 0 32px', position: 'relative', textAlign: 'left',
          background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8,
          color: 'var(--text-3)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <Icon.Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-3)' }} />
        <span style={{ flex: 1 }}>Search repos, pages…</span>
        <Kbd>⌘K</Kbd>
      </button>

      {mounted && open && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'color-mix(in oklab, #000 55%, transparent)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12vh' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(560px, 92vw)', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 14, boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              <Icon.Search size={16} style={{ color: 'var(--text-3)' }} />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setActive(0) }}
                onKeyDown={onInputKey}
                placeholder="Search repositories and pages…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' }}
              />
              <Kbd>esc</Kbd>
            </div>

            <div style={{ maxHeight: '52vh', overflowY: 'auto', padding: 8 }}>
              {flat.length === 0 ? (
                <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: 'var(--text-3)' }}>No matches for “{q}”.</div>
              ) : (
                results.map((group) => (
                  <div key={group.section} style={{ marginBottom: 6 }}>
                    <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)' }}>{group.section}</div>
                    {group.items.map((item) => {
                      const idx = flat.indexOf(item)
                      const isActive = idx === active
                      const Ico = Icon[item.icon]
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setActive(idx)}
                          onClick={() => go(item)}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8,
                            border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
                            background: isActive ? 'var(--surface-2)' : 'transparent', color: 'var(--text)',
                          }}
                        >
                          {item.lang ? <LangDot lang={item.lang} /> : <Ico size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                          <span style={{ fontSize: 13, flexShrink: 0 }}>{item.label}</span>
                          {item.hint && <span style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.hint}</span>}
                          <Icon.ArrowR size={13} style={{ marginLeft: 'auto', color: 'var(--text-3)', opacity: isActive ? 1 : 0 }} />
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
