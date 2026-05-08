'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useRepository } from '@/hooks/useRepositories'
import { useRepoAnalysis, useAnalyzeRepo } from '@/hooks/useAnalysis'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { AnalysisSkeleton } from '@/components/ui/skeletons'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { formatRelativeTime } from '@/lib/utils'
import { getLanguageColor } from '@/lib/languages'
import { Star, GitFork, Eye, ExternalLink, Lock, GitFork as ForkIcon, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

type Tab = 'analysis' | 'readme' | 'dependencies' | 'raw'

export default function RepoDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: repo, isLoading } = useRepository(id)
  const { data: existingAnalysis } = useRepoAnalysis(id)
  const { mutate: analyze, isPending: isAnalyzing } = useAnalyzeRepo()
  const [activeTab, setActiveTab] = useState<Tab>('analysis')
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null)

  if (isLoading) return <AnalysisSkeleton />

  if (!repo) return <div className="text-white">Repository not found</div>

  const tabs: { id: Tab; label: string }[] = [
    { id: 'analysis', label: 'AI Analysis' },
    { id: 'readme', label: 'README' },
    { id: 'dependencies', label: 'Dependencies' },
    { id: 'raw', label: 'Raw Data' },
  ]

  const healthColor = repo.healthScore >= 70 ? 'text-emerald-500' : repo.healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{repo.name}</h1>
              {repo.isPrivate && <Badge variant="default"><Lock className="w-3 h-3 mr-1" /> Private</Badge>}
              {repo.isFork && <Badge variant="default"><ForkIcon className="w-3 h-3 mr-1" /> Fork</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <a href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400">
                <ExternalLink className="w-4 h-4" /> {repo.fullName}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <ProgressRing progress={repo.healthScore} size={64} />
              <p className={`text-sm font-medium mt-1 ${healthColor}`}>Health</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Badge variant="info" className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
            {repo.language || 'Unknown'}
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Star className="w-3 h-3" /> {repo.stargazersCount} stars
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <GitFork className="w-3 h-3" /> {repo.forksCount} forks
          </Badge>
          <Badge variant="default" className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {repo.openIssuesCount} issues
          </Badge>
          <span className="text-sm text-gray-500">Updated {formatRelativeTime(repo.pushedAt)}</span>
        </div>

        {repo.topics?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {repo.topics.map((topic: string) => (
              <span key={topic} className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm">
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="border-b border-gray-800">
          <div className="flex gap-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'analysis' && (
          <AnalysisTab
            repoId={id}
            analysis={existingAnalysis}
            isAnalyzing={isAnalyzing}
            onAnalyze={() => analyze(id)}
          />
        )}

        {activeTab === 'readme' && (
          <ReadmeTab
            readme={repo.readme}
            generatedReadme={generatedReadme}
            onGenerate={async () => {
              setIsGenerating(true)
              try {
                const res = await fetch('/api/ai/generate-readme', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ repoId: id }),
                })
                const data = await res.json()
                setGeneratedReadme(data.readme)
              } finally {
                setIsGenerating(false)
              }
            }}
          />
        )}

        {activeTab === 'dependencies' && (
          <DependenciesTab dependencies={repo.dependencies} />
        )}

        {activeTab === 'raw' && (
          <Card>
            <pre className="text-sm text-gray-300 overflow-auto max-h-96">
              {JSON.stringify(repo, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </ErrorBoundary>
  )
}

function AnalysisTab({ repoId, analysis, isAnalyzing, onAnalyze }: { repoId: string; analysis: any; isAnalyzing: boolean; onAnalyze: () => void }) {
  if (!analysis && !isAnalyzing) {
    return (
      <Card className="text-center py-12">
        <Zap className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">Analyze with AI</h3>
        <p className="text-gray-400 mb-6">Get intelligent suggestions to improve this repository</p>
        <Button onClick={onAnalyze}>Start Analysis</Button>
      </Card>
    )
  }

  if (isAnalyzing) return <AnalysisSkeleton />

  if (!analysis?.aiSuggestions) return <AnalysisSkeleton />

  const suggestions = analysis.aiSuggestions

  return (
    <div className="space-y-6">
      <Card>
        <p className="text-gray-300">{suggestions.summary}</p>
      </Card>

      {suggestions.strengths?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-400">Strengths</CardTitle>
          </CardHeader>
          <ul className="space-y-2">
            {suggestions.strengths.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="text-emerald-500">✓</span> {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {suggestions.issues?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Issues & Fixes</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {suggestions.issues.map((issue: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border ${
                issue.severity === 'critical' ? 'border-red-700 bg-red-900/20' :
                issue.severity === 'warning' ? 'border-yellow-700 bg-yellow-900/20' :
                'border-blue-700 bg-blue-900/20'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={issue.severity === 'critical' ? 'danger' : issue.severity === 'warning' ? 'warning' : 'info'}>
                    {issue.severity}
                  </Badge>
                  <Badge variant="default">{issue.category}</Badge>
                </div>
                <p className="text-white font-medium">{issue.issue}</p>
                <p className="text-gray-400 text-sm mt-1"><span className="text-emerald-400">Fix:</span> {issue.fix}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {suggestions.suggestedTopics?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Topics</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap gap-2">
            {suggestions.suggestedTopics.map((topic: string) => (
              <span key={topic} className="px-3 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-sm">
                {topic}
              </span>
            ))}
          </div>
        </Card>
      )}

      {suggestions.suggestedDescription && (
        <Card>
          <CardHeader>
            <CardTitle>Suggested Description</CardTitle>
          </CardHeader>
          <p className="text-gray-300">{suggestions.suggestedDescription}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => navigator.clipboard.writeText(suggestions.suggestedDescription)}>
            Copy Description
          </Button>
        </Card>
      )}

      {suggestions.readmeSuggestion && (
        <Card>
          <CardHeader>
            <CardTitle>Generated README</CardTitle>
          </CardHeader>
          <div className="bg-gray-800/50 rounded-lg p-4 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>
              {suggestions.readmeSuggestion}
            </ReactMarkdown>
          </div>
        </Card>
      )}
    </div>
  )
}

function ReadmeTab({ readme, generatedReadme, onGenerate }: { readme: string | null; generatedReadme: string | null; onGenerate: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const content = readme || generatedReadme

  if (!content) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-400 mb-4">No README found for this repository</p>
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate README with AI'}
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-400">{readme ? 'Current README' : 'Generated README'}</span>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(content)}>
            Copy
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            const blob = new Blob([content], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'README.md'
            a.click()
          }}>
            Download
          </Button>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>
          {content}
        </ReactMarkdown>
      </div>
    </Card>
  )
}

function DependenciesTab({ dependencies }: { dependencies: Record<string, string> | null }) {
  if (!dependencies || Object.keys(dependencies).length === 0) {
    return <Card className="text-center py-12"><p className="text-gray-400">No dependencies detected</p></Card>
  }

  return (
    <Card>
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
            <th className="pb-2">Package</th>
            <th className="pb-2">Version</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(dependencies).map(([name, version]) => (
            <tr key={name} className="border-b border-gray-800/50">
              <td className="py-2 text-white">{name}</td>
              <td className="py-2 text-gray-400">{version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

