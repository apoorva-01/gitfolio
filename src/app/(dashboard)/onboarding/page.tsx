'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSyncRepos } from '@/hooks/useRepositories'
import { useRebuildGraph } from '@/hooks/useGraph'
import { useAnalyzProfile } from '@/hooks/useAnalysis'
import { useUIStore } from '@/store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Zap, RefreshCw, Network, User, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'

type Step = 'welcome' | 'sync' | 'graph' | 'analysis' | 'done'

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { setOnboardingComplete } = useUIStore()
  const { mutate: syncRepos, data: syncData } = useSyncRepos()
  const { mutate: buildGraph, data: graphData } = useRebuildGraph()
  const { mutate: analyzeProfile, data: profileData } = useAnalyzProfile()

  const [step, setStep] = useState<Step>('welcome')
  const [syncedCount, setSyncedCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const startSync = () => {
    setStep('sync')
    syncRepos()
  }

  useEffect(() => {
    if (syncData?.synced) {
      setSyncedCount(syncData.synced)
      setTimeout(() => setStep('graph'), 1500)
    }
  }, [syncData])

  useEffect(() => {
    if (step === 'graph') {
      buildGraph()
      setTimeout(() => setStep('analysis'), 2000)
    }
  }, [step])

  useEffect(() => {
    if (step === 'analysis') {
      analyzeProfile()
      setTimeout(() => setStep('done'), 3000)
    }
  }, [step])

  const completeOnboarding = async () => {
    await fetch('/api/onboarding/complete', { method: 'POST' })
    setOnboardingComplete(true)
    router.push('/dashboard')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === 'welcome' && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-900/30 flex items-center justify-center">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, {session?.user?.name}!</h2>
            <p className="text-gray-400 mb-8">Let's set up your GitHub portfolio</p>
            <Button onClick={startSync} size="lg">
              Let's Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}

        {step === 'sync' && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Syncing Repositories</h2>
            <p className="text-gray-400 mb-4">Fetching all your GitHub repos...</p>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '60%' }} />
            </div>
            <p className="text-sm text-gray-500">Syncing repositories...</p>
          </Card>
        )}

        {step === 'graph' && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6">
              <Network className="w-12 h-12 text-cyan-400 animate-pulse mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Building Your Graph</h2>
            <p className="text-gray-400 mb-4">Mapping your code universe...</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>{syncedCount} repositories synced!</span>
            </div>
          </Card>
        )}

        {step === 'analysis' && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6">
              <Zap className="w-12 h-12 text-purple-400 animate-pulse mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Analyzing Your Profile</h2>
            <p className="text-gray-400 mb-4">Claude is analyzing your GitHub presence...</p>
          </Card>
        )}

        {step === 'done' && (
          <Card className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're Ready!</h2>
            <div className="space-y-2 text-gray-400 mb-8">
              <p>{syncedCount} repositories synced</p>
              <p>Code graph built</p>
              <p>Profile analyzed</p>
            </div>
            <Button onClick={completeOnboarding} size="lg">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
