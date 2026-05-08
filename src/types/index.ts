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
  watchersCount: number
  openIssuesCount: number
  topics: string[]
  hasReadme: boolean
  hasLicense: boolean
  licenseType: string | null
  lastCommitAt: Date | null
  createdAt: Date
  pushedAt: Date | null
  defaultBranch: string | null
  healthScore: number
  dependencies: Record<string, string> | null
  readme: string | null
}

export interface RepoAnalysis {
  id: string
  repositoryId: string
  summary: string
  strengths: string[]
  issues: AnalysisIssue[]
  readmeSuggestion?: string
  suggestedTopics: string[]
  suggestedDescription?: string
  recruiterImpact: 'low' | 'medium' | 'high'
  estimatedImprovementScore: number
  analyzedAt: Date
}

export interface AnalysisIssue {
  severity: 'critical' | 'warning' | 'suggestion'
  category: 'documentation' | 'metadata' | 'maintenance' | 'quality'
  issue: string
  fix: string
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
  skillMap: SkillMap
  careerNarrative: string
  topImprovements: Improvement[]
  recruiterReadinessScore: number
  analyzedAt: Date
}

export interface SkillMap {
  primaryLanguages: string[]
  frameworks: string[]
  domains: string[]
}

export interface Improvement {
  priority: number
  action: string
  impact: string
  effort: 'low' | 'medium' | 'high'
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

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

export interface SyncStatus {
  lastSynced: Date | null
  repoCount: number
  isComplete: boolean
}
