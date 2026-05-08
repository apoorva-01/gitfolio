import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useRepoStore, Repository } from '@/store'

async function fetchRepos(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params)
  const res = await fetch(`/api/github/repos?${searchParams}`)
  if (!res.ok) throw new Error('Failed to fetch repos')
  return res.json()
}

export function useRepositories(params: Record<string, string> = {}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['repos', params],
    queryFn: () => fetchRepos(params),
  })
  const { setRepos, setLastSynced } = useRepoStore()
  
  if (data?.repos) {
    setRepos(data.repos)
    if (data.repos[0]?.pushedAt) {
      setLastSynced(data.repos[0].pushedAt)
    }
  }

  return {
    repos: data?.repos || [],
    total: data?.total || 0,
    isLoading,
    error,
  }
}

export function useRepository(id: string) {
  return useQuery({
    queryKey: ['repo', id],
    queryFn: async () => {
      const res = await fetch(`/api/github/repos/${id}`)
      if (!res.ok) throw new Error('Failed to fetch repo')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useSyncRepos() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/github/sync', { method: 'POST' })
      if (!res.ok) throw new Error('Sync failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repos'] })
      queryClient.invalidateQueries({ queryKey: ['sync-status'] })
    },
  })
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: async () => {
      const res = await fetch('/api/github/sync/status')
      if (!res.ok) throw new Error('Failed to fetch sync status')
      return res.json()
    },
    refetchInterval: 30000,
  })
}
