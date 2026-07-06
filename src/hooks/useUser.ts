import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface UserProfile {
  name: string | null
  bio: string | null
  image: string | null
  githubLogin: string
}

export function useUser() {
  return useQuery<UserProfile>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetch('/api/user')
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json()
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: { name?: string; bio?: string }): Promise<UserProfile> => {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Failed to update profile')
      }
      return res.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user)
    },
  })
}
