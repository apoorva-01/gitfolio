'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { useRepositories } from '@/hooks/useRepositories'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { Zap, AlertTriangle, Star, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface RepoType {
  name: string
  stargazersCount: number
}

export default function ProfilePage() {
  const { data: profileAnalysis, isLoading } = useProfileAnalysis()
  const { mutate: analyzeProfile, isPending: isAnalyzing } = useAnalyzProfile()
  const { repos } = useRepositories() as { repos: RepoType[] }
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="animate-pulse h-96 bg-gray-900 rounded-lg" />

  const skillMap = profileAnalysis?.skillMap || { primaryLanguages: [], frameworks: [], domains: [] }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Developer Profile</h1>
        <Button onClick={() => analyzeProfile()} disabled={isAnalyzing}>
          <Zap className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
        </Button>
      </div>

      {profileAnalysis && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="45" stroke="#1f2937" strokeWidth="8" fill="none" />
                    <circle
                      cx="50" cy="50" r="45"
                      stroke={profileAnalysis.recruiterReadinessScore >= 70 ? '#10b981' : profileAnalysis.recruiterReadinessScore >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(profileAnalysis.recruiterReadinessScore / 100) * 283} 283`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-3xl font-bold text-white">{profileAnalysis.recruiterReadinessScore?.toFixed(0)}</span>
                      <p className="text-xs text-gray-400">Score</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Badge variant="info" className="mb-2">{profileAnalysis.developerArchetype}</Badge>
                  <p className="text-gray-300 max-w-md">{profileAnalysis.careerNarrative}</p>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Map</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {skillMap.primaryLanguages.map((lang: string) => (
                      <span key={lang} className="px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-sm">{lang}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Frameworks</p>
                  <div className="flex flex-wrap gap-2">
                    {skillMap.frameworks.map((fw: string) => (
                      <span key={fw} className="px-2 py-1 rounded bg-purple-900/30 text-purple-400 text-sm">{fw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Domains</p>
                  <div className="flex flex-wrap gap-2">
                    {skillMap.domains.map((d: string) => (
                      <span key={d} className="px-2 py-1 rounded bg-cyan-900/30 text-cyan-400 text-sm">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Critical Gaps</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {profileAnalysis.criticalGaps?.map((gap: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{gap}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Improvements</CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {profileAnalysis.topImprovements?.map((imp: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-900 text-emerald-400 text-xs flex items-center justify-center font-medium">
                        {imp.priority}
                      </span>
                      <Badge variant={imp.effort === 'low' ? 'success' : imp.effort === 'medium' ? 'warning' : 'danger'}>
                        {imp.effort}
                      </Badge>
                    </div>
                    <p className="text-sm text-white">{imp.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{imp.impact}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pinned Repo Suggestions</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {profileAnalysis.pinnedRepoRecommendations?.map((repoName: string, i: number) => {
                  const repo = repos.find(r => r.name === repoName)
                  return (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                      <span className="text-sm text-gray-200">{repoName}</span>
                      {repo && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Star className="w-3 h-3" /> {repo.stargazersCount}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Bio Suggestion</CardTitle>
            </CardHeader>
            <p className="text-gray-300 mb-4">{profileAnalysis.profileBioSuggestion}</p>
            <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(profileAnalysis.profileBioSuggestion || '')}>
              Copy Bio
            </Button>
          </Card>
        </>
      )}

      {!profileAnalysis && !isLoading && (
        <Card className="text-center py-12">
          <Zap className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-50" />
          <h3 className="text-lg font-medium text-white mb-2">Analyze Your Profile</h3>
          <p className="text-gray-400 mb-6">Get AI-powered insights about your GitHub profile and career readiness</p>
          <Button onClick={() => analyzeProfile()}>Start Analysis</Button>
        </Card>
      )}
    </div>
  )
}
