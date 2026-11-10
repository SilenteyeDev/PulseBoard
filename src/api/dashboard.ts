import type {
  DashboardPayload,
  NotificationItem,
  SecuritySettings,
  TopAccount,
  UserRole,
  UserStatus,
  WorkspaceUser,
} from '../types/dashboard'
import { supabase } from '../lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

async function authenticatedFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    if (data.session?.access_token) {
      headers.set('Authorization', `Bearer ${data.session.access_token}`)
    }
  }

  return fetch(`${API_BASE}${path}`, { ...init, headers })
}

export async function fetchDashboardData(): Promise<DashboardPayload> {
  const response = await authenticatedFetch('/api/dashboard')
  if (!response.ok) {
    throw new Error('Failed to load dashboard data')
  }
  return (await response.json()) as DashboardPayload
}

export async function searchAccounts(query: string): Promise<TopAccount[]> {
  if (!query.trim()) {
    return []
  }

  const params = new URLSearchParams({ q: query.trim() })
  const response = await authenticatedFetch(`/api/accounts?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Account search failed')
  }

  return (await response.json()) as TopAccount[]
}

export async function fetchUsers(): Promise<WorkspaceUser[]> {
  const response = await authenticatedFetch('/api/users')
  if (!response.ok) {
    throw new Error('Failed to load users')
  }
  return (await response.json()) as WorkspaceUser[]
}

export async function updateUser(
  id: string,
  payload: { role?: UserRole; status?: UserStatus },
): Promise<WorkspaceUser> {
  const response = await authenticatedFetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error('Failed to update user')
  }
  return (await response.json()) as WorkspaceUser
}

export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  const response = await authenticatedFetch('/api/security')
  if (!response.ok) {
    throw new Error('Failed to load security settings')
  }
  return (await response.json()) as SecuritySettings
}

export async function updateSecuritySettings(
  payload: Pick<SecuritySettings, 'ssoRequired' | 'mfaRequired' | 'sessionTimeoutMinutes'>,
): Promise<SecuritySettings> {
  const response = await authenticatedFetch('/api/security', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error('Failed to update security settings')
  }
  return (await response.json()) as SecuritySettings
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const response = await authenticatedFetch('/api/notifications')
  if (!response.ok) {
    throw new Error('Failed to load notifications')
  }
  return (await response.json()) as NotificationItem[]
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const response = await authenticatedFetch(`/api/notifications/${id}/read`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to mark notification as read')
  }
  return (await response.json()) as NotificationItem
}

export async function markAllNotificationsRead(): Promise<void> {
  const response = await authenticatedFetch('/api/notifications/read-all', {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read')
  }
}
