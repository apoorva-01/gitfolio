'use client'

import { useState, useEffect, useMemo } from 'react'
import { useGraphData, useRebuildGraph } from '@/hooks/useGraph'
import { useRepositories } from '@/hooks/useRepositories'
import { Button } from '@/components/ui/Button'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
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
import { RefreshCw, Lock, GitFork } from 'lucide-react'

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
  Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584', Java: '#b07219',
  'C#': '#178600', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
  Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
}

const DEFAULT_NODE_COLOR = '#8b949e'

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

function CustomNode({ data }: { data: GraphNodeType }) {
  const color = LANGUAGE_COLORS[data.language] || DEFAULT_NODE_COLOR
  const healthColor = data.health >= 70 ? '#10b981' : data.health >= 40 ? '#f59e0b' : '#ef4444'
  
  return (
    <div
      className="px-3 py-2 rounded-lg border bg-gray-900/90 backdrop-blur min-w-[120px]"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-white truncate max-w-[100px]">{data.label}</span>
        {data.isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
        {data.isFork && <GitFork className="w-3 h-3 text-gray-500" />}
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-gray-400">{data.language}</span>
        <span className="text-xs" style={{ color: healthColor }}>{Math.round(data.health)}</span>
      </div>
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

export default function GraphPage() {
  const { data: graphData } = useGraphData() as { data: GraphDataType | undefined }
  const { mutate: rebuildGraph, isPending: isRebuilding } = useRebuildGraph()
  const { repos } = useRepositories()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [showPrivate, setShowPrivate] = useState(true)
  const [showForks, setShowForks] = useState(true)
  const [minHealth, setMinHealth] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!graphData?.nodes) return

    const filteredNodes = graphData.nodes.filter((n: GraphNodeType) => {
      if (!showPrivate && n.isPrivate) return false
      if (!showForks && n.isFork) return false
      if (n.health < minHealth) return false
      return true
    })

    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]))

    const flowNodes: Node[] = filteredNodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / filteredNodes.length
      const radius = Math.min(300, filteredNodes.length * 3)
      return {
        id: n.id,
        type: 'custom',
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle),
        },
        data: n,
      }
    })

    const flowEdges: Edge[] = graphData.edges
      .filter(e => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e: GraphEdgeType) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'smoothstep',
        style: {
          stroke: e.type === 'fork-of' ? '#f59e0b' : e.type === 'shared-dependency' ? '#3b82f6' : '#6b7280',
          strokeWidth: Math.min(e.weight, 3),
          strokeDasharray: e.type === 'same-language' ? '5 5' : undefined,
        },
        markerEnd: e.type === 'fork-of' ? {
          type: MarkerType.ArrowClosed,
          color: '#f59e0b',
        } : undefined,
      }))

    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, showPrivate, showForks, minHealth])

  const stats = useMemo(() => {
    if (!graphData?.nodes) return null
    const uniqueLangs = [...new Set(graphData.nodes.map(n => n.language))]
    const avgHealth = graphData.nodes.length > 0 
      ? graphData.nodes.reduce((a, n) => a + n.health, 0) / graphData.nodes.length 
      : 0
    return {
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
      languageCount: uniqueLangs.length,
      avgHealth,
    }
  }, [graphData])

  if (!mounted) return <div className="h-[80vh] bg-gray-900 rounded-lg animate-pulse" />

  return (
    <ErrorBoundary>
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Code Universe</h1>
            {stats && (
              <p className="text-sm text-gray-400">
                {stats.totalNodes} nodes · {stats.totalEdges} edges · {stats.languageCount} languages · avg health {stats.avgHealth.toFixed(0)}
              </p>
            )}
          </div>
          <Button onClick={() => rebuildGraph()} disabled={isRebuilding}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isRebuilding && 'animate-spin')} />
            {isRebuilding ? 'Building...' : 'Rebuild Graph'}
          </Button>
        </div>

        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={showPrivate} onChange={e => setShowPrivate(e.target.checked)} />
            Show Private
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input type="checkbox" checked={showForks} onChange={e => setShowForks(e.target.checked)} />
            Show Forks
          </label>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Min Health:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minHealth}
              onChange={e => setMinHealth(parseInt(e.target.value))}
              className="w-24"
            />
            <span>{minHealth}</span>
          </div>
        </div>

        <div className="flex-1 rounded-lg border border-gray-800 overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
          >
            <Background color="#1f2937" gap={20} />
            <Controls />
            {nodes.length > 50 && <MiniMap nodeColor={n => LANGUAGE_COLORS[n.data?.language] || DEFAULT_NODE_COLOR} />}
          </ReactFlow>
        </div>

        {stats && (
          <div className="absolute bottom-4 right-4 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Repos</p>
                <p className="text-lg font-bold text-white">{repos.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Languages</p>
                <p className="text-lg font-bold text-white">{stats.languageCount}</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Health</p>
                <p className="text-lg font-bold text-white">{stats.avgHealth.toFixed(0)}</p>
              </div>
              <div>
                <p className="text-gray-500">Connections</p>
                <p className="text-lg font-bold text-white">{stats.totalEdges}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}