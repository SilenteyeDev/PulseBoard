import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'
import type {
  ActivityEvent,
  DashboardPayload,
  GrowthPoint,
  Metric,
  NotificationItem,
  SourcePoint,
  TopAccount,
  WorkspaceUser,
} from './types.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServerKey = process.env.SUPABASE_SERVER_KEY ?? process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServerKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVER_KEY are required for database access')
}

export const database: SupabaseClient = createClient(supabaseUrl, supabaseServerKey)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime()
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr ago`
  return `${Math.round(hours / 24)} days ago`
}

export async function getDashboardData(): Promise<DashboardPayload> {
  const [metrics, growth, sources, activity, accounts, users, security, notifications] = await Promise.all([
    database.from('dashboard_metrics').select('key,label,value,delta,trend').order('sort_order'),
    database.from('revenue_snapshots').select('month,mrr,churn').order('month'),
    database.from('acquisition_sources').select('source,signups').order('signups', { ascending: false }),
    database.from('activity_events').select('id,actor_name,action,created_at').order('created_at', { ascending: false }).limit(10),
    database.from('accounts').select('id,name,arr,seats,plan').order('arr', { ascending: false }),
    database.from('workspace_users').select('id,name,email,role,status,last_active_at').order('name'),
    database.from('security_settings').select('sso_required,mfa_required,session_timeout_minutes,api_key_last_rotated').eq('id', 1).maybeSingle(),
    database.from('notifications').select('id,title,message,created_at,read').order('created_at', { ascending: false }).limit(20),
  ])

  const firstError = [metrics, growth, sources, activity, accounts, users, security, notifications].find((result) => result.error)
  if (firstError?.error) {
    throw new Error(`Supabase data query failed: ${firstError.error.message}`)
  }

  const metricRows = (metrics.data ?? []) as Array<Metric>
  const growthRows = (growth.data ?? []) as Array<{ month: string; mrr: number; churn: number }>
  const sourceRows = (sources.data ?? []) as Array<SourcePoint>
  const activityRows = (activity.data ?? []) as Array<{ id: string; actor_name: string; action: string; created_at: string }>
  const accountRows = (accounts.data ?? []) as Array<{ id: string; name: string; arr: number; seats: number; plan: string }>
  const userRows = (users.data ?? []) as Array<{ id: string; name: string; email: string; role: WorkspaceUser['role']; status: WorkspaceUser['status']; last_active_at: string | null }>
  const notificationRows = (notifications.data ?? []) as Array<{ id: string; title: string; message: string; created_at: string; read: boolean }>

  const formattedMetrics = metricRows.map((metric) => ({
    ...metric,
    value: metric.key === 'mrr' || metric.key === 'arpa'
      ? formatCurrency(Number(metric.value))
      : metric.value,
  }))
  const formattedGrowth: GrowthPoint[] = growthRows.map((point) => ({
    month: new Date(`${point.month}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short' }),
    mrr: Number(point.mrr),
    churn: Number(point.churn),
  }))
  const formattedActivity: ActivityEvent[] = activityRows.map((event) => ({
    id: event.id,
    user: event.actor_name,
    action: event.action,
    when: formatRelativeTime(event.created_at),
  }))
  const formattedAccounts: TopAccount[] = accountRows.map((account) => ({
    id: account.id,
    name: account.name,
    arr: formatCurrency(Number(account.arr)),
    seats: Number(account.seats),
    plan: account.plan,
  }))
  const formattedUsers: WorkspaceUser[] = userRows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastActive: user.last_active_at ? formatRelativeTime(user.last_active_at) : 'Never',
  }))
  const formattedNotifications: NotificationItem[] = notificationRows.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: formatRelativeTime(notification.created_at),
    read: notification.read,
  }))

  return {
    generatedAt: new Date().toISOString(),
    metrics: formattedMetrics,
    growth: formattedGrowth,
    sources: sourceRows,
    activity: formattedActivity,
    accounts: formattedAccounts,
    users: formattedUsers,
    security: security.data
      ? {
          ssoRequired: security.data.sso_required,
          mfaRequired: security.data.mfa_required,
          sessionTimeoutMinutes: security.data.session_timeout_minutes,
          apiKeyLastRotated: security.data.api_key_last_rotated,
        }
      : {
          ssoRequired: false,
          mfaRequired: false,
          sessionTimeoutMinutes: 60,
          apiKeyLastRotated: new Date(0).toISOString(),
        },
    notifications: formattedNotifications,
  }
}

export async function findAccounts(query: string) {
  const result = await database
    .from('accounts')
    .select('id,name,arr,seats,plan')
    .ilike('name', `%${query}%`)
    .order('arr', { ascending: false })

  if (result.error) throw new Error(`Account search failed: ${result.error.message}`)
  return ((result.data ?? []) as Array<{ id: string; name: string; arr: number; seats: number; plan: string }>).map((account) => ({
    id: account.id,
    name: account.name,
    arr: formatCurrency(Number(account.arr)),
    seats: Number(account.seats),
    plan: account.plan,
  }))
}
