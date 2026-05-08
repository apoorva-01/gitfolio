import Anthropic from '@anthropic-ai/sdk'
import { Repository } from '@prisma/client'
import { prisma } from './db'

const anthropic = new Anthropic()

const REPO_EXPECTED_KEYS = ['summary', 'strengths', 'issues', 'readmeSuggestion', 'suggestedTopics', 'suggestedDescription', 'recruiterImpact', 'estimatedImprovementScore']
const PROFILE_EXPECTED_KEYS = ['overallScore', 'developerArchetype', 'topStrengths', 'criticalGaps', 'profileBioSuggestion', 'pinnedRepoRecommendations', 'skillMap', 'careerNarrative', 'topImprovements', 'recruiterReadinessScore']

function extractJSON(text: string, expectedKeys: string[]): object | null {
  const findMatchingBracket = (startIndex: number): number | null => {
    let depth = 0
    let inString = false
    let escapeNext = false

    for (let i = startIndex; i < text.length; i++) {
      const char = text[i]

      if (escapeNext) {
        escapeNext = false
        continue
      }

      if (char === '\\') {
        escapeNext = true
        continue
      }

      if (char === '"') {
        inString = !inString
        continue
      }

      if (inString) continue

      if (char === '{') depth++
      else if (char === '}') {
        depth--
        if (depth === 0) return i
      }
    }
    return null
  }

  const firstBrace = text.indexOf('{')
  if (firstBrace === -1) return null

  const endBrace = findMatchingBracket(firstBrace)
  if (endBrace === null) return null

  const jsonStr = text.slice(firstBrace, endBrace + 1)

  try {
    const parsed = JSON.parse(jsonStr)
    const hasKeys = expectedKeys.some(key => key in parsed)
    if (!hasKeys) return null
    return parsed
  } catch {
    const fallbackMatch = text.match(/\{[\s\S]*\}/)
    if (fallbackMatch) {
      try {
        const parsed = JSON.parse(fallbackMatch[0])
        const hasKeys = expectedKeys.some(key => key in parsed)
        if (!hasKeys) return null
        return parsed
      } catch {
        return null
      }
    }
    return null
  }
}

interface RepoAnalysisResult {
  summary: string
  strengths: string[]
  issues: {
    severity: 'critical' | 'warning' | 'suggestion'
    category: 'documentation' | 'metadata' | 'maintenance' | 'quality'
    issue: string
    fix: string
  }[]
  readmeSuggestion?: string
  suggestedTopics: string[]
  suggestedDescription?: string
  recruiterImpact: 'low' | 'medium' | 'high'
  estimatedImprovementScore: number
}

