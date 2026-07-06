'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Markdown from 'react-markdown'
import { useRepository } from '@/hooks/useRepositories'
import { useAnalyzeRepo, useGenerateReadme } from '@/hooks/useAnalysis'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Chip, LangDot, Divider, AIBadge } from '@/components/gf/primitives'
import { rel } from '@/lib/gf-derive'
import { toast } from '@/components/ui/Toast'

type Issue = { severity: 'critical' | 'warning' | 'suggestion'; category: string; issue: string; fix: string }
type Suggestions = {
  summary?: string
  strengths?: string[]
  issues?: Issue[]
  suggestedTopics?: string[]
  suggestedDescription?: string
  readmeSuggestion?: string
  recruiterImpact?: string
}

const SEVERITY_COLOR: Record<Issue['severity'], string> = {
  critical: 'var(--danger)',
  warning: 'var(--warn)',
  suggestion: 'var(--info)',
}

function Section({ title, children, badge }: { title: string; children: React.ReactNode; badge?: boolean }) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{title}</h2>
        {badge && <AIBadge>AI</AIBadge>}
      </div>
      {children}
    </Card>
  )
}

function MarkdownBox({ content }: { content: string }) {
  return (
    <div className="gf-md" style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, maxHeight: 460, overflow: 'auto', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10 }}>
      <Markdown>{content}</Markdown>
    </div>
  )
}

