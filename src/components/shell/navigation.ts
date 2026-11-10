import { Building2, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import type { ComponentType } from 'react'

export type ViewName = 'overview' | 'accounts' | 'users' | 'security'

export type NavItem = {
  id: ViewName
  label: string
  kicker: string
  icon: ComponentType<{ size?: number; className?: string }>
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', kicker: 'Today at a glance', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts', kicker: 'Who pays you', icon: Building2 },
  { id: 'users', label: 'Team', kicker: 'People with keys', icon: Users },
  { id: 'security', label: 'Security', kicker: 'Locks and keys', icon: ShieldCheck },
]
