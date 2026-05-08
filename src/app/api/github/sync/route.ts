import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { GitHubClient, GitHubRepo } from '@/lib/github'

const HEALTH_WEIGHTS = {
  HAS_README: 20,
  README_LONG: 10,
  HAS_DESCRIPTION: 10,
  HAS_TOPICS: 10,
  HAS_LICENSE: 15,
  RECENT_COMMIT: 10,
  HAS_ISSUES: 5,
  HAS_STARS: 5,
  NOT_FORK: 5,
  HAS_DEPENDENCIES: 10,
} as const

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.githubAccessToken) {
    return NextResponse.json({ error: 'No GitHub token' }, { status: 400 })
  }

  const startTime = Date.now()
  const github = new GitHubClient(user.githubAccessToken)

  async function syncRepo(repo: GitHubRepo): Promise<{ success: boolean; repo: string; error?: string }> {
    try {
      const [owner, repoName] = repo.full_name.split('/')
      const [languages, readme, deps] = await Promise.all([
        github.getRepositoryLanguages(owner, repoName),
        github.getRepositoryReadme(owner, repoName),
        github.getRepositoryDependencies(owner, repoName),
      ])

      const lastCommit = await github.getLastCommit(owner, repoName)

      let healthScore = 50
      if (readme) healthScore += HEALTH_WEIGHTS.HAS_README
      if ((readme?.length || 0) > 200) healthScore += HEALTH_WEIGHTS.README_LONG
      if (repo.description) healthScore += HEALTH_WEIGHTS.HAS_DESCRIPTION
      if (repo.topics && repo.topics.length >= 2) healthScore += HEALTH_WEIGHTS.HAS_TOPICS
      if (repo.license) healthScore += HEALTH_WEIGHTS.HAS_LICENSE
      if (lastCommit && Date.now() - lastCommit.getTime() < 180 * 24 * 60 * 60 * 1000) healthScore += HEALTH_WEIGHTS.RECENT_COMMIT
      if (repo.open_issues_count > 0) healthScore += HEALTH_WEIGHTS.HAS_ISSUES
      if (repo.stargazers_count > 0) healthScore += HEALTH_WEIGHTS.HAS_STARS
      if (!repo.fork) healthScore += HEALTH_WEIGHTS.NOT_FORK
      if (Object.keys(deps).length > 0) healthScore += HEALTH_WEIGHTS.HAS_DEPENDENCIES
      healthScore = Math.min(100, healthScore)

      await prisma.repository.upsert({
        where: { githubId: repo.id },
        create: {
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          languages: languages as any,
          isPrivate: repo.private,
          isFork: repo.fork,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          watchersCount: repo.watchers_count,
          openIssuesCount: repo.open_issues_count,
          topics: repo.topics,
          hasReadme: !!readme,
          hasLicense: !!repo.license,
          licenseType: repo.license?.spdx_id,
          lastCommitAt: lastCommit,
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          defaultBranch: repo.default_branch,
          userId,
          dependencies: deps as any,
          readme,
          healthScore,
          parentFullName: repo.parent?.full_name || null,
        },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          language: repo.language,
          languages: languages as any,
          isPrivate: repo.private,
          isFork: repo.fork,
          stargazersCount: repo.stargazers_count,
          forksCount: repo.forks_count,
          watchersCount: repo.watchers_count,
          openIssuesCount: repo.open_issues_count,
          topics: repo.topics,
          hasReadme: !!readme,
          hasLicense: !!repo.license,
          licenseType: repo.license?.spdx_id,
          lastCommitAt: lastCommit,
          pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
          defaultBranch: repo.default_branch,
          dependencies: deps as any,
          readme,
          healthScore,
          parentFullName: repo.parent?.full_name || null,
        },
      })

      return { success: true, repo: repo.full_name }
    } catch (error) {
      return { success: false, repo: repo.full_name, error: String(error) }
    }
  }

  async function processBatch(repos: GitHubRepo[], batchNum: number, totalBatches: number): Promise<{ synced: number; failed: number }> {
    console.log(`[Sync] Processing batch ${batchNum}/${totalBatches} (${repos.length} repos)`)
    
    const results = await Promise.allSettled(repos.map(repo => syncRepo(repo)))
    
    let synced = 0
    let failed = 0
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.success) {
        synced++
      } else {
        failed++
        const error = result.status === 'rejected' ? result.reason : result.value.error
        console.error(`[Sync] Failed to sync ${repos[i]?.full_name}:`, error)
      }
    })
    
    console.log(`[Sync] Batch ${batchNum} complete: ${synced} synced, ${failed} failed`)
    return { synced, failed }
  }

  try {
    const ghRepos = await github.getAllRepositories()
    console.log(`[Sync] Found ${ghRepos.length} repositories to sync`)

    const BATCH_SIZE = 10
    const batches: GitHubRepo[][] = []
    for (let i = 0; i < ghRepos.length; i += BATCH_SIZE) {
      batches.push(ghRepos.slice(i, i + BATCH_SIZE))
    }

    const totalBatches = batches.length
    let totalSynced = 0
    let totalFailed = 0

    for (let i = 0; i < batches.length; i++) {
      const { synced, failed } = await processBatch(batches[i], i + 1, totalBatches)
      totalSynced += synced
      totalFailed += failed

      if (i < batches.length - 1) {
        await github.handleRateLimit()
      }
    }

    console.log(`[Sync] Complete: ${totalSynced} synced, ${totalFailed} failed in ${Date.now() - startTime}ms`)

    return NextResponse.json({
      synced: totalSynced,
      failed: totalFailed,
      total: ghRepos.length,
      duration: Date.now() - startTime,
      status: 'complete',
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