export async function analyzeRepository(repo: Repository): Promise<RepoAnalysisResult> {
  const languages = (repo.languages as Record<string, number>) || {}
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0)
  const langPercentages = Object.entries(languages).map(([lang, bytes]) => ({
    lang,
    percent: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
  }))

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: "You are a senior developer and open source expert. Analyze GitHub repositories and give specific, actionable, and honest feedback. Always respond in valid JSON only.",
    messages: [{
      role: 'user',
      content: `Analyze this GitHub repository:

Name: ${repo.name}
Description: ${repo.description || 'None'}
Primary Language: ${repo.language || 'None'}
Languages: ${JSON.stringify(langPercentages)}
Stars: ${repo.stargazersCount}
Forks: ${repo.forksCount}
Open Issues: ${repo.openIssuesCount}
Has README: ${repo.hasReadme}
README Content: ${repo.readme?.substring(0, 500) || 'None'}
Has License: ${repo.hasLicense} (${repo.licenseType || 'none'})
Topics: ${repo.topics?.join(', ') || 'None'}
Last Commit: ${repo.lastCommitAt?.toISOString() || 'Unknown'}
Dependencies: ${JSON.stringify(Object.keys((repo.dependencies as Record<string, string>) || {}).slice(0, 10))}
Health Score: ${repo.healthScore}/100

Return JSON with this exact shape:
{
  "summary": "2-sentence summary",
  "strengths": ["strength1", "strength2"],
  "issues": [{ "severity": "critical|warning|suggestion", "category": "documentation|metadata|maintenance|quality", "issue": "description", "fix": "actionable fix" }],
  "readmeSuggestion": "Full improved README markdown (only if current README is missing or poor)",
  "suggestedTopics": ["tag1", "tag2", "tag3"],
  "suggestedDescription": "Better one-line description",
  "recruiterImpact": "low|medium|high",
  "estimatedImprovementScore": 0-100
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = extractJSON(text, REPO_EXPECTED_KEYS)
  if (!parsed) throw new Error('Invalid AI response: no valid JSON found')

  return parsed as RepoAnalysisResult
}

interface ProfileAnalysisResult {
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
}

export async function analyzeProfile(userId: string): Promise<ProfileAnalysisResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { repositories: true },
  })
  if (!user) throw new Error('User not found')

  const repos = user.repositories
  const langCounts: Record<string, number> = {}
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
  const totalRepos = repos.length
  const avgHealth = repos.length > 0 ? repos.reduce((a, r) => a + r.healthScore, 0) / repos.length : 0
  const noReadme = repos.filter(r => !r.hasReadme).length
  const noDesc = repos.filter(r => !r.description).length
  const noLicense = repos.filter(r => !r.hasLicense).length
  const noTopics = repos.filter(r => !r.topics || r.topics.length === 0).length
  const topByStars = [...repos].sort((a, b) => b.stargazersCount - a.stargazersCount).slice(0, 5).map(r => r.name)
  const topByHealth = [...repos].sort((a, b) => b.healthScore - a.healthScore).slice(0, 5).map(r => r.name)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: "You are a senior developer career advisor and GitHub profile expert. Analyze the developer's entire GitHub presence and provide strategic advice. Respond in valid JSON only.",
    messages: [{
      role: 'user',
      content: `Analyze this developer's GitHub profile:

Username: ${user.githubLogin}
Total Repos: ${totalRepos}
Public: ${repos.filter(r => !r.isPrivate).length}
Private: ${repos.filter(r => r.isPrivate).length}
Language Distribution: ${JSON.stringify(langCounts)}
Average Health Score: ${avgHealth.toFixed(1)}/100
Repos with no README: ${noReadme}
Repos with no description: ${noDesc}
Repos with no license: ${noLicense}
Repos with no topics: ${noTopics}
Top Repos by Stars: ${topByStars.join(', ')}
Top Repos by Health: ${topByHealth.join(', ')}
Account Created: ${user.createdAt.toISOString()}

Return JSON:
{
  "overallScore": 0-100,
  "developerArchetype": "e.g. Full-Stack Builder",
  "topStrengths": ["strength1", "strength2"],
  "criticalGaps": ["gap1", "gap2"],
  "profileBioSuggestion": "A 2-sentence professional bio",
  "pinnedRepoRecommendations": ["repoName1", "repoName2", "repoName3"],
  "skillMap": { "primaryLanguages": [], "frameworks": [], "domains": [] },
  "careerNarrative": "3-4 sentence story about this developer",
  "topImprovements": [{ "priority": 1, "action": "string", "impact": "string", "effort": "low|medium|high" }],
  "recruiterReadinessScore": 0-100
}`
    }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = extractJSON(text, PROFILE_EXPECTED_KEYS)
  if (!parsed) throw new Error('Invalid AI response: no valid JSON found')

  return parsed as ProfileAnalysisResult
}

export async function generateReadme(repoId: string): Promise<string> {
  const repo = await prisma.repository.findUnique({ where: { id: repoId } })
  if (!repo) throw new Error('Repo not found')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: "You are a senior developer and open source expert. Generate professional README.md files for GitHub repositories.",
    messages: [{
      role: 'user',
      content: `Generate a professional README.md for this repository:

Name: ${repo.name}
Description: ${repo.description || 'None'}
Language: ${repo.language || 'Unknown'}
Topics: ${repo.topics?.join(', ') || 'None'}
Stars: ${repo.stargazersCount}
Forks: ${repo.forksCount}
Has License: ${repo.hasLicense}

Create a complete, professional README with: Project title, badges, description, features, installation, usage, contributing, license sections. Return ONLY the markdown content.`
    }]
  })

  return message.content[0].type === 'text' ? message.content[0].text : ''
}
