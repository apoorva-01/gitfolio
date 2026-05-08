import { z } from 'zod'

export const analyzeRepoSchema = z.object({
  repoId: z.string().uuid('Invalid repository ID format'),
})

export const generateReadmeSchema = z.object({
  repoId: z.string().uuid('Invalid repository ID format'),
})

export type AnalyzeRepoInput = z.infer<typeof analyzeRepoSchema>
export type GenerateReadmeInput = z.infer<typeof generateReadmeSchema>