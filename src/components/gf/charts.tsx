'use client'

import { Icon, Chip, type IconName } from './primitives'

/* ---------- contribution heatmap ---------- */

export function Heatmap({ data, cell = 11, gap = 3, showLegend = true, showLabels = true }: {
  data: number[][]; cell?: number; gap?: number; showLegend?: boolean; showLabels?: boolean
}) {
  const weeks = data.length
  const rows = 7
  const monthLabels = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const flat = data.flat()
  const max = Math.max(8, ...flat)
  const bucket = (v: number) => {
    if (v === 0) return 0
    if (v <= max * 0.15) return 1
    if (v <= max * 0.35) return 2
    if (v <= max * 0.65) return 3
    return 4
  }
  const fills = [
    'var(--surface-2)',
    'color-mix(in oklab, var(--accent) 18%, var(--surface-2))',
    'color-mix(in oklab, var(--accent) 38%, var(--surface-2))',
    'color-mix(in oklab, var(--accent) 65%, var(--surface-2))',
    'var(--accent)',
  ]
  const total = flat.reduce((s, v) => s + v, 0)
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {showLabels && (
          <div style={{ display: 'flex', flexDirection: 'column', gap, paddingTop: 18, fontSize: 10, color: 'var(--text-3)' }}>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} style={{ height: cell, lineHeight: `${cell}px`, opacity: i === 1 || i === 3 || i === 5 ? 1 : 0 }}>
                {i === 1 ? 'Mon' : i === 3 ? 'Wed' : i === 5 ? 'Fri' : ''}
              </div>
            ))}
          </div>
        )}
        <div style={{ flex: 1 }}>
          {showLabels && (
            <div style={{ display: 'flex', justifyContent: 'space-between', height: 14, fontSize: 10, color: 'var(--text-3)', marginBottom: 4, paddingRight: 4 }}>
              {monthLabels.map((m, i) => <span key={i}>{m}</span>)}
            </div>
          )}
          <svg width="100%" viewBox={`0 0 ${weeks * (cell + gap)} ${rows * (cell + gap)}`} preserveAspectRatio="none" style={{ display: 'block' }}>
            {data.map((week, w) => week.map((v, d) => (
              <rect key={`${w}-${d}`} x={w * (cell + gap)} y={d * (cell + gap)} width={cell} height={cell} rx={2} fill={fills[bucket(v)]} />
            )))}
          </svg>
        </div>
      </div>
      {showLegend && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-2)' }}>
          <span><b style={{ color: 'var(--text)' }}>{total.toLocaleString()}</b> contributions in the last year</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Less</span>
            {fills.map((f, i) => <span key={i} style={{ width: 10, height: 10, background: f, borderRadius: 2, display: 'inline-block' }} />)}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- donut ---------- */

export type LangSlice = { name: string; pct: number }

export function Donut({ data, size = 180, thickness = 28, centerLabel, centerValue }: {
  data: LangSlice[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string
}) {
  const r = size / 2 - thickness / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={thickness} />
      {data.map((d) => {
        const len = (d.pct / 100) * c
        const off = c - acc
        acc += len
        return (
          <circle key={d.name} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={`var(--lang-${d.name.toLowerCase()}, var(--accent))`} strokeWidth={thickness}
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt" />
        )
      })}
      {(centerLabel || centerValue) && (
        <g textAnchor="middle" fontFamily="var(--font)">
          <text x={size / 2} y={size / 2 - 2} fontSize="22" fontWeight="700" fill="var(--text)">{centerValue}</text>
          <text x={size / 2} y={size / 2 + 16} fontSize="10" fill="var(--text-3)" letterSpacing="1.2">{centerLabel}</text>
        </g>
      )}
    </svg>
  )
}

/* ---------- language bars ---------- */

