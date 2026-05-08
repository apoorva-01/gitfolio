import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { GitHubClient } from '@/lib/github'

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

  try {
    const ghRepos = await github.getAllRepositories()
    let synced = 0

    for (const repo of ghRepos) {
      const [owner, repoName] = repo.full_name.split('/')
      const [languages, readme, deps] = await Promise.all([
        github.getRepositoryLanguages(owner, repoName),
        github.getRepositoryReadme(owner, repoName),
        github.getRepositoryDependencies(owner, repoName),
      ])

      const lastCommit = await github.getLastCommit(owner, repoName)

      let healthScore = 50
      if (readme) healthScore += 20
      if ((readme?.length || 0) > 200) healthScore += 10
      if (repo.description) healthScore += 10
      if (repo.topics && repo.topics.length >= 2) healthScore += 10
      if (repo.license) healthScore += 15
      if (lastCommit && Date.now() - lastCommit.getTime() < 180 * 24 * 60 * 60 * 1000) healthScore += 10
      if (repo.open_issues_count > 0) healthScore += 5
      if (repo.stargazers_count > 0) healthScore += 5
      if (!repo.fork) healthScore += 5
      if (Object.keys(deps).length > 0) healthScore += 10
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
      synced++
    }

    return NextResponse.json({
      synced,
      duration: Date.now() - startTime,
      status: 'complete',
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