export default function RepoDetailPage() {
  const id = useParams().id as string
  const { data: repo, isLoading } = useRepository(id)
  const analyze = useAnalyzeRepo()
  const genReadme = useGenerateReadme()
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null)

  if (isLoading) {
    return (
      <PageShell topNav={<TopNav title="Repository" subtitle="Loading…" />}>
        <div style={{ padding: 24, color: 'var(--text-3)' }}>Loading repository…</div>
      </PageShell>
    )
  }

  if (!repo || repo.error) {
    return (
      <PageShell topNav={<TopNav title="Repository" subtitle="Not found" actions={<Button variant="secondary" size="sm" href="/repos">Back</Button>} />}>
        <div style={{ padding: 24 }}><Card padding={24}><p style={{ color: 'var(--text-2)' }}>This repository could not be found.</p></Card></div>
      </PageShell>
    )
  }

  const suggestions: Suggestions | null = repo.analysis?.aiSuggestions || null
  const health = Math.round(repo.healthScore || 0)
  const healthColor = health >= 70 ? 'var(--success)' : health >= 45 ? 'var(--warn)' : 'var(--danger)'
  const deps: Record<string, string> = repo.dependencies || {}
  const depEntries = Object.entries(deps)
  const readmeContent = generatedReadme || repo.readme || null

  const runAnalyze = () => {
    if (analyze.isPending) return
    analyze.mutate(id, {
      onSuccess: () => toast.success('Analysis complete'),
      onError: () => toast.error('Analysis failed'),
    })
  }
  const runReadme = () => {
    if (genReadme.isPending) return
    genReadme.mutate(id, {
      onSuccess: (data) => { setGeneratedReadme(data.readme); toast.success('README drafted') },
      onError: () => toast.error('Could not generate README'),
    })
  }

  const topNav = (
    <TopNav
      title={repo.name}
      subtitle={repo.fullName}
      actions={
        <>
          <Button variant="secondary" size="sm" icon={<Icon.Github size={13} />} href={`https://github.com/${repo.fullName}`}>GitHub</Button>
          <Button variant="ai" size="sm" icon={<Icon.Sparkle size={12} />} disabled={analyze.isPending} onClick={runAnalyze}>{analyze.isPending ? 'Analyzing…' : suggestions ? 'Re-analyze' : 'Analyze with AI'}</Button>
        </>
      }
    />
  )

  return (
    <PageShell topNav={topNav}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <a href="/repos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--text-3)', textDecoration: 'none', width: 'fit-content' }}>
          <Icon.ChevronR size={13} style={{ transform: 'rotate(180deg)' }} />Repositories
        </a>

        <div className="gf-profile-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
          {/* left: meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>Health score</span>
              </div>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, color: healthColor, lineHeight: 1 }}>{health}<span style={{ fontSize: 18, color: 'var(--text-3)' }}>/100</span></div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <Chip>{repo.isPrivate ? 'Private' : 'Public'}</Chip>
                {repo.isFork && <Chip color="var(--warn)" dot>Fork</Chip>}
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 14 }}>{repo.description || <span style={{ color: 'var(--text-3)' }}>No description</span>}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                {repo.language && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}><LangDot lang={repo.language} />{repo.language}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}><Icon.Star size={13} />{(repo.stargazersCount || 0).toLocaleString()} stars</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}><Icon.Fork size={13} />{repo.forksCount || 0} forks</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)' }}><Icon.Eye size={13} />{repo.openIssuesCount || 0} open issues</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)' }}><Icon.Clock size={13} />Updated {rel(repo.pushedAt)} ago</div>
              </div>
              {repo.topics?.length > 0 && (
                <>
                  <Divider style={{ margin: '14px 0' }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {repo.topics.map((t: string) => (
                      <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Section title={`Dependencies${depEntries.length ? ` · ${depEntries.length}` : ''}`}>
              {depEntries.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflow: 'auto' }}>
                  {depEntries.map(([name, version]) => (
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
                      <span className="mono" style={{ color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                      <span className="mono" style={{ color: 'var(--text-3)', flexShrink: 0 }}>{String(version)}</span>
                    </div>
                  ))}
                </div>
              ) : <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No dependencies detected.</span>}
            </Section>
          </div>

          {/* right: AI analysis + README */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            {!suggestions && !analyze.isPending && (
              <Card padding={32} style={{ textAlign: 'center', borderColor: 'color-mix(in oklab, var(--ai) 25%, var(--border))' }}>
                <Icon.Sparkle size={26} style={{ color: 'var(--ai)' }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 10 }}>Analyze this repository</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4, marginBottom: 16 }}>Claude reviews docs, metadata, and structure, then suggests fixes.</div>
                <Button variant="ai" size="md" icon={<Icon.Sparkle size={13} />} onClick={runAnalyze}>Start analysis</Button>
              </Card>
            )}

            {analyze.isPending && <Card padding={24}><span style={{ fontSize: 13, color: 'var(--text-3)' }}>Analyzing with Claude — this can take a moment…</span></Card>}

            {suggestions && (
              <>
                {suggestions.summary && (
                  <Section title="Summary" badge>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{suggestions.summary}</p>
                    {suggestions.recruiterImpact && <div style={{ marginTop: 12 }}><Chip color="var(--ai)" dot>Recruiter impact: {suggestions.recruiterImpact}</Chip></div>}
                  </Section>
                )}

                {!!suggestions.strengths?.length && (
                  <Section title="Strengths">
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {suggestions.strengths.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                          <Icon.Check size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />{s}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {!!suggestions.issues?.length && (
                  <Section title="Issues & fixes">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {suggestions.issues.map((it, i) => (
                        <div key={i} style={{ padding: 12, borderRadius: 10, background: 'var(--surface-2)', border: `1px solid color-mix(in oklab, ${SEVERITY_COLOR[it.severity] || 'var(--border)'} 30%, var(--border))` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Chip color={SEVERITY_COLOR[it.severity]} dot>{it.severity}</Chip>
                            <Chip>{it.category}</Chip>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{it.issue}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}><span style={{ color: 'var(--accent)' }}>Fix:</span> {it.fix}</div>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {(!!suggestions.suggestedTopics?.length || suggestions.suggestedDescription) && (
                  <Section title="Suggested metadata" badge>
                    {suggestions.suggestedDescription && (
                      <div style={{ marginBottom: suggestions.suggestedTopics?.length ? 14 : 0 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Description</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, margin: 0, flex: 1 }}>{suggestions.suggestedDescription}</p>
                          <Button variant="secondary" size="sm" icon={<Icon.Copy size={12} />} onClick={() => { navigator.clipboard?.writeText(suggestions.suggestedDescription!); toast.success('Copied') }}>Copy</Button>
                        </div>
                      </div>
                    )}
                    {!!suggestions.suggestedTopics?.length && (
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Topics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {suggestions.suggestedTopics.map((t) => <span key={t} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500 }}>{t}</span>)}
                        </div>
                      </div>
                    )}
                  </Section>
                )}
              </>
            )}

            {/* README */}
            <Section title="README" badge>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{generatedReadme ? 'AI-generated draft' : repo.readme ? 'Current README' : 'No README yet'}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {readmeContent && <Button variant="secondary" size="sm" icon={<Icon.Copy size={12} />} onClick={() => { navigator.clipboard?.writeText(readmeContent); toast.success('Copied') }}>Copy</Button>}
                  <Button variant="ai" size="sm" icon={<Icon.Sparkle size={12} />} disabled={genReadme.isPending} onClick={runReadme}>{genReadme.isPending ? 'Drafting…' : repo.readme ? 'Regenerate' : 'Generate'}</Button>
                </div>
              </div>
              {readmeContent ? <MarkdownBox content={readmeContent} /> : <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Generate a README draft from this repo’s code and metadata.</span>}
            </Section>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
