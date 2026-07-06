import { useQuery } from '@tanstack/react-query'
import type { ContribDay } from '@/lib/gf-derive'

export function useContributions() {
  return useQuery<ContribDay[]>({
    queryKey: ['contributions'],
    queryFn: async () => {
      const res = await fetch('/api/contributions')
      if (!res.ok) throw new Error('Failed to fetch contributions')
      const data = await res.json()
      return (data.contributions || []) as ContribDay[]
    },
  })
}
