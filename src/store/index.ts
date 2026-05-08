import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Repository {
  id: string
  githubId: number
  name: string
  fullName: string
  description: string | null
  language: string | null
  languages: Record<string, number>
  isPrivate: boolean
  isFork: boolean
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  topics: string[]
  hasReadme: boolean
  hasLicense: boolean
  healthScore: number
  lastCommitAt: string | null
  pushedAt: string | null
}

export interface GraphNode {
  id: string
  label: string
  language: string
  health: number
  stars: number
  isPrivate: boolean
  isFork: boolean
  lastActive: string | null
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

export interface RepoAnalysis {
  id: string
  repositoryId: string
  summary: string
  strengths: string[]
  issues: any[]
  readmeSuggestion?: string
  suggestedTopics: string[]
  suggestedDescription?: string
  recruiterImpact: string
  estimatedImprovementScore: number
  analyzedAt: string
}

export interface ProfileAnalysis {
  id: string
  userId: string
  overallScore: number
  developerArchetype: string
  topStrengths: string[]
  criticalGaps: string[]
  profileBioSuggestion: string
  pinnedRepoRecommendations: string[]
  skillMap: {
    primaryLanguages: string[]
    frameworks: string[]
    domains: string[]
  }
  careerNarrative: string
  topImprovements: {
    priority: number
    action: string
    impact: string
    effort: 'low' | 'medium' | 'high'
  }[]
  recruiterReadinessScore: number
  analyzedAt: string
}

interface RepoFilters {
  visibility: 'all' | 'public' | 'private'
  language: string
  sortBy: 'stars' | 'updated' | 'health' | 'name'
  minHealth: number
  search: string
}

interface GraphFilters {
  showPrivate: boolean
  showForks: boolean
  languages: string[]
  edgeTypes: ('shared-dependency' | 'same-language' | 'fork-of')[]
  minHealth: number
}

interface UseRepoStore {
  repos: Repository[]
  filteredRepos: Repository[]
  filters: RepoFilters
  isLoading: boolean
  lastSynced: string | null
  setRepos: (repos: Repository[]) => void
  setFilter: (key: keyof RepoFilters, value: any) => void
  resetFilters: () => void
  setLoading: (loading: boolean) => void
  setLastSynced: (date: string | null) => void
}

interface UseGraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  graphFilters: GraphFilters
  setGraph: (data: { nodes: GraphNode[]; edges: GraphEdge[] }) => void
  selectNode: (id: string | null) => void
  setGraphFilter: (key: keyof GraphFilters, value: any) => void
}

interface UseAnalysisStore {
  profileAnalysis: ProfileAnalysis | null
  repoAnalyses: Record<string, RepoAnalysis>
  isAnalyzing: boolean
  setProfileAnalysis: (analysis: ProfileAnalysis | null) => void
  setRepoAnalysis: (repoId: string, analysis: RepoAnalysis) => void
  setIsAnalyzing: (analyzing: boolean) => void
}

interface UseUIStore {
  sidebarCollapsed: boolean
  onboardingComplete: boolean
  toggleSidebar: () => void
  setOnboardingComplete: (complete: boolean) => void
}

const defaultFilters: RepoFilters = {
  visibility: 'all',
  language: '',
  sortBy: 'updated',
  minHealth: 0,
  search: '',
}

const defaultGraphFilters: GraphFilters = {
  showPrivate: true,
  showForks: true,
  languages: [],
  edgeTypes: ['shared-dependency', 'same-language', 'fork-of'],
  minHealth: 0,
}

const filterRepos = (repos: Repository[], filters: RepoFilters): Repository[] => {
  let filtered = [...repos]
  if (filters.visibility !== 'all') {
    filtered = filtered.filter(r => r.isPrivate === (filters.visibility === 'private'))
  }
  if (filters.language) {
    filtered = filtered.filter(r => r.language === filters.language)
  }
  if (filters.minHealth > 0) {
    filtered = filtered.filter(r => r.healthScore >= filters.minHealth)
  }
  if (filters.search) {
    const q = filters.search.toLowerCase()
    filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
  }
  if (filters.sortBy === 'stars') {
    filtered.sort((a, b) => b.stargazersCount - a.stargazersCount)
  } else if (filters.sortBy === 'health') {
    filtered.sort((a, b) => b.healthScore - a.healthScore)
  } else if (filters.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }
  return filtered
}

export const useRepoStore = create<UseRepoStore>()((set => ({
  repos: [],
  filteredRepos: [],
  filters: defaultFilters,
  isLoading: false,
  lastSynced: null,
  setRepos: (repos) => set(state => {
    const filteredRepos = filterRepos(repos, state.filters)
    return { repos, filteredRepos }
  }),
  setFilter: (key, value) => set(state => {
    const filters = { ...state.filters, [key]: value }
    const filteredRepos = filterRepos(state.repos, filters)
    return { filters, filteredRepos }
  }),
  resetFilters: () => set(state => ({
    filters: defaultFilters,
    filteredRepos: filterRepos(state.repos, defaultFilters)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setLastSynced: (lastSynced) => set({ lastSynced }),
})))

export const useGraphStore = create<UseGraphStore>()((set => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  graphFilters: defaultGraphFilters,
  setGraph: (data) => set(data),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  setGraphFilter: (key, value) => set(state => ({
    graphFilters: { ...state.graphFilters, [key]: value }
  })),
})))

export const useAnalysisStore = create<UseAnalysisStore>()((set => ({
  profileAnalysis: null,
  repoAnalyses: {},
  isAnalyzing: false,
  setProfileAnalysis: (profileAnalysis) => set({ profileAnalysis }),
  setRepoAnalysis: (repoId, analysis) => set(state => ({
    repoAnalyses: { ...state.repoAnalyses, [repoId]: analysis }
  })),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
})))

export const useUIStore = create<UseUIStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      onboardingComplete: false,
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
    }),
    { name: 'ui-store' }
  )
)
