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

  // Incremental sync: repos whose pushed_at is unchanged since last sync skip the 4 per-repo API calls.
  const existingPushed = new Map(
    (await prisma.repository.findMany({ where: { userId }, select: { githubId: true, pushedAt: true } }))
      .map((r) => [r.githubId, r.pushedAt] as const)
  )

  async function syncRepo(repo: GitHubRepo): Promise<{ success: boolean; repo: string; error?: string; skipped?: boolean }> {
    try {
      const prevPushed = existingPushed.get(repo.id)
      const repoPushed = repo.pushed_at ? new Date(repo.pushed_at) : null
      if (prevPushed && repoPushed && repoPushed.getTime() <= prevPushed.getTime()) {
        // Unchanged — refresh only the cheap list-derived fields (stars/forks/etc.), keep the rest.
        await prisma.repository.update({
          where: { githubId: repo.id },
          data: {
            description: repo.description,
            stargazersCount: repo.stargazers_count,
            forksCount: repo.forks_count,
            watchersCount: repo.watchers_count,
            openIssuesCount: repo.open_issues_count,
            topics: repo.topics,
            isPrivate: repo.private,
            isFork: repo.fork,
          },
        })
        return { success: true, repo: repo.full_name, skipped: true }
      }

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

  async function processBatch(repos: GitHubRepo[], batchNum: number, totalBatches: number): Promise<{ synced: number; failed: number; skipped: number }> {
    console.log(`[Sync] Processing batch ${batchNum}/${totalBatches} (${repos.length} repos)`)

    const results = await Promise.allSettled(repos.map(repo => syncRepo(repo)))

    let synced = 0
    let failed = 0
    let skipped = 0
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.success) {
        synced++
        if (result.value.skipped) skipped++
      } else {
        failed++
        const error = result.status === 'rejected' ? result.reason : result.value.error
        console.error(`[Sync] Failed to sync ${repos[i]?.full_name}:`, error)
      }
    })

    console.log(`[Sync] Batch ${batchNum} complete: ${synced} synced (${skipped} unchanged), ${failed} failed`)
    return { synced, failed, skipped }
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
    let totalSkipped = 0

    for (let i = 0; i < batches.length; i++) {
      const { synced, failed, skipped } = await processBatch(batches[i], i + 1, totalBatches)
      totalSynced += synced
      totalFailed += failed
      totalSkipped += skipped

      // Only pause for rate limits when the batch actually hit the API (i.e. had changed repos).
      if (i < batches.length - 1 && synced - skipped > 0) {
        await github.handleRateLimit()
      }
    }

    console.log(`[Sync] Complete: ${totalSynced} synced (${totalSkipped} unchanged), ${totalFailed} failed in ${Date.now() - startTime}ms`)

    // Profile + contribution calendar + activity summary (3 API calls). Never touches bio/name — user-editable.
    try {
      const [profile, contributions, activity] = await Promise.all([
        github.getUserProfile(),
        github.getContributionCalendar(user.githubLogin),
        github.getActivitySummary(user.githubLogin),
      ])
      await prisma.user.update({
        where: { id: userId },
        data: {
          followers: profile.followers,
          following: profile.following,
          location: profile.location,
          company: profile.company,
          blog: profile.blog,
          twitterUsername: profile.twitter_username,
          githubCreatedAt: profile.created_at ? new Date(profile.created_at) : null,
          contributions: contributions as any,
          activity: activity as any,
        },
      })
    } catch (e) {
      console.error('[Sync] Profile/calendar/activity fetch failed:', e)
    }

    // Snapshot for historical deltas (one row per sync).
    const synced = await prisma.repository.findMany({ where: { userId }, select: { stargazersCount: true, forksCount: true, healthScore: true } })
    if (synced.length > 0) {
      const totalStars = synced.reduce((s, r) => s + r.stargazersCount, 0)
      const totalForks = synced.reduce((s, r) => s + r.forksCount, 0)
      const avgHealth = synced.reduce((s, r) => s + (r.healthScore || 0), 0) / synced.length
      const fresh = await prisma.user.findUnique({ where: { id: userId }, select: { followers: true } })
      await prisma.profileSnapshot.create({
        data: { userId, repoCount: synced.length, totalStars, totalForks, followers: fresh?.followers || 0, avgHealth },
      })
    }

    return NextResponse.json({
      synced: totalSynced,
      skipped: totalSkipped,
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
