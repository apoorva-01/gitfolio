'use client'

import { useState, useEffect, useMemo } from 'react'
import { useGraphData, useRebuildGraph } from '@/hooks/useGraph'
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, LangDot } from '@/components/gf/primitives'
import { toast } from '@/components/ui/Toast'

interface GraphNodeType {
  id: string
  label: string
  language: string
  health: number
  stars: number
  isPrivate: boolean
  isFork: boolean
}

interface GraphEdgeType {
  id: string
  source: string
  target: string
  type: 'shared-dependency' | 'same-language' | 'fork-of'
  weight: number
}

interface GraphDataType {
  nodes: GraphNodeType[]
  edges: GraphEdgeType[]
}

const EDGE_COLORS = {
  'fork-of': '#f59e0b',
  'shared-dependency': '#a78bfa',
  'same-language': '#8b949e',
} as const

function GraphNode({ data }: { data: GraphNodeType }) {
  const healthColor = data.health >= 70 ? 'var(--success)' : data.health >= 40 ? 'var(--warn)' : 'var(--danger)'
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 10, minWidth: 132,
      background: 'color-mix(in oklab, var(--surface) 92%, transparent)',
      border: `1px solid ${data.isFork ? 'color-mix(in oklab, var(--warn) 40%, var(--border))' : 'var(--border)'}`,
      backdropFilter: 'blur(6px)', boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.label}</span>
        {data.isFork && <Icon.Fork size={11} style={{ color: 'var(--text-3)' }} />}
        {data.isPrivate && <Icon.Eye size={11} style={{ color: 'var(--text-3)' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
        <LangDot lang={data.language} />
        <span style={{ color: 'var(--text-2)' }}>{data.language}</span>
        <span style={{ marginLeft: 'auto', color: healthColor, fontWeight: 600 }}>{Math.round(data.health)}</span>
      </div>
    </div>
  )
}

const nodeTypes = { custom: GraphNode }

function FilterToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-2)', cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
      {label}
    </label>
  )
}

function EdgeLegend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
      <span style={{ width: 16, height: 0, borderTop: `2px ${dashed ? 'dashed' : 'solid'} ${color}` }} />
      {label}
    </span>
  )
}

export default function GraphPage() {
  const { data: graphData, isLoading } = useGraphData() as { data: GraphDataType | undefined; isLoading: boolean }
  const { mutate: rebuildGraph, isPending: isRebuilding } = useRebuildGraph()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showPrivate, setShowPrivate] = useState(true)
  const [showForks, setShowForks] = useState(true)
  const [minHealth, setMinHealth] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!graphData?.nodes) return

    const filteredNodes = graphData.nodes.filter((n) => {
      if (!showPrivate && n.isPrivate) return false
      if (!showForks && n.isFork) return false
      if (n.health < minHealth) return false
      return true
    })

    const nodeIds = new Set(filteredNodes.map((n) => n.id))

    const flowNodes: Node[] = filteredNodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / filteredNodes.length
      const radius = Math.min(360, 120 + filteredNodes.length * 4)
      return {
        id: n.id,
        type: 'custom',
        position: { x: 400 + radius * Math.cos(angle), y: 320 + radius * Math.sin(angle) },
        data: n,
      }
    })

    const flowEdges: Edge[] = graphData.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        style: {
          stroke: EDGE_COLORS[e.type],
          strokeWidth: Math.min(e.weight, 3),
          strokeDasharray: e.type === 'same-language' ? '5 5' : undefined,
          opacity: 0.55,
        },
        markerEnd: e.type === 'fork-of' ? { type: MarkerType.ArrowClosed, color: EDGE_COLORS['fork-of'] } : undefined,
      }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, showPrivate, showForks, minHealth, setNodes, setEdges])

  const stats = useMemo(() => {
    if (!graphData?.nodes?.length) return null
    const uniqueLangs = new Set(graphData.nodes.map((n) => n.language))
    const avgHealth = graphData.nodes.reduce((a, n) => a + n.health, 0) / graphData.nodes.length
    return {
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
      languageCount: uniqueLangs.size,
      avgHealth,
    }
  }, [graphData])

  const rebuild = () => {
    if (isRebuilding) return
    rebuildGraph(undefined, {
      onSuccess: () => toast.success('Graph rebuilt'),
      onError: () => toast.error('Could not rebuild graph'),
    })
  }

  const topNav = (
    <TopNav
      title="Code universe"
      subtitle={stats ? `${stats.totalNodes} repos · ${stats.totalEdges} connections · ${stats.languageCount} languages` : 'How your repositories connect'}
      actions={<Button variant="ai" size="sm" icon={<Icon.Bolt size={13} />} disabled={isRebuilding} onClick={rebuild}>{isRebuilding ? 'Building…' : 'Rebuild graph'}</Button>}
    />
  )

  const empty = !isLoading && graphData && graphData.nodes.length === 0

  return (
    <PageShell topNav={topNav}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* filters + legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <FilterToggle label="Private" checked={showPrivate} onChange={setShowPrivate} />
          <FilterToggle label="Forks" checked={showForks} onChange={setShowForks} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-2)' }}>
            <span>Min health</span>
            <input type="range" min={0} max={100} value={minHealth} onChange={(e) => setMinHealth(parseInt(e.target.value))} style={{ accentColor: 'var(--accent)', width: 110 }} />
            <span className="mono" style={{ color: 'var(--text)', width: 24 }}>{minHealth}</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginLeft: 'auto' }}>
            <EdgeLegend color={EDGE_COLORS['shared-dependency']} label="Shared deps" />
            <EdgeLegend color={EDGE_COLORS['fork-of']} label="Fork of" />
            <EdgeLegend color={EDGE_COLORS['same-language']} label="Same language" dashed />
          </div>
        </div>

        {/* canvas */}
        <Card padding={0} style={{ overflow: 'hidden', height: 'calc(100vh - 240px)', minHeight: 460 }}>
          {!mounted || isLoading ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>Loading your graph…</div>
          ) : empty ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-3)' }}>
              <Icon.Compass size={28} style={{ color: 'var(--text-3)' }} />
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>No repositories synced yet.</div>
              <Button variant="secondary" size="sm" href="/dashboard">Go sync your repos</Button>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              proOptions={{ hideAttribution: true }}
            >
              <Background color="var(--border)" gap={22} />
              <Controls showInteractive={false} />
              {nodes.length > 40 && <MiniMap nodeColor={() => 'var(--accent)'} maskColor="rgba(0,0,0,0.6)" style={{ background: 'var(--surface)' }} />}
            </ReactFlow>
          )}
        </Card>

        {stats && (
          <div className="gf-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Repos', value: String(stats.totalNodes) },
              { label: 'Connections', value: String(stats.totalEdges) },
              { label: 'Languages', value: String(stats.languageCount) },
              { label: 'Avg health', value: `${stats.avgHealth.toFixed(0)}%` },
            ].map((s) => (
              <Card key={s.label} padding={16}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: 'var(--text)' }}>{s.value}</div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
