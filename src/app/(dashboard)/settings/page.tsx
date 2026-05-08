'use client'

import { useSession, signOut } from 'next-auth/react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { Link2, Trash2, Bell, Database } from 'lucide-react'
import { useState } from 'react'
import { useUIStore } from '@/store'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [clearing, setClearing] = useState(false)
  const { notifications, graphPreferences, setNotification, setGraphPreference } = useUIStore()

  const clearAllData = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This cannot be undone.')) return
    setClearing(true)
    await fetch('/api/settings/clear-data', { method: 'POST' })
    setClearing(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={session?.user?.image || ''} alt={session?.user?.name || 'User avatar'} className="w-12 h-12 rounded-full" />
            <div>
              <p className="text-white font-medium">{session?.user?.name}</p>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                {(session?.user as any)?.githubLogin || 'Not connected'}
              </p>
            </div>
          </div>
          <Badge variant="success">Connected</Badge>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800">
          <Button variant="danger" size="sm" onClick={() => signOut()}>
            Revoke Access
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-400 mb-4">Clear cached repository data without revoking GitHub access.</p>
        <Button variant="danger" onClick={clearAllData} disabled={clearing}>
          <Trash2 className="w-4 h-4 mr-2" />
          {clearing ? 'Clearing...' : 'Clear All Cached Data'}
        </Button>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Analysis notifications</p>
              <p className="text-sm text-gray-400">Get notified when AI analysis completes</p>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={notifications.analysisNotifications}
              onChange={(e) => setNotification('analysisNotifications', e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Critical issues alerts</p>
              <p className="text-sm text-gray-400">Alert when repos drop below health threshold</p>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={notifications.criticalIssueAlerts}
              onChange={(e) => setNotification('criticalIssueAlerts', e.target.checked)}
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Graph Preferences</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Default Layout</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              value={graphPreferences.defaultLayout}
              onChange={(e) => setGraphPreference('defaultLayout', e.target.value)}
            >
              <option value="force">Force-directed</option>
              <option value="dagre">Dagre</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle"
              checked={graphPreferences.showPrivateByDefault}
              onChange={(e) => setGraphPreference('showPrivateByDefault', e.target.checked)}
            />
            <div>
              <p className="text-white">Show private repos by default</p>
              <p className="text-sm text-gray-400">Display private repos in graph</p>
            </div>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="toggle"
              checked={graphPreferences.dynamicNodeSizing}
              onChange={(e) => setGraphPreference('dynamicNodeSizing', e.target.checked)}
            />
            <div>
              <p className="text-white">Dynamic node sizing</p>
              <p className="text-sm text-gray-400">Node size based on stars and health</p>
            </div>
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <div className="space-y-2 text-sm text-gray-400">
          <p><span className="text-white">GitFolio</span> v1.0.0</p>
          <p>Your GitHub portfolio builder</p>
          <p className="text-xs mt-4 text-gray-500">
            Built with Next.js, Prisma, React Flow, and Claude AI
          </p>
        </div>
      </Card>
    </div>
  )
}
