import { useCallback, useEffect, useState } from 'react'
import {
  fetchDashboardData,
  markAllNotificationsRead,
  markNotificationRead,
  searchAccounts,
  updateSecuritySettings,
  updateUser,
} from '../api/dashboard'
import type {
  DashboardPayload,
  NotificationItem,
  SecuritySettings,
  TopAccount,
  UserRole,
  UserStatus,
  WorkspaceUser,
} from '../types/dashboard'
import { demoDashboard } from '../data/demoDashboard'

type Options = {
  demoMode: boolean
  enabled: boolean
  onStatus: (message: string) => void
}

export function useDashboardData({ demoMode, enabled, onStatus }: Options) {
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [accounts, setAccounts] = useState<TopAccount[]>([])
  const [users, setUsers] = useState<WorkspaceUser[]>([])
  const [security, setSecurity] = useState<SecuritySettings | null>(null)
  const [securityDraft, setSecurityDraft] = useState<SecuritySettings | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      if (demoMode) {
        setData(demoDashboard)
        setAccounts(demoDashboard.accounts)
        setUsers(demoDashboard.users)
        setSecurity(demoDashboard.security)
        setSecurityDraft(demoDashboard.security)
        setNotifications(demoDashboard.notifications)
        return
      }
      const payload = await fetchDashboardData()
      setData(payload)
      setAccounts(payload.accounts)
      setUsers(payload.users)
      setSecurity(payload.security)
      setSecurityDraft(payload.security)
      setNotifications(payload.notifications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }, [demoMode])

  useEffect(() => {
    if (!enabled) {
      return
    }
    queueMicrotask(() => {
      void reload()
    })
  }, [enabled, reload])

  const markOneRead = useCallback(
    async (id: string) => {
      if (demoMode) {
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
        return
      }
      try {
        const updated = await markNotificationRead(id)
        setNotifications((prev) => prev.map((item) => (item.id === id ? updated : item)))
      } catch {
        onStatus('Could not mark that notification as read')
      }
    },
    [demoMode, onStatus],
  )

  const markEveryRead = useCallback(async () => {
    if (demoMode) {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
      return
    }
    try {
      await markAllNotificationsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
    } catch {
      onStatus('Could not clear notifications')
    }
  }, [demoMode, onStatus])

  const changeRole = useCallback(
    async (id: string, role: UserRole) => {
      if (demoMode) {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)))
        onStatus('Role updated locally')
        return
      }
      try {
        const updated = await updateUser(id, { role })
        setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
        onStatus('Role updated')
      } catch {
        onStatus('Could not update that role')
      }
    },
    [demoMode, onStatus],
  )

  const changeStatus = useCallback(
    async (id: string, status: UserStatus) => {
      if (demoMode) {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, status } : user)))
        onStatus('Status updated locally')
        return
      }
      try {
        const updated = await updateUser(id, { status })
        setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
        onStatus('Status updated')
      } catch {
        onStatus('Could not update that status')
      }
    },
    [demoMode, onStatus],
  )

  const saveSecurity = useCallback(async () => {
    if (!securityDraft) {
      return
    }
    if (demoMode) {
      setSecurity(securityDraft)
      onStatus('Security settings updated locally')
      return
    }
    try {
      const updated = await updateSecuritySettings({
        ssoRequired: securityDraft.ssoRequired,
        mfaRequired: securityDraft.mfaRequired,
        sessionTimeoutMinutes: securityDraft.sessionTimeoutMinutes,
      })
      setSecurity(updated)
      setSecurityDraft(updated)
      onStatus('Security settings saved')
    } catch {
      onStatus('Could not save security settings')
    }
  }, [demoMode, onStatus, securityDraft])

  const findAccounts = useCallback(
    async (query: string): Promise<TopAccount[]> => {
      const clean = query.trim()
      if (!clean) {
        return accounts
      }
      if (demoMode) {
        return demoDashboard.accounts.filter((account) =>
          account.name.toLowerCase().includes(clean.toLowerCase()),
        )
      }
      try {
        return await searchAccounts(clean)
      } catch {
        return []
      }
    },
    [accounts, demoMode],
  )

  return {
    data,
    accounts,
    users,
    security,
    securityDraft,
    setSecurityDraft,
    notifications,
    loading,
    error,
    reload,
    markOneRead,
    markEveryRead,
    changeRole,
    changeStatus,
    saveSecurity,
    findAccounts,
  }
}
