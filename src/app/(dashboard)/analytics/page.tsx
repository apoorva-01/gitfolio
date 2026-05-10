'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRepositories } from '@/hooks/useRepositories'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts'
import { GitFork, Star, TrendingUp, Calendar, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLanguageColor } from '@/lib/languages'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface RepoType {
  id: string
  name: string
  language: string | null
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  healthScore: number
  createdAt: string
  hasReadme: boolean
  description: string | null
  hasLicense: boolean
  topics: string[]
  pushedAt: string | null
}

type TimeFilter = 'week' | 'month' | 'year'

export default function AnalyticsPage() {
  const { repos } = useRepositories() as { repos: RepoType[] }
  const [mounted, setMounted] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return (
    <div className="animate-pulse h-96 rounded-[var(--radius-md)]" style={{ backgroundColor: 'var(--color-surface)' }} />
  )

  const healthBrackets: { label: string; count: number; color: string }[] = [
    { label: '0-20', count: repos.filter((r: { healthScore: number }) => r.healthScore < 20).length, color: '#ef4444' },
    { label: '20-40', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 20 && r.healthScore < 40).length, color: '#f97316' },
    { label: '40-60', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 40 && r.healthScore < 60).length, color: '#f59e0b' },
    { label: '60-80', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 60 && r.healthScore < 80).length, color: '#84cc16' },
    { label: '80-100', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 80).length, color: '#10b981' },
  ]

  const langCounts: Record<string, number> = {}
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
  const langData = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const scatterData = repos
    .filter(r => r.stargazersCount > 0 || r.forksCount > 0)
    .map(r => ({
      x: r.stargazersCount,
      y: r.healthScore,
      name: r.name,
      language: r.language,
    }))

  const yearLangCounts: Record<string, Record<string, number>> = {}
  repos.forEach(r => {
    const year = new Date(r.createdAt).getFullYear().toString()
    if (!yearLangCounts[year]) yearLangCounts[year] = {}
    if (r.language) yearLangCounts[year][r.language] = (yearLangCounts[year][r.language] || 0) + 1
  })

  const yearlyData = Object.entries(yearLangCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, langs]) => ({
      year,
      ...langs,
    }))

  const avgHealth = repos.length > 0 ? repos.reduce((a, r) => a + r.healthScore, 0) / repos.length : 0
  const shipsVsStarts = {
    shipped: repos.filter(r => r.forksCount > 0 || r.stargazersCount > 0).length,
    total: repos.length,
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title" style={{ 
          fontSize: '28px', 
          fontWeight: '600', 
          color: 'var(--color-text)' 
        }}>
          Analytics
        </h1>
        <div className="time-filter" style={{ 
          display: 'flex', 
          gap: '8px' 
        }}>
          {(['week', 'month', 'year'] as TimeFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={cn(
                'px-3.5 py-2 text-[13px] rounded-[var(--radius-sm)] border cursor-pointer transition-colors',
                timeFilter === filter
                  ? 'bg-[var(--color-surface-hover)] border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)]'
              )}
              style={{ 
                color: timeFilter === filter ? 'var(--color-text)' : 'var(--color-text-secondary)' 
              }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '24px', 
        marginBottom: '24px' 
      }}>
        <div className="panel" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '20px' 
        }}>
          <div className="panel-title" style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: 'var(--color-text)' 
          }}>
            Health Score Distribution
          </div>
          <div className="chart-container" style={{ 
            height: '200px', 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '8px', 
            padding: '0 10px' 
          }}>
            {healthBrackets.map((bracket, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: '1', 
                  backgroundColor: bracket.color, 
                  borderRadius: '4px 4px 0 0', 
                  minHeight: '4px', 
                  transition: 'height 0.3s, background 0.2s, transform 0.15s', 
                  position: 'relative', 
                  cursor: 'pointer' 
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="panel" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '20px' 
        }}>
          <div className="panel-title" style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: 'var(--color-text)' 
          }}>
            Language Distribution
          </div>
          <div className="pie-chart-wrap" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            position: 'relative' 
          }}>
            <div className="pie-chart" style={{ 
              transform: 'rotate(-90deg)' 
            }}>
              {/* Pie chart will be rendered by recharts */}
            </div>
            <div className="pie-center" style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              textAlign: 'center' 
            }}>
              <div className="pie-center-value" style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: 'var(--color-accent)' 
              }}>
                {Object.keys(langCounts).length}
              </div>
              <div className="pie-center-label" style={{ 
                fontSize: '11px', 
                color: 'var(--color-text-muted)' 
              }}>
                Languages
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '24px', 
        marginBottom: '24px' 
      }}>
        <div className="stat-card" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '20px', 
          cursor: 'pointer', 
          transition: 'transform 0.2s, box-shadow 0.2s', 
          animation: 'fadeInUp 0.4s ease-out both' 
        }}>
          <div className="stat-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '8px' 
          }}>
            <span>Total Repos</span>
            <div className="stat-icon" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--color-border)' 
            }}>
              <Activity className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--color-text)' 
          }}>
            {repos.length}
          </div>
          <div className="stat-change" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '12px', 
            color: 'var(--color-success)', 
            marginTop: '8px' 
          }}>
            +12% from last month
          </div>
          <div className="sparkline" style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '3px', 
            height: '32px', 
            marginTop: '12px' 
          }}>
            {[1, 3, 2, 5, 4, 6, 5, 7].map((val, idx) => (
              <div 
                key={idx} 
                className="spark-bar" 
                style={{ 
                  flex: '1', 
                  backgroundColor: 'var(--color-success)', 
                  borderRadius: '2px', 
                  height: `${(val / 7) * 100}%` 
                }}
              />
            ))}
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '20px', 
          cursor: 'pointer', 
          transition: 'transform 0.2s, box-shadow 0.2s', 
          animation: 'fadeInUp 0.4s ease-out both' 
        }}>
          <div className="stat-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '8px' 
          }}>
            <span>Average Health</span>
            <div className="stat-icon" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--color-border)' 
            }}>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--color-text)' 
          }}>
            {avgHealth.toFixed(0)}
          </div>
          <div className="stat-change" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '12px', 
            color: 'var(--color-success)', 
            marginTop: '8px' 
          }}>
            +8% from last month
          </div>
          <div className="sparkline" style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '3px', 
            height: '32px', 
            marginTop: '12px' 
          }}>
            {[65, 68, 72, 70, 75, 73, 78, 80].map((val, idx) => (
              <div 
                key={idx} 
                className="spark-bar" 
                style={{ 
                  flex: '1', 
                  backgroundColor: 'var(--color-success)', 
                  borderRadius: '2px', 
                  height: `${(val / 80) * 100}%` 
                }}
              />
            ))}
          </div>
        </div>

        <div className="stat-card" style={{ 
          background: 'var(--color-surface)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)', 
          padding: '20px', 
          cursor: 'pointer', 
          transition: 'transform 0.2s, box-shadow 0.2s', 
          animation: 'fadeInUp 0.4s ease-out both' 
        }}>
          <div className="stat-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '8px' 
          }}>
            <span>Total Stars</span>
            <div className="stat-icon" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '36px', 
              height: '36px', 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--color-border)' 
            }}>
              <Star className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
          </div>
          <div className="stat-value" style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: 'var(--color-text)' 
          }}>
            {repos.reduce((a, r) => a + r.stargazersCount, 0)}
          </div>
          <div className="stat-change" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '12px', 
            color: 'var(--color-success)', 
            marginTop: '8px' 
          }}>
            +15% from last month
          </div>
          <div className="sparkline" style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: '3px', 
            height: '32px', 
            marginTop: '12px' 
          }}>
            {[120, 135, 142, 138, 150, 145, 160, 175].map((val, idx) => (
              <div 
                key={idx} 
                className="spark-bar" 
                style={{ 
                  flex: '1', 
                  backgroundColor: 'var(--color-success)', 
                  borderRadius: '2px', 
                  height: `${(val / 175) * 100}%` 
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="activity-table" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px' 
      }}>
        {[...repos]
          .sort((a, b) => b.stargazersCount - a.stargazersCount)
          .slice(0, 5)
          .map((repo, index) => (
            <div 
              key={index} 
              className="activity-row" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '8px 0' 
              }}
            >
              <div className="activity-repo" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                minWidth: '140px', 
                fontSize: '13px', 
                color: 'var(--color-accent)' 
              }}>
                <div className="repo-icon" style={{ 
                  width: '16px', 
                  height: '16px' 
                }}>
                  {/* Repo icon placeholder */}
                </div>
                <span>{repo.name}</span>
              </div>
              <div className="activity-bar-wrap" style={{ 
                flex: '1', 
                height: '8px', 
                background: 'var(--color-border)', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div 
                  className="activity-bar-fill" 
                  style={{ 
                    height: '100%', 
                    width: `${(repo.stargazersCount / 100) * 100}%`, 
                    background: 'var(--color-accent)', 
                    borderRadius: '4px', 
                    transition: 'width 0.6s ease' 
                  }}
                />
              </div>
              <div className="activity-value" style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--color-text-muted)', 
                minWidth: '40px', 
                textAlign: 'right' 
              }}>
                {repo.stargazersCount}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}