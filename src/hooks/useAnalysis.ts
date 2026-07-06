import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useProfileAnalysis() {
  return useQuery({
    queryKey: ['profile-analysis'],
    queryFn: async () => {
      const res = await fetch('/api/ai/profile-analysis')
      if (!res.ok) throw new Error('Failed to fetch profile analysis')
      return res.json()
    },
  })
}

export function useAnalyzProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/ai/analyze-profile', { method: 'POST' })
      if (!res.ok) throw new Error('Analysis failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-analysis'] })
    },
  })
}

export function useRepoAnalysis(repoId: string) {
  return useQuery({
    queryKey: ['repo-analysis', repoId],
    queryFn: async () => {
      const res = await fetch(`/api/ai/analysis/${repoId}`)
      if (!res.ok) throw new Error('No analysis found')
      return res.json()
    },
    enabled: !!repoId,
  })
}

export function useAnalyzeRepo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (repoId: string) => {
      const res = await fetch('/api/ai/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      })
      if (!res.ok) throw new Error('Analysis failed')
      return res.json()
    },
    onSuccess: (_, repoId) => {
      queryClient.invalidateQueries({ queryKey: ['repo-analysis', repoId] })
      queryClient.invalidateQueries({ queryKey: ['repo', repoId] })
    },
  })
}

export function useGenerateReadme() {
  return useMutation({
    mutationFn: async (repoId: string): Promise<{ readme: string }> => {
      const res = await fetch('/api/ai/generate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      })
      if (!res.ok) throw new Error('README generation failed')
      return res.json()
    },
  })
}
