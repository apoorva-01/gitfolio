import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useGraphData() {
  return useQuery({
    queryKey: ['graph'],
    queryFn: async () => {
      const res = await fetch('/api/graph')
      if (!res.ok) throw new Error('Failed to fetch graph')
      return res.json()
    },
  })
}

export function useRebuildGraph() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/graph/rebuild', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to rebuild graph')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['graph'] })
    },
  })
}
