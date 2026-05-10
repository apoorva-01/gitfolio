'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { useRepositories } from '@/hooks/useRepositories'
import { useState, useEffect } from 'react'
import { Zap, AlertTriangle, Star, CheckCircle, RefreshCw, GitFork, Eye } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { getLanguageColor } from '@/lib/languages'

interface RepoType {
  name: string
  stargazersCount: number
  language: string | null
  isPrivate: boolean
  isFork: boolean
  pushedAt: string
}

interface SkillMap {
  primaryLanguages: string[]
  frameworks: string[]
  domains: string[]
}

interface ProfileAnalysis {
  recruiterReadinessScore: number
  developerArchetype: string
  careerNarrative: string
  skillMap: SkillMap
  criticalGaps: string[]
  topImprovements: {
    priority: string
    effort: 'low' | 'medium' | 'high'
    action: string
    impact: string
  }[]
  pinnedRepoRecommendations: string[]
  profileBioSuggestion: string
}

export default function ProfilePage() {
  const { data: profileAnalysis, isLoading } = useProfileAnalysis()
  const { mutate: analyzeProfile, isPending: isAnalyzing } = useAnalyzProfile()
  const { repos } = useRepositories() as { repos: RepoType[] }
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <div className="animate-pulse h-96 rounded-lg" style={{ background: 'var(--color-surface)' }} />
  )

  const skillMap = profileAnalysis?.skillMap || { primaryLanguages: [], frameworks: [], domains: [] }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar" style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-success))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Star className="w-10 h-10" style={{ color: 'white' }} />
        </div>
        <div className="profile-info">
          <h1 className="profile-name" style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            marginBottom: '4px',
            color: 'var(--color-text)'
          }}>
            {profileAnalysis ? 'apoorva-01' : 'Loading...'}
          </h1>
          <p className="profile-username" style={{ 
            fontSize: '18px', 
            color: 'var(--color-text-secondary)', 
            marginBottom: '16px'
          }}>
            @apoorva-01
          </p>
          {profileAnalysis && (
            <>
              <p className="profile-bio" style={{ 
                fontSize: '16px', 
                color: 'var(--color-text)', 
                marginBottom: '16px',
                lineHeight: '1.6'
              }}>
                {profileAnalysis.careerNarrative}
              </p>
              <div className="profile-meta" style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '16px', 
                fontSize: '14px', 
                color: 'var(--color-text-secondary)'
              }}>
                <div className="meta-item">
                  <Eye className="w-4 h-4" /> 
                  <span>{repos.length} Public Repos</span>
                </div>
                <div className="meta-item">
                  <GitFork className="w-4 h-4" /> 
                  <span>12 Forks</span>
                </div>
                <div className="meta-item">
                  <Star className="w-4 h-4" /> 
                  <span>124 Stars</span>
                </div>
              </div>
              <div className="profile-actions" style={{ 
                display: 'flex', 
                gap: '12px', 
                marginTop: '20px'
              }}>
                <Button 
                  onClick={() => analyzeProfile()} 
                  disabled={isAnalyzing}
                  className="btn-primary"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(profileAnalysis.profileBioSuggestion || '')}>
                  Copy Bio
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      {profileAnalysis && (
        <div className="profile-stats" style={{ 
          display: 'flex', 
          gap: '32px', 
          padding: '20px 24px', 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '32px'
        }}>
          <div className="stat-item">
            <div className="stat-value" style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'var(--color-accent)'
            }}>
              {profileAnalysis.recruiterReadinessScore?.toFixed(0)}
            </div>
            <div className="stat-label" style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-secondary)'
            }}>
              Recruiter Readiness
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'var(--color-accent)'
            }}>
              {repos.length}
            </div>
            <div className="stat-label" style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-secondary)'
            }}>
              Public Repos
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'var(--color-accent)'
            }}>
              124
            </div>
            <div className="stat-label" style={{ 
              fontSize: '13px', 
              color: 'var(--color-text-secondary)'
            }}>
              Total Stars
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Container (simplified) */}
      <div className="heatmap-container" style={{ 
        background: 'var(--color-surface)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-md)', 
        padding: '24px', 
        marginBottom: '32px'
      }}>
        <div className="heatmap-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px'
        }}>
          <h2 className="section-title" style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '0',
            color: 'var(--color-text)'
          }}>
            Contribution Heatmap
          </h2>
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        <div className="heatmap" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(52, 12px)', 
          gridTemplateRows: 'repeat(7, 12px)', 
          gap: '4px'
        }}>
          {[...Array(364)].map((_, i) => (
            <div 
              key={i} 
              className="heatmap-cell"
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: i % 7 === 0 ? 'var(--color-border)' : 'transparent',
                borderRadius: '2px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Map */}
        <Card className="lg:col-span-2" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)'
        }}>
          <h2 className="section-title" style={{ 
            padding: '24px', 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Skills Map
          </h2>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs mb-2" style={{ 
                color: 'var(--color-text-muted)', 
                fontSize: '12px'
              }}>
                Languages
              </p>
              <div className="flex flex-wrap gap-2">
                {skillMap.primaryLanguages.map((lang: string) => (
                  <span 
                    key={lang} 
                    className="px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      background: 'var(--color-accent-muted)', 
                      color: 'var(--color-accent)',
                      fontSize: '12px'
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ 
                color: 'var(--color-text-muted)', 
                fontSize: '12px'
              }}>
                Frameworks
              </p>
              <div className="flex flex-wrap gap-2">
                {skillMap.frameworks.map((fw: string) => (
                  <span 
                    key={fw} 
                    className="px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      background: 'rgba(163,113,247,0.15)', 
                      color: '#a371f7',
                      fontSize: '12px'
                    }}
                  >
                    {fw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ 
                color: 'var(--color-text-muted)', 
                fontSize: '12px'
              }}>
                Domains
              </p>
              <div className="flex flex-wrap gap-2">
                {skillMap.domains.map((d: string) => (
                  <span 
                    key={d} 
                    className="px-3 py-1 rounded-full text-sm" 
                    style={{ 
                      background: 'rgba(34,211,238,0.15)', 
                      color: '#22d3ee',
                      fontSize: '12px'
                    }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Critical Gaps */}
        <Card style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)'
        }}>
          <h2 className="section-title" style={{ 
            padding: '24px', 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Critical Gaps
          </h2>
          <div className="p-6 space-y-3">
            {profileAnalysis?.criticalGaps?.map((gap: string, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle 
                  className="w-4 h-4" 
                  style={{ 
                    color: 'var(--color-error)', 
                    marginTop: '0.5px',
                    flexShrink: '0'
                  }}
                />
                <span className="text-sm" style={{ 
                  color: 'var(--color-text)', 
                  fontSize: '14px'
                }}>
                  {gap}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Profile Improvements */}
        <Card style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)'
        }}>
          <h2 className="section-title" style={{ 
            padding: '24px', 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Profile Improvements
          </h2>
          <div className="p-6 space-y-3">
            {profileAnalysis?.topImprovements?.map((imp: any, i: number) => (
              <div key={i} className="p-4 rounded-md" style={{ 
                background: 'var(--color-surface-hover)', 
                border: '1px solid var(--color-border)', 
                marginBottom: '12px'
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center font-semibold" 
                    style={{ 
                      background: 'var(--color-accent-muted)', 
                      color: 'var(--color-accent)',
                      fontSize: '12px'
                    }}
                  >
                    {imp.priority}
                  </span>
                  <Badge 
                    variant={imp.effort === 'low' ? 'success' : imp.effort === 'medium' ? 'warning' : 'danger'}
                    className="text-xs"
                  >
                    {imp.effort}
                  </Badge>
                </div>
                <p className="text-sm" style={{ 
                  color: 'var(--color-text)', 
                  fontSize: '14px'
                }}>
                  {imp.action}
                </p>
                <p className="text-xs mt-1" style={{ 
                  color: 'var(--color-text-muted)', 
                  fontSize: '12px'
                }}>
                  {imp.impact}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pinned Repo Suggestions and Bio Suggestion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pinned Repo Suggestions */}
        <Card style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)'
        }}>
          <h2 className="section-title" style={{ 
            padding: '24px', 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Pinned Repo Suggestions
          </h2>
          <div className="p-6 space-y-2">
            {profileAnalysis?.pinnedRepoRecommendations?.map((repoName: string, i: number) => {
              const repo = repos.find(r => r.name === repoName)
              return (
                <div key={i} className="flex items-center justify-between p-2 rounded-md" style={{ 
                  background: 'var(--color-surface-hover)', 
                  border: '1px solid var(--color-border)'
                }}>
                  <span className="text-sm" style={{ 
                    color: 'var(--color-text)', 
                    fontSize: '14px'
                  }}>
                    {repoName}
                  </span>
                  {repo && (
                    <span className="flex items-center gap-1 text-xs" style={{ 
                      color: 'var(--color-text-muted)', 
                      fontSize: '12px'
                    }}>
                      <Star className="w-3 h-3" /> {repo.stargazersCount}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Bio Suggestion */}
        <Card style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)'
        }}>
          <h2 className="section-title" style={{ 
            padding: '24px', 
            fontSize: '20px', 
            fontWeight: '600', 
            margin: '0',
            color: 'var(--color-text)',
            borderBottom: '1px solid var(--color-border)'
          }}>
            Bio Suggestion
          </h2>
          <div className="p-6">
            {profileAnalysis && (
              <>
                <p className="mb-4" style={{ 
                  color: 'var(--color-text)', 
                  fontSize: '16px', 
                  lineHeight: '1.6'
                }}>
                  {profileAnalysis.profileBioSuggestion}
                </p>
                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(profileAnalysis.profileBioSuggestion || '')}>
                  Copy Bio
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}