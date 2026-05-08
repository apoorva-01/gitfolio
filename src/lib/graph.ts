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
  const edgeCountPerNode = new Map<string, number>()
  const MAX_EDGES_PER_NODE = 20

  const addEdge = (edge: GraphEdge): boolean => {
    const sourceCount = edgeCountPerNode.get(edge.source) || 0
    const targetCount = edgeCountPerNode.get(edge.target) || 0
    if (sourceCount >= MAX_EDGES_PER_NODE || targetCount >= MAX_EDGES_PER_NODE) {
      return false
    }
    edges.push(edge)
    edgeCountPerNode.set(edge.source, sourceCount + 1)
    edgeCountPerNode.set(edge.target, targetCount + 1)
    return true
  }

  const parentToFork = new Map<string, { repo: typeof repos[0], githubId: string }[]>()
  for (const repo of repos) {
    if (repo.parentFullName) {
      const existing = parentToFork.get(repo.parentFullName) || []
      existing.push({ repo, githubId: repo.githubId.toString() })
      parentToFork.set(repo.parentFullName, existing)
    }
  }

  for (const repo of repos) {
    const forks = parentToFork.get(repo.fullName)
    if (forks) {
      for (const fork of forks) {
        addEdge({
          id: `fork-${repo.githubId}-${fork.githubId}`,
          source: repo.githubId.toString(),
          target: fork.githubId.toString(),
          type: 'fork-of',
          weight: 5
        })
      }
    }
  }

  const depsToRepos = new Map<string, string[]>()
  for (const repo of repos) {
    const deps = Object.keys((repo.dependencies as Record<string, string>) || {})
    if (deps.length >= 2) {
      const key = deps.slice().sort().join('|')
      const existing = depsToRepos.get(key) || []
      existing.push(repo.githubId.toString())
      depsToRepos.set(key, existing)
    }
  }

  for (const [key, repoIds] of depsToRepos) {
    if (repoIds.length >= 2) {
      const weight = key.split('|').length
      for (let i = 0; i < repoIds.length && (edgeCountPerNode.get(repoIds[i]) || 0) < MAX_EDGES_PER_NODE; i++) {
        for (let j = i + 1; j < repoIds.length && (edgeCountPerNode.get(repoIds[j]) || 0) < MAX_EDGES_PER_NODE; j++) {
          if (!addEdge({
            id: `dep-${repoIds[i]}-${repoIds[j]}`,
            source: repoIds[i],
            target: repoIds[j],
            type: 'shared-dependency',
            weight
          })) break
        }
      }
    }
  }

  const langToRepos = new Map<string, { id: string, health: number }[]>()
  for (const repo of repos) {
    if (repo.language && repo.healthScore > 30) {
      const existing = langToRepos.get(repo.language) || []
      existing.push({ id: repo.githubId.toString(), health: repo.healthScore })
      langToRepos.set(repo.language, existing)
    }
  }

  for (const [, repoList] of langToRepos) {
    const sorted = repoList.sort((a, b) => b.health - a.health).slice(0, 50)
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (!addEdge({
          id: `lang-${sorted[i].id}-${sorted[j].id}`,
          source: sorted[i].id,
          target: sorted[j].id,
          type: 'same-language',
          weight: 1
        })) break
      }
    }
  }

  return { nodes, edges }
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
