export type Metric = {
  key: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'flat'
}

export type GrowthPoint = {
  month: string
  mrr: number
  churn: number
}

export type SourcePoint = {
  source: string
  signups: number
}

export type ActivityEvent = {
  id: string
  user: string
  action: string
  when: string
}

export type TopAccount = {
  id: string
  name: string
  arr: string
  seats: number
  plan: string
}

export type UserRole = 'Owner' | 'Admin' | 'Analyst' | 'Viewer'

export type UserStatus = 'active' | 'invited' | 'suspended'

export type WorkspaceUser = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  lastActive: string
}

export type SecuritySettings = {
  ssoRequired: boolean
  mfaRequired: boolean
  sessionTimeoutMinutes: number
  apiKeyLastRotated: string
}

export type NotificationItem = {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export type DashboardPayload = {
  generatedAt: string
  metrics: Metric[]
  growth: GrowthPoint[]
  sources: SourcePoint[]
  activity: ActivityEvent[]
  accounts: TopAccount[]
  users: WorkspaceUser[]
  security: SecuritySettings
  notifications: NotificationItem[]
}