export function LangBars({ data, height = 8 }: { data: LangSlice[]; height?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', height, borderRadius: height / 2, overflow: 'hidden', background: 'var(--surface-2)' }}>
        {data.map((d) => (
          <div key={d.name} title={`${d.name} ${d.pct}%`} style={{ width: `${d.pct}%`, background: `var(--lang-${d.name.toLowerCase()}, var(--accent))` }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 12 }}>
        {data.map((d) => (
          <span key={d.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: `var(--lang-${d.name.toLowerCase()}, var(--accent))` }} />
            <span style={{ color: 'var(--text)', fontWeight: 500 }}>{d.name}</span>
            <span>{d.pct.toFixed(1)}%</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---------- sparkline ---------- */

export function Sparkline({ data, width = 220, height = 56, color, fill = true, smooth = true }: {
  data: number[]; width?: number; height?: number; color?: string; fill?: boolean; smooth?: boolean
}) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const yFor = (v: number) => height - 6 - ((v - min) / range) * (height - 12)
  const c = color || 'var(--accent)'
  let path = `M 0 ${yFor(data[0])}`
  for (let i = 1; i < data.length; i++) {
    if (smooth) {
      const x0 = (i - 1) * stepX, x1 = i * stepX
      const cx = (x0 + x1) / 2
      path += ` Q ${cx} ${yFor(data[i - 1])} ${cx} ${(yFor(data[i - 1]) + yFor(data[i])) / 2}`
      path += ` Q ${cx} ${yFor(data[i])} ${x1} ${yFor(data[i])}`
    } else {
      path += ` L ${i * stepX} ${yFor(data[i])}`
    }
  }
  const areaPath = path + ` L ${width} ${height} L 0 ${height} Z`
  const id = `spark-${c.replace(/\W/g, '')}`
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="0.35" />
              <stop offset="100%" stopColor={c} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${id})`} />
        </>
      )}
      <path d={path} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width} cy={yFor(data[data.length - 1])} r="3" fill={c} />
    </svg>
  )
}

/* ---------- bars ---------- */

export function Bars({ data, width = 320, height = 120, labels, color }: {
  data: number[]; width?: number; height?: number; labels?: string[]; color?: string
}) {
  const max = Math.max(...data, 1)
  const w = width / data.length
  const c = color || 'var(--accent)'
  return (
    <svg width="100%" height={height + 18} viewBox={`0 0 ${width} ${height + 18}`} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = (v / max) * height
        return <rect key={i} x={i * w + 2} y={height - h} width={w - 4} height={h} rx="2" fill={c} opacity={0.4 + 0.6 * (v / max)} />
      })}
      {labels && labels.map((l, i) => (
        <text key={i} x={i * w + w / 2} y={height + 12} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="var(--font)">{l}</text>
      ))}
    </svg>
  )
}

/* ---------- collaboration network ---------- */

export type NetworkData = {
  nodes: { id: string; name: string; x: number; y: number; repos: number; accent?: boolean }[]
  edges: [string, string, number][]
}

export function Network({ data, width = 460, height = 320 }: { data: NetworkData; width?: number; height?: number }) {
  const nodeAt = (id: string) => data.nodes.find((n) => n.id === id)
  // round coordinates: node positions come from Math.cos/sin, which aren't
  // bit-identical between the SSR (Node) and hydration (browser) engines.
  const rnd = (v: number) => Math.round(v)
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="nodeGlow">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      {data.edges.map(([a, b, w], i) => {
        const A = nodeAt(a), B = nodeAt(b)
        if (!A || !B) return null
        return <line key={i} x1={rnd(A.x * width)} y1={rnd(A.y * height)} x2={rnd(B.x * width)} y2={rnd(B.y * height)} stroke="var(--border-strong)" strokeWidth={Math.max(0.5, w * 0.4)} opacity={0.5 + w * 0.06} />
      })}
      {data.nodes.map((n) => {
        const r = 6 + Math.min(28, n.repos * 0.7)
        const cx = rnd(n.x * width), cy = rnd(n.y * height)
        const fill = n.accent ? 'var(--accent)' : 'var(--surface-2)'
        const stroke = n.accent ? 'var(--accent)' : 'var(--border-strong)'
        return (
          <g key={n.id}>
            {n.accent && <circle cx={cx} cy={cy} r={r + 18} fill="url(#nodeGlow)" />}
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth="1.5" />
            <text x={cx} y={rnd(cy + r + 12)} textAnchor="middle" fontSize="11" fill="var(--text-2)" fontFamily="var(--font)">{n.name}</text>
            {n.accent && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="var(--font)">me</text>}
          </g>
        )
      })}
    </svg>
  )
}

/* ---------- activity timeline ---------- */

export type ActivityItem = {
  type: string; repo: string; when: string; msg: string
  branch?: string; sha?: string; tag?: string; status?: string
}

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const dotFor = (t: string): { color: string; icon: IconName } => {
    const map: Record<string, { color: string; icon: IconName }> = {
      push: { color: 'var(--accent)', icon: 'Code' },
      pr: { color: 'var(--ai)', icon: 'Fork' },
      star: { color: 'var(--warn)', icon: 'Star' },
      release: { color: 'var(--success)', icon: 'Bolt' },
      issue: { color: 'var(--info)', icon: 'Compass' },
      review: { color: 'var(--success)', icon: 'Check' },
      fork: { color: 'var(--text-2)', icon: 'Fork' },
    }
    return map[t] || map.push
  }
  return (
    <div style={{ position: 'relative', paddingLeft: 24 }}>
      <div style={{ position: 'absolute', left: 9, top: 4, bottom: 4, width: 1, background: 'var(--border)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it, i) => {
          const D = dotFor(it.type)
          const Ico = Icon[D.icon]
          return (
            <div key={i} style={{ position: 'relative', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                position: 'absolute', left: -24, top: 0, width: 20, height: 20, background: 'var(--bg)',
                border: `1.5px solid ${D.color}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.color,
              }}>
                <Ico size={11} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  <span className="mono" style={{ color: 'var(--text)', fontWeight: 600 }}>{it.repo}</span>
                  <span style={{ marginLeft: 6, marginRight: 6 }}>·</span>
                  <span>{it.when} ago</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>{it.msg}</div>
                {(it.branch || it.tag || it.status) && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {it.branch && <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)' }}>{it.branch} · {it.sha}</span>}
                    {it.tag && <Chip color="var(--success)" dot>{it.tag}</Chip>}
                    {it.status && <Chip color={it.status === 'merged' ? 'var(--ai)' : it.status === 'open' ? 'var(--success)' : 'var(--accent)'} dot>{it.status}</Chip>}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
