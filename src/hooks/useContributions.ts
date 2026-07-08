import { useQuery } from '@tanstack/react-query'
import type { ContribDay } from '@/lib/gf-derive'
import type { GitHubActivity } from '@/lib/github'

export type { GitHubActivity }

export interface GithubStats {
  contributions: ContribDay[]
  activity: GitHubActivity | null
}

export function useContributions() {
  return useQuery<GithubStats>({
    queryKey: ['contributions'],
    queryFn: async () => {
      const res = await fetch('/api/contributions')
      if (!res.ok) throw new Error('Failed to fetch contributions')
      const data = await res.json()
      return {
        contributions: (data.contributions || []) as ContribDay[],
        activity: (data.activity || null) as GitHubActivity | null,
      }
    },
  })
}
