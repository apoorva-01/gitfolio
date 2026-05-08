import { prisma } from './db'

export interface GraphNode {
  id: string
  label: string
  language: string
  health: number
  stars: number
  isPrivate: boolean
  isFork: boolean
  lastActive: Date | null
  size: number
  group: string
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: 'shared-dependency' | 'same-language' | 'fork-of'
  weight: number
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
}

const DEFAULT_COLOR = '#8b949e'

export async function buildGraphData(userId: string): Promise<GraphData> {
  const repos = await prisma.repository.findMany({ where: { userId } })
  
  const nodes: GraphNode[] = repos.map(repo => {
    const size = Math.min(80, 20 + (repo.stargazersCount * 0.5) + (repo.healthScore * 0.3))
    return {
      id: repo.githubId.toString(),
      label: repo.name,
      language: repo.language || 'Unknown',
      health: repo.healthScore,
      stars: repo.stargazersCount,
      isPrivate: repo.isPrivate,
      isFork: repo.isFork,
      lastActive: repo.lastCommitAt,
      size,
      group: repo.language || 'Other',
    }
  })

  const edges: GraphEdge[] = []
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (let i = 0; i < repos.length; i++) {
    for (let j = i + 1; j < repos.length; j++) {
      const r1 = repos[i]
      const r2 = repos[j]

      if (r1.parentFullName && r1.parentFullName === r2.fullName) {
        edges.push({ id: `fork-${r2.githubId}-${r1.githubId}`, source: r2.githubId.toString(), target: r1.githubId.toString(), type: 'fork-of', weight: 5 })
      } else if (r2.parentFullName && r2.parentFullName === r1.fullName) {
        edges.push({ id: `fork-${r1.githubId}-${r2.githubId}`, source: r1.githubId.toString(), target: r2.githubId.toString(), type: 'fork-of', weight: 5 })
      } else {
        const deps1 = new Set(Object.keys((r1.dependencies as Record<string, string>) || {}))
        const deps2 = new Set(Object.keys((r2.dependencies as Record<string, string>) || {}))
        const sharedDeps = [...deps1].filter(d => deps2.has(d))
        if (sharedDeps.length >= 2) {
          edges.push({ id: `dep-${r1.githubId}-${r2.githubId}`, source: r1.githubId.toString(), target: r2.githubId.toString(), type: 'shared-dependency', weight: sharedDeps.length })
        } else if (r1.language === r2.language && r1.healthScore > 30 && r2.healthScore > 30) {
          edges.push({ id: `lang-${r1.githubId}-${r2.githubId}`, source: r1.githubId.toString(), target: r2.githubId.toString(), type: 'same-language', weight: 1 })
        }
      }
    }
  }

  return { nodes, edges }
}

export async function getGraphStats(userId: string) {
  const { nodes, edges } = await buildGraphData(userId)
  const groups = [...new Set(nodes.map(n => n.group))]
  const avgHealth = nodes.length > 0 ? nodes.reduce((a, n) => a + n.health, 0) / nodes.length : 0
  const mostConnected = edges.reduce((acc, e) => {
    acc[e.source] = (acc[e.source] || 0) + 1
    acc[e.target] = (acc[e.target] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topNode = Object.entries(mostConnected).sort((a, b) => b[1] - a[1])[0]
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    languageClusters: groups.length,
    avgHealth,
    mostConnectedRepo: topNode ? nodeMap.get(topNode[0])?.label : null,
  }
}

export async function saveGraphSnapshot(userId: string, graphData: GraphData) {
  return prisma.graphSnapshot.create({
    data: {
      userId,
      nodes: graphData.nodes as any,
      edges: graphData.edges as any,
    },
  })
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] || DEFAULT_COLOR
}
