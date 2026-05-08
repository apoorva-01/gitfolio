'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Link as LinkIcon, Zap, Network, User } from 'lucide-react'

function LoginContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-white">Repo</span>
            <span className="text-emerald-500">Mind</span>
          </h1>
          <p className="text-gray-400 text-lg">Your GitHub intelligence layer</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900/80 backdrop-blur p-8">
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-gray-300">
              <Network className="w-5 h-5 text-cyan-500" />
              <span>Map your entire codebase as an interactive graph</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Zap className="w-5 h-5 text-emerald-500" />
              <span>Get AI-powered repo improvements</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <User className="w-5 h-5 text-purple-500" />
              <span>Understand your developer profile</span>
            </div>
          </div>

          <button
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
              <LinkIcon className="w-5 h-5" />
            Continue with GitHub
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            We request repo access to analyze your code. Your private repos are never shared.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
