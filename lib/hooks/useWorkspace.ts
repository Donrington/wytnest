'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Workspace } from '@/lib/types/database'

interface UseWorkspaceResult {
  workspace: Workspace | null
  userId: string | null
  loading: boolean
}

export function useWorkspace(): UseWorkspaceResult {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      supabase
        .from('workspace_members')
        .select('workspace:workspaces(*)')
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .order('invited_at', { ascending: true })
        .limit(1)
        .single()
        .then(({ data }) => {
          setWorkspace((data?.workspace as unknown as Workspace) ?? null)
          setLoading(false)
        })
    })
  }, [])

  return { workspace, userId, loading }
}
