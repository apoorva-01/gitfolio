import { Octokit } from '@octokit/rest'
import { decrypt } from './encryption'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  private: boolean
  fork: boolean
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  topics: string[] | undefined
  license: { spdx_id: string } | null
  default_branch: string
  created_at: string
  pushed_at: string | null
  parent?: { full_name: string }
  source?: { full_name: string }
}

interface GitHubProfile {
  login: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  twitter_username: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

interface ContributedRepo {
  nameWithOwner: string
  url: string
  description: string | null
  stargazerCount: number
  isPrivate: boolean
  primaryLanguage: { name: string } | null
}

export interface GitHubActivity {
  lastYear: { commits: number; pullRequests: number; issues: number; reviews: number; privateContributions: number }
  allTime: { mergedPullRequests: number; issues: number; discussionAnswers: number }
  contributedReposCount: number
  contributedRepos: { nameWithOwner: string; url: string; description: string | null; stars: number; language: string | null }[]
}

export class GitHubClient {
  private octokit: Octokit

  constructor(accessToken: string) {
    const decryptedToken = decrypt(accessToken, process.env.ENCRYPTION_KEY!)
    this.octokit = new Octokit({ auth: decryptedToken })
  }

  async handleRateLimit(): Promise<void> {
    const response = await this.octokit.repos.get({ owner: 'octocat', repo: 'Hello-World' }).catch(() => null)
    const remaining = Number(response?.headers['x-ratelimit-remaining'] ?? 5000)
    const reset = Number(response?.headers['x-ratelimit-reset'] ?? 0)
    
    if (remaining < 10 && reset > Date.now() / 1000) {
      const waitMs = (reset - Date.now() / 1000) * 1000
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
  }

  async getAllRepositories(): Promise<GitHubRepo[]> {
    await this.handleRateLimit()
    const repos: GitHubRepo[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const response = await this.octokit.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: 'updated',
        direction: 'desc',
      })
      repos.push(...(response.data as GitHubRepo[]))
      if (response.data.length < perPage) break
      page++
    }

    return repos
  }

  async getRepositoryLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await this.octokit.repos.listLanguages({ owner, repo })
      return response.data
    } catch {
      return {}
    }
  }

  async getRepositoryReadme(owner: string, repo: string): Promise<string | null> {
    try {
      const response = await this.octokit.repos.getReadme({ owner, repo })
      const content = response.data.content
      if (content) {
        return Buffer.from(content, 'base64').toString('utf-8')
      }
      return null
    } catch {
      return null
    }
  }

  async getRepositoryDependencies(owner: string, repo: string): Promise<Record<string, string>> {
    const deps: Record<string, string> = {}
    const files = [
      { name: 'package.json', key: 'dependencies' },
      { name: 'requirements.txt', key: null },
      { name: 'go.mod', key: 'module' },
      { name: 'Gemfile', key: null },
      { name: 'Cargo.toml', key: 'package' },
    ]

    for (const file of files) {
      try {
        const response = await this.octokit.repos.getContent({ owner, repo, path: file.name })
        if (!Array.isArray(response.data) && 'content' in response.data) {
          const content = Buffer.from(response.data.content!, 'base64').toString('utf-8')
          if (file.name === 'package.json') {
            const pkg = JSON.parse(content)
            Object.entries(pkg.dependencies || {}).forEach(([k, v]) => { deps[k] = v as string })
          } else if (file.name === 'requirements.txt') {
            content.split('\n').forEach(line => {
              const match = line.match(/^([a-zA-Z0-9_-]+)/)
              if (match) deps[match[1]] = 'latest'
            })
          } else if (file.name === 'go.mod') {
            const match = content.match(/module\s+([^\s]+)/)
            if (match) deps[match[1]] = 'latest'
          } else if (file.name === 'Cargo.toml') {
            const match = content.match(/\[package\]\s+name\s*=\s*"([^"]+)"/)
            if (match) deps[match[1]] = 'latest'
          }
        }
      } catch {}
    }
    return deps
  }

  async getUserProfile(): Promise<GitHubProfile> {
    const response = await this.octokit.users.getAuthenticated()
    return response.data as unknown as GitHubProfile
  }

  async getContributionCalendar(username: string): Promise<{ date: string; count: number }[]> {
    try {
      const response = await this.octokit.graphql({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }`,
        login: username,
      })
      const weeks = (response as any).user.contributionsCollection.contributionCalendar.weeks
      const data: { date: string; count: number }[] = []
      weeks.forEach((week: { contributionDays: { date: string; contributionCount: number }[] }) => {
        week.contributionDays.forEach(day => {
          data.push({ date: day.date, count: day.contributionCount })
        })
      })
      return data
    } catch {
      return []
    }
  }

  async getActivitySummary(username: string): Promise<GitHubActivity | null> {
    try {
      const response = await this.octokit.graphql({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              totalCommitContributions
              totalPullRequestContributions
              totalIssueContributions
              totalPullRequestReviewContributions
              restrictedContributionsCount
            }
            repositoriesContributedTo(first: 12, privacy: PUBLIC, includeUserRepositories: false, contributionTypes: [COMMIT, PULL_REQUEST, ISSUE, PULL_REQUEST_REVIEW], orderBy: { field: STARGAZERS, direction: DESC }) {
              totalCount
              nodes { nameWithOwner url description stargazerCount isPrivate primaryLanguage { name } }
            }
            repositoryDiscussionComments(onlyAnswers: true) { totalCount }
            pullRequests(states: MERGED) { totalCount }
            issues { totalCount }
          }
        }`,
        login: username,
      })
      const u = (response as any).user
      const c = u.contributionsCollection
      return {
        lastYear: {
          commits: c.totalCommitContributions,
          pullRequests: c.totalPullRequestContributions,
          issues: c.totalIssueContributions,
          reviews: c.totalPullRequestReviewContributions,
          privateContributions: c.restrictedContributionsCount,
        },
        allTime: {
          mergedPullRequests: u.pullRequests.totalCount,
          issues: u.issues.totalCount,
          discussionAnswers: u.repositoryDiscussionComments.totalCount,
        },
        contributedReposCount: u.repositoriesContributedTo.totalCount,
        // Defensive: privacy:PUBLIC already excludes private repos, but never publish a private name.
        contributedRepos: (u.repositoriesContributedTo.nodes as ContributedRepo[])
          .filter((n) => !n.isPrivate)
          .map((n) => ({
            nameWithOwner: n.nameWithOwner,
            url: n.url,
            description: n.description,
            stars: n.stargazerCount,
            language: n.primaryLanguage?.name || null,
          })),
      }
    } catch {
      return null
    }
  }

  async getLastCommit(owner: string, repo: string): Promise<Date | null> {
    try {
      const response = await this.octokit.repos.listCommits({ owner, repo, per_page: 1 })
      return response.data[0] ? new Date(response.data[0].commit.author!.date!) : null
    } catch {
      return null
    }
  }
}
