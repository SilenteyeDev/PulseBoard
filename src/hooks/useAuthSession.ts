import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const DEMO_KEY = 'pulseboard.demo'

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(() => window.localStorage.getItem(DEMO_KEY) === 'active')

  useEffect(() => {
    if (!supabase) {
      queueMicrotask(() => setAuthLoading(false))
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setAuthLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const startDemo = useCallback(() => {
    window.localStorage.setItem(DEMO_KEY, 'active')
    setDemoMode(true)
  }, [])

  const signOut = useCallback(() => {
    window.localStorage.removeItem(DEMO_KEY)
    setDemoMode(false)
    if (supabase) {
      void supabase.auth.signOut()
    }
  }, [])

  return { session, authLoading, demoMode, startDemo, signOut }
}
