import type { DashboardPayload } from '../types/dashboard'

export const demoDashboard: DashboardPayload = {
  generatedAt: new Date().toISOString(),
  metrics: [
    { key: 'mrr', label: 'Monthly Recurring Revenue', value: '$161,400', delta: '+12.4% vs last month', trend: 'up' },
    { key: 'customers', label: 'Active Customers', value: '2,849', delta: '+6.1% net growth', trend: 'up' },
    { key: 'conversion', label: 'Conversion Rate', value: '8.7%', delta: '+1.2pp this quarter', trend: 'up' },
    { key: 'arpa', label: 'Avg Revenue per Account', value: '$56.7', delta: '+4.9% this month', trend: 'up' },
  ],
  growth: [
    { month: 'Jan', mrr: 84, churn: 5.1 },
    { month: 'Feb', mrr: 96, churn: 4.7 },
    { month: 'Mar', mrr: 108, churn: 4.2 },
    { month: 'Apr', mrr: 121, churn: 3.9 },
    { month: 'May', mrr: 134, churn: 3.4 },
    { month: 'Jun', mrr: 148, churn: 3.1 },
    { month: 'Jul', mrr: 161, churn: 2.8 },
  ],
  sources: [
    { source: 'Organic', signups: 420 },
    { source: 'Referral', signups: 290 },
    { source: 'Ads', signups: 190 },
    { source: 'Partners', signups: 120 },
  ],
  activity: [
    { id: 'demo-evt-1', user: 'Nia Carter', action: 'Upgraded to Growth', when: '2 min ago' },
    { id: 'demo-evt-2', user: 'PixelHub Inc.', action: 'Added 5 seats', when: '18 min ago' },
    { id: 'demo-evt-3', user: 'DataForge', action: 'Enabled annual billing', when: '43 min ago' },
  ],
  accounts: [
    { id: 'demo-acct-1', name: 'Northbeam Labs', arr: '$64,200', seats: 40, plan: 'Enterprise' },
    { id: 'demo-acct-2', name: 'BrightKite', arr: '$38,400', seats: 24, plan: 'Scale' },
    { id: 'demo-acct-3', name: 'Terracotta AI', arr: '$28,500', seats: 16, plan: 'Growth' },
  ],
  users: [
    { id: 'demo-user-1', name: 'Demo Owner', email: 'owner@example.test', role: 'Owner', status: 'active', lastActive: 'Now' },
    { id: 'demo-user-2', name: 'Demo Analyst', email: 'analyst@example.test', role: 'Analyst', status: 'active', lastActive: '5 min ago' },
  ],
  security: {
    ssoRequired: true,
    mfaRequired: true,
    sessionTimeoutMinutes: 60,
    apiKeyLastRotated: '2026-10-20T09:15:00.000Z',
  },
  notifications: [
    { id: 'demo-notification-1', title: 'Demo upgrade', message: 'Northbeam Labs upgraded to Enterprise.', createdAt: '2 min ago', read: false },
    { id: 'demo-notification-2', title: 'Demo summary', message: 'Your sample revenue summary is ready.', createdAt: '1 hr ago', read: true },
  ],
}
