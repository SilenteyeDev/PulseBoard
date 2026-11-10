import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  Circle,
  CircleDollarSign,
  CreditCard,
  Download,
  GitBranch,
  Eye,
  EyeOff,
  FileSpreadsheet,
  CheckCircle2,
  KeyRound,
  LayoutDashboard,
  LoaderCircle,
  LogIn,
  LogOut,
  LockKeyhole,
  Mail,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  Radar,
  Search,
  SlidersHorizontal,
  ShoppingCart,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ComponentType, FormEvent } from 'react'
import {
  fetchDashboardData,
  markAllNotificationsRead,
  markNotificationRead,
  searchAccounts,
  updateSecuritySettings,
  updateUser,
} from './api/dashboard'
import type {
  DashboardPayload,
  Metric,
  NotificationItem,
  SecuritySettings,
  TopAccount,
  UserRole,
  UserStatus,
  WorkspaceUser,
} from './types/dashboard'
import { supabase, supabaseConfigured } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { demoDashboard } from './data/demoDashboard'

type ViewName = 'overview' | 'accounts' | 'users' | 'security'
type AccountSort = 'name' | 'arr' | 'seats'
type ChartMetric = 'mrr' | 'churn' | 'both'
type DateRange = '3m' | '6m' | 'all'
type AcquisitionChart = 'bar' | 'donut'
type AuthMode = 'sign-in' | 'register' | 'reset'

type NavItem = {
  id: ViewName
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
}

type MetricIconMap = Record<string, ComponentType<{ size?: number; className?: string }>>

const metricIcons: MetricIconMap = {
  mrr: CircleDollarSign,
  customers: Users,
  conversion: ShoppingCart,
  arpa: CreditCard,
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'security', label: 'Security', icon: ShieldCheck },
]

const roleOptions: UserRole[] = ['Owner', 'Admin', 'Analyst', 'Viewer']

function totalSignups(data: DashboardPayload) {
  return data.sources.reduce((total, source) => total + source.signups, 0)
}

function TrendBadge({ trend, delta }: { trend: Metric['trend']; delta: string }) {
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
        <ArrowDownRight size={14} /> {delta}
      </span>
    )
  }

  if (trend === 'flat') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
        <Circle size={12} /> {delta}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
      <ArrowUpRight size={14} /> {delta}
    </span>
  )
}

function MetricCard({ metric, onSelect }: { metric: Metric; onSelect: () => void }) {
  const Icon = metricIcons[metric.key] ?? Sparkles

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-400 hover:shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{metric.label}</p>
        <span className="flex items-center gap-2 text-slate-700">
          <span className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <Icon size={16} />
          </span>
          <Maximize2 size={14} className="opacity-0 transition group-hover:opacity-100" />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
      <div className="mt-2">
        <TrendBadge trend={metric.trend} delta={metric.delta} />
      </div>
    </button>
  )
}

function PulseMap({ data }: { data: DashboardPayload }) {
  const totalSignups = data.sources.reduce((total, source) => total + source.signups, 0)
  const leadingSource = [...data.sources].sort((left, right) => right.signups - left.signups)[0]
  const latestGrowth = data.growth[data.growth.length - 1]
  const priorGrowth = data.growth[data.growth.length - 2]
  const mrrAcceleration = latestGrowth && priorGrowth ? latestGrowth.mrr - priorGrowth.mrr : 0
  const sourceShare = totalSignups && leadingSource
    ? Math.round((leadingSource.signups / totalSignups) * 100)
    : 0

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-[#101820] text-white">
      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/10 p-5">
        <div>
          <div className="flex items-center gap-2 text-sky-300">
            <Radar size={16} />
            <p className="text-xs font-medium uppercase tracking-[0.18em]">Performance overview</p>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">Revenue performance at a glance</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Review customer growth, recurring revenue, and retention in one clear workspace.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
          Current period
        </span>
      </div>

      <div className="grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <GitBranch size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Demand</span>
          </div>
          <p className="mt-5 text-3xl font-semibold">{totalSignups.toLocaleString()}</p>
          <p className="mt-1 text-sm text-slate-400">tracked signups</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-sky-300">
            <span>{leadingSource?.source ?? 'No source data'}</span>
            <ArrowRight size={14} />
            <span>{sourceShare}% of mix</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Monetization</span>
          </div>
          <p className="mt-5 text-3xl font-semibold">+{mrrAcceleration}k</p>
          <p className="mt-1 text-sm text-slate-400">latest MRR movement</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300">
            <span>Expansion velocity</span>
            <ArrowUpRight size={14} />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Target size={16} />
            <span className="text-xs font-medium uppercase tracking-wide">Retention</span>
          </div>
          <p className="mt-5 text-3xl font-semibold">{latestGrowth?.churn ?? 0}%</p>
          <p className="mt-1 text-sm text-slate-400">current churn rate</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-emerald-300">
            <span>Downward pressure</span>
            <ArrowDownRight size={14} />
          </div>
        </div>
      </div>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
        <div className="flex items-center gap-3">
          <LoaderCircle className="animate-spin" size={18} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-xl border border-rose-200 bg-white p-6 text-rose-700">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} />
          <p className="font-medium">Failed to load dashboard</p>
        </div>
        <p className="mt-3 text-sm text-rose-600">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function AuthPage({ onDemo }: { onDemo: () => void }) {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formNotice, setFormNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFormNotice(null)

    if (!supabaseConfigured || !supabase) {
      setFormError('Supabase is not configured. Add the required VITE_SUPABASE environment variables.')
      return
    }

    if (mode === 'register' && !name.trim()) {
      setFormError('Enter your full name to continue.')
      return
    }
    if (!email.includes('@')) {
      setFormError('Enter a valid work email address.')
      return
    }
    if (mode !== 'reset' && password.length < 8) {
      setFormError('Your password must be at least 8 characters.')
      return
    }
    if (mode === 'register' && password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    if (mode === 'reset') {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      setSubmitting(false)
      if (result.error) {
        setFormError(result.error.message)
        return
      }
      setFormNotice('Password reset instructions sent. Check your email to continue.')
      setMode('sign-in')
      return
    }

    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name.trim() } },
        })

    setSubmitting(false)
    if (result.error) {
      setFormError(result.error.message)
      return
    }

    if (mode === 'register' && !result.data.session) {
      setFormNotice('Account created. Check your email to confirm your address, then sign in.')
      setMode('sign-in')
      setPassword('')
      setConfirmPassword('')
      return
    }

    setFormNotice('Signed in successfully.')
  }

  return (
    <div className="min-h-screen bg-[#111b24] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1560px] lg:grid-cols-[1.12fr_0.88fr]">
        <section className="relative hidden overflow-hidden bg-[#111b24] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400 text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.25)]">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <p className="font-semibold tracking-tight">PulseBoard</p>
                <p className="text-xs text-slate-400">Revenue control room</p>
              </div>
            </div>
            <div className="mt-24 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">Analytics workspace</p>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight tracking-tight xl:text-6xl">
                A clearer view of your business performance.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Monitor subscription performance, account growth, and the key metrics your team uses every day.
              </p>
            </div>

            <div className="mt-14 max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Workspace health</p>
                  <p className="mt-1 text-sm text-slate-300">Current performance indicators</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-medium text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Stable
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  ['Demand', 'Organic + referral', '72%', 'bg-sky-400'],
                  ['Monetization', 'Expansion velocity', '84%', 'bg-emerald-400'],
                  ['Retention', 'Churn pressure', '28%', 'bg-amber-400'],
                ].map(([label, detail, value, color]) => (
                  <div key={label}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{label} <span className="text-slate-500">/ {detail}</span></span>
                      <span className="font-medium text-slate-300">{value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative grid max-w-xl grid-cols-3 gap-3">
            {[
              ['12.4%', 'MRR growth'],
              ['2.8%', 'Current churn'],
              ['2,849', 'Active customers'],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-slate-700 pl-3">
                <p className="text-lg font-semibold">{value}</p>
                <p className="mt-1 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <main className="flex items-center justify-center bg-[#f7f8fa] p-5 sm:p-10 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <p className="font-semibold tracking-tight text-slate-900">PulseBoard</p>
                <p className="text-xs text-slate-500">Analytics Suite</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Workspace access</p>
                <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Secure entry</span>
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                {mode === 'sign-in'
                  ? 'Welcome back'
                  : mode === 'register'
                    ? 'Create your workspace'
                    : 'Reset your password'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'sign-in'
                  ? 'Sign in to continue to your revenue dashboard.'
                  : mode === 'register'
                    ? 'Start with a clean view of the metrics your team cares about.'
                    : 'Enter your email and we will send you a secure reset link.'}
              </p>
            </div>

            {mode !== 'reset' ? (
            <div className="mb-6 grid grid-cols-2 border-b border-slate-200">
              {(['sign-in', 'register'] as const).map((authMode) => (
                <button
                  key={authMode}
                  type="button"
                  onClick={() => {
                    setMode(authMode)
                    setFormError(null)
                  }}
                  className={`border-b-2 px-3 py-3 text-sm font-medium transition ${
                    mode === authMode
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {authMode === 'sign-in' ? 'Sign in' : 'Register'}
                </button>
              ))}
            </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' ? (
                <label className="block text-sm font-medium text-slate-700">
                  Full name
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    placeholder="Alex Morgan"
                    autoComplete="name"
                  />
                </label>
              ) : null}

              {mode !== 'reset' ? (
                <>
                  <label className="block text-sm font-medium text-slate-700">
                    Work email
                    <span className="relative mt-2 block">
                      <Mail size={17} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-3 font-normal outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                    </span>
                  </label>

                  <label className="block text-sm font-medium text-slate-700">
                    Password
                    <span className="relative mt-2 block">
                      <LockKeyhole size={17} className="absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-11 font-normal outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        placeholder="At least 8 characters"
                        autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-800"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </span>
                  </label>
                </>
              ) : null}

              {mode === 'register' ? (
                <label className="block text-sm font-medium text-slate-700">
                  Confirm password
                  <span className="relative mt-2 block">
                    <LockKeyhole size={17} className="absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-11 font-normal outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-800"
                      aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </label>
              ) : null}

              {mode === 'sign-in' ? (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset')
                      setFormError(null)
                      setFormNotice(null)
                    }}
                    className="font-medium text-slate-700 hover:text-sky-700"
                  >
                    Forgot password?
                  </button>
                </div>
              ) : null}

              {mode === 'reset' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-in')
                    setFormError(null)
                    setFormNotice(null)
                  }}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Back to sign in
                </button>
              ) : null}

              {formError ? (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {formError}
                </p>
              ) : null}
              {formNotice ? (
                <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {formNotice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <LogIn size={17} />}
                {submitting
                  ? 'Processing...'
                  : mode === 'sign-in'
                    ? 'Sign in to PulseBoard'
                    : mode === 'register'
                      ? 'Create workspace'
                      : 'Send reset instructions'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or test the interface</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <button
              type="button"
              onClick={onDemo}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-500 hover:bg-slate-50"
            >
              <Radar size={17} /> Preview demo workspace
            </button>

            <div className="mt-7 flex items-start gap-2 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
              <p>Workspace data is encrypted in transit and protected by role-based controls.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(
    () => window.localStorage.getItem('pulseboard.demo') === 'active',
  )
  const [activeView, setActiveView] = useState<ViewName>('overview')
  const [data, setData] = useState<DashboardPayload | null>(null)
  const [accounts, setAccounts] = useState<TopAccount[]>([])
  const [users, setUsers] = useState<WorkspaceUser[]>([])
  const [security, setSecurity] = useState<SecuritySettings | null>(null)
  const [securityDraft, setSecurityDraft] = useState<SecuritySettings | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [accountResults, setAccountResults] = useState<TopAccount[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [planFilter, setPlanFilter] = useState<'all' | 'Enterprise' | 'Scale' | 'Growth'>('all')
  const [accountSort, setAccountSort] = useState<AccountSort>('arr')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [chartMetric, setChartMetric] = useState<ChartMetric>('both')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [acquisitionChart, setAcquisitionChart] = useState<AcquisitionChart>('bar')
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null)
  const [advancedControlsOpen, setAdvancedControlsOpen] = useState(false)

  const loadDashboard = useCallback(async () => {
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
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [demoMode])

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

  useEffect(() => {
    if (!session && !demoMode) {
      return
    }

    queueMicrotask(() => {
      void loadDashboard()
    })
  }, [demoMode, loadDashboard, session])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const visibleAccounts = useMemo(() => {
    const source = accountResults ?? accounts
    const filtered = planFilter === 'all'
      ? source
      : source.filter((account) => account.plan === planFilter)

    return [...filtered].sort((left, right) => {
      if (accountSort === 'name') {
        return left.name.localeCompare(right.name)
      }
      if (accountSort === 'seats') {
        return right.seats - left.seats
      }
      return Number(right.arr.replace(/[$,]/g, '')) - Number(left.arr.replace(/[$,]/g, ''))
    })
  }, [accountResults, accounts, accountSort, planFilter])

  const visibleUsers = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean || activeView !== 'users') {
      return users
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(clean) ||
        user.email.toLowerCase().includes(clean) ||
        user.role.toLowerCase().includes(clean),
    )
  }, [users, query, activeView])

  const searchPlaceholder = useMemo(() => {
    if (activeView === 'users') {
      return 'Search users'
    }
    if (activeView === 'security') {
      return 'Search disabled in Security'
    }
    return 'Search account'
  }, [activeView])

  const visibleGrowth = useMemo(() => {
    if (!data) {
      return []
    }
    if (dateRange === '3m') {
      return data.growth.slice(-3)
    }
    if (dateRange === '6m') {
      return data.growth.slice(-6)
    }
    return data.growth
  }, [data, dateRange])

  const latestChurn = data?.growth[data.growth.length - 1]?.churn

  async function handleSearch() {
    if (activeView === 'security') {
      return
    }

    const cleanQuery = query.trim()
    if (!cleanQuery) {
      setAccountResults(null)
      return
    }

    if (activeView === 'users') {
      return
    }

    if (demoMode) {
      setAccountResults(
        demoDashboard.accounts.filter((account) =>
          account.name.toLowerCase().includes(cleanQuery.toLowerCase()),
        ),
      )
      return
    }

    try {
      setSearching(true)
      const results = await searchAccounts(cleanQuery)
      setAccountResults(results)
    } catch {
      setAccountResults([])
    } finally {
      setSearching(false)
    }
  }

  async function handleNotificationRead(id: string) {
    if (demoMode) {
      setNotifications((previous) => previous.map((item) => (item.id === id ? { ...item, read: true } : item)))
      return
    }

    try {
      const updated = await markNotificationRead(id)
      setNotifications((previous) =>
        previous.map((item) => (item.id === id ? updated : item)),
      )
    } catch {
      setStatusMessage('Unable to mark notification as read')
    }
  }

  async function handleReadAllNotifications() {
    if (demoMode) {
      setNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
      return
    }

    try {
      await markAllNotificationsRead()
      setNotifications((previous) => previous.map((item) => ({ ...item, read: true })))
    } catch {
      setStatusMessage('Unable to mark all notifications as read')
    }
  }

  async function handleUserRoleChange(id: string, role: UserRole) {
    if (demoMode) {
      setUsers((previous) => previous.map((user) => (user.id === id ? { ...user, role } : user)))
      setStatusMessage('Demo user role updated locally')
      return
    }

    try {
      const updated = await updateUser(id, { role })
      setUsers((previous) => previous.map((user) => (user.id === id ? updated : user)))
      setStatusMessage('User role updated')
    } catch {
      setStatusMessage('Unable to update user role')
    }
  }

  async function handleUserStatusChange(id: string, status: UserStatus) {
    if (demoMode) {
      setUsers((previous) => previous.map((user) => (user.id === id ? { ...user, status } : user)))
      setStatusMessage('Demo user status updated locally')
      return
    }

    try {
      const updated = await updateUser(id, { status })
      setUsers((previous) => previous.map((user) => (user.id === id ? updated : user)))
      setStatusMessage('User status updated')
    } catch {
      setStatusMessage('Unable to update user status')
    }
  }

  async function handleSecuritySave() {
    if (!securityDraft) {
      return []
    }

    if (demoMode) {
      setSecurity(securityDraft)
      setStatusMessage('Demo security settings updated locally')
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
      setStatusMessage('Security settings saved')
    } catch {
      setStatusMessage('Unable to save security settings')
    }
  }

  function resetSearch() {
    setQuery('')
    setAccountResults(null)
  }

  function handleSignOut() {
    window.localStorage.removeItem('pulseboard.demo')
    setDemoMode(false)
    if (supabase) {
      void supabase.auth.signOut()
    }
  }

  function exportReport() {
    if (!data) {
      return
    }

    const rows = [
      ['Metric', 'Value', 'Change'],
      ...data.metrics.map((metric) => [metric.label, metric.value, metric.delta]),
      [],
      ['Month', 'MRR', 'Churn'],
      ...visibleGrowth.map((point) => [point.month, String(point.mrr), String(point.churn)]),
    ]
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `pulseboard-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage('Report exported')
  }

  if (authLoading) {
    return <LoadingState />
  }

  if (!session && !demoMode) {
    return (
      <AuthPage
        onDemo={() => {
          window.localStorage.setItem('pulseboard.demo', 'active')
          setDemoMode(true)
        }}
      />
    )
  }

  if (loading) {
    return <LoadingState />
  }

  if (error || !data) {
    return <ErrorState message={error ?? 'Data unavailable'} onRetry={() => void loadDashboard()} />
  }

  return (
    <div className="min-h-screen bg-[#eef2f6] text-slate-900">
      <div className="mx-auto flex w-full max-w-[1480px] gap-5 p-4 lg:p-6">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">PulseBoard</h1>
            <p className="text-xs text-slate-500">Analytics Suite</p>
          </div>
        </div>

        <nav className="space-y-2 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} /> {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">Environment</p>
            {demoMode ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Demo
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {demoMode ? 'Sample data. Changes stay in this browser.' : 'Live Supabase workspace.'}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-5">
        <header className="rounded-2xl border border-slate-200 border-l-4 border-l-sky-600 bg-white p-4 shadow-sm lg:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-sky-700">{activeView}</span>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Revenue control room</h2>
              <p className="mt-1 text-sm text-slate-500">Updated {new Date(data.generatedAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 md:flex">
                <span className={`h-2 w-2 rounded-full ${demoMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {demoMode ? 'Demo workspace' : 'Live workspace'}
              </div>
              <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                  {(session?.user.email?.slice(0, 1) ?? 'D').toUpperCase()}
                </div>
                <div className="max-w-40">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {session?.user.user_metadata?.full_name ?? session?.user.email ?? 'Demo analyst'}
                  </p>
                  <p className="text-[11px] text-slate-500">Workspace member</p>
                </div>
              </div>
            </div>
            <div className="relative flex w-full items-center gap-3 lg:w-auto">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                <Search size={15} />
                <input
                  aria-label={searchPlaceholder}
                  className="w-36 border-none bg-transparent text-slate-700 outline-none placeholder:text-slate-400 md:w-52"
                  placeholder={searchPlaceholder}
                  value={query}
                  disabled={activeView === 'security'}
                  onChange={(event) => {
                    const next = event.target.value
                    setQuery(next)
                    if (!next.trim()) {
                      setAccountResults(null)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void handleSearch()
                    }
                  }}
                />
              </label>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600"
                onClick={() => void handleSearch()}
                disabled={activeView === 'security'}
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600"
                onClick={resetSearch}
                aria-label="Clear search"
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void loadDashboard()}
                disabled={loading}
                aria-label="Refresh dashboard data"
                title="Refresh dashboard data"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 sm:flex"
                onClick={exportReport}
              >
                <Download size={16} /> Export
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600"
                onClick={() => setAdvancedControlsOpen((value) => !value)}
                aria-label="Open dashboard controls"
                aria-expanded={advancedControlsOpen}
                title="Dashboard controls"
              >
                <SlidersHorizontal size={18} />
              </button>
              <button
                type="button"
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600"
                onClick={() => setNotificationsOpen((value) => !value)}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={notificationsOpen}
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notificationsOpen ? (
                <section className="absolute right-0 top-12 z-20 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Notifications</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-slate-600"
                      onClick={() => void handleReadAllNotifications()}
                    >
                      Mark all read
                    </button>
                  </div>
                  <ul className="max-h-64 space-y-2 overflow-auto">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`rounded-lg border p-2 ${
                          notification.read
                            ? 'border-slate-200 bg-slate-50 text-slate-500'
                            : 'border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs">{notification.message}</p>
                        <div className="mt-1 flex items-center justify-between text-[11px]">
                          <span>{notification.createdAt}</span>
                          {!notification.read ? (
                            <button
                              type="button"
                              className="font-medium text-slate-700"
                              onClick={() => void handleNotificationRead(notification.id)}
                            >
                              Mark read
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {advancedControlsOpen ? (
                <section className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">Workspace controls</p>
                    <button
                      type="button"
                      onClick={() => setAdvancedControlsOpen(false)}
                      aria-label="Close workspace controls"
                      className="text-slate-400 hover:text-slate-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={exportReport}
                    className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <FileSpreadsheet size={16} /> Export current report
                  </button>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Export includes the selected revenue window and current KPI snapshot.
                  </p>
                </section>
              ) : null}
            </div>
          </div>
        </header>

        <nav className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 md:grid-cols-4 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {statusMessage ? (
          <div role="status" className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">
            <span>{statusMessage}</span>
            <button
              type="button"
              className="ml-4 text-xs font-medium text-slate-500 hover:text-slate-900"
              onClick={() => setStatusMessage(null)}
              aria-label="Dismiss status message"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {activeView === 'overview' ? (
          <>
            <PulseMap data={data} />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {data.metrics.map((metric) => (
                <MetricCard key={metric.key} metric={metric} onSelect={() => setSelectedMetric(metric)} />
              ))}
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.6fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <GitBranch size={16} />
                      <p className="text-xs font-medium uppercase tracking-[0.16em]">Key indicators</p>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">Performance summary</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdvancedControlsOpen(true)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500"
                    title="View options"
                    aria-label="View options"
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </div>
                <div className="mt-5 divide-y divide-slate-100">
                  {[
                    {
                      label: 'Acquisition concentration',
                      evidence: `${data.sources[0]?.source ?? 'Primary source'} drives ${data.sources[0] && totalSignups(data) ? Math.round((data.sources[0].signups / totalSignups(data)) * 100) : 0}% of signups`,
                      impact: 'Watch',
                      tone: 'amber',
                    },
                    {
                      label: 'Revenue momentum',
                      evidence: `${data.growth[data.growth.length - 1]?.mrr ?? 0}k MRR at the latest snapshot`,
                      impact: 'Positive',
                      tone: 'emerald',
                    },
                    {
                      label: 'Retention pressure',
                      evidence: `${data.growth[data.growth.length - 1]?.churn ?? 0}% churn in the latest period`,
                      impact: 'Review',
                      tone: 'sky',
                    },
                  ].map((signal) => (
                    <div key={signal.label} className="grid gap-3 py-4 sm:grid-cols-[1fr_1.2fr_auto] sm:items-center">
                      <p className="text-sm font-medium text-slate-800">{signal.label}</p>
                      <p className="text-sm text-slate-500">{signal.evidence}</p>
                      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                        signal.tone === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700'
                          : signal.tone === 'amber'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-sky-50 text-sky-700'
                      }`}>{signal.impact}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Target size={16} />
                  <p className="text-xs font-medium uppercase tracking-[0.16em]">Action items</p>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Recommended follow-ups</h3>
                <div className="mt-5 space-y-3">
                  {[
                    ['Diversify acquisition', 'Primary source exceeds 40% of signup mix.', 'Review'],
                    ['Protect expansion', 'Latest MRR movement is positive.', 'Keep'],
                    ['Inspect churn cohorts', 'Retention is the highest-leverage risk.', 'Open'],
                  ].map(([title, detail, action]) => (
                    <button key={title} type="button" onClick={() => setStatusMessage(`${title} added to your focus list`)} className="group w-full rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-400 hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                        </div>
                        <ArrowRight size={15} className="mt-0.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-800" />
                      </div>
                      <span className="mt-3 inline-block text-[11px] font-medium uppercase tracking-wide text-slate-400">{action}</span>
                    </button>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">MRR Trend</h3>
                    <p className="text-sm text-slate-500">Monthly recurring revenue and churn</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden rounded-lg border border-slate-200 p-0.5 sm:flex">
                      {(['both', 'mrr', 'churn'] as const).map((metric) => (
                        <button
                          key={metric}
                          type="button"
                          onClick={() => setChartMetric(metric)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                            chartMetric === metric
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-500 hover:text-slate-900'
                          }`}
                        >
                          {metric === 'both' ? 'All' : metric}
                        </button>
                      ))}
                    </div>
                    <select
                      aria-label="Revenue chart date range"
                      value={dateRange}
                      onChange={(event) => setDateRange(event.target.value as DateRange)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600"
                    >
                      <option value="3m">3 months</option>
                      <option value="6m">6 months</option>
                      <option value="all">All time</option>
                    </select>
                  </div>
                </div>

                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visibleGrowth}>
                      <defs>
                        <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#334155" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis yAxisId="left" stroke="#64748b" />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                      <Tooltip />
                      {chartMetric !== 'churn' ? (
                        <Area yAxisId="left" type="monotone" dataKey="mrr" stroke="#334155" fill="url(#mrrFill)" strokeWidth={2.5} />
                      ) : null}
                      {chartMetric !== 'mrr' ? (
                        <Area yAxisId="right" type="monotone" dataKey="churn" stroke="#0284c7" fill="transparent" strokeWidth={2.5} />
                      ) : null}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Live Activity</h3>
                    <p className="text-xs text-slate-500">Latest workspace events</p>
                  </div>
                  <MoreHorizontal size={18} className="text-slate-400" />
                </div>
                <ul className="mt-4 space-y-3">
                  {data.activity.map((event) => (
                    <li key={event.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-sm font-medium text-slate-800">{event.user}</p>
                      <p className="text-sm text-slate-600">{event.action}</p>
                      <p className="mt-1 text-xs text-slate-400">{event.when}</p>
                    </li>
                  ))}
                </ul>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Acquisition Mix</h3>
                    <p className="text-sm text-slate-500">Signups by acquisition source</p>
                  </div>
                  <div className="flex rounded-lg border border-slate-200 p-0.5">
                    {(['bar', 'donut'] as const).map((chart) => (
                      <button
                        key={chart}
                        type="button"
                        onClick={() => setAcquisitionChart(chart)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${
                          acquisitionChart === chart
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {chart}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 h-56">
                  {acquisitionChart === 'bar' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.sources} layout="vertical" margin={{ left: 20, right: 12 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" />
                        <YAxis type="category" dataKey="source" stroke="#64748b" width={72} />
                        <Tooltip />
                        <Bar dataKey="signups" fill="#334155" radius={[0, 6, 6, 0]} barSize={22} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.sources} dataKey="signups" nameKey="source" innerRadius={55} outerRadius={88} paddingAngle={3}>
                          {data.sources.map((source, index) => (
                            <Cell key={source.source} fill={['#0f172a', '#0284c7', '#14b8a6', '#f59e0b'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Summary</p>
                    <h3 className="mt-2 text-lg font-semibold">Acquisition performance</h3>
                  </div>
                  <Sparkles size={18} className="text-sky-300" />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-300">
                  Organic and referral channels now account for {Math.round(((data.sources[0]?.signups ?? 0) + (data.sources[1]?.signups ?? 0)) / data.sources.reduce((total, source) => total + source.signups, 0) * 100)}% of signups. Churn is trending down across the selected revenue window.
                </p>
                <button
                  type="button"
                  onClick={exportReport}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900"
                >
                  <Download size={15} /> Export analysis
                </button>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-white p-4 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Retention Curve</h3>
                    <p className="text-sm text-slate-500">Churn movement over the selected period</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Lower is better</span>
                </div>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visibleGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" unit="%" />
                      <Tooltip />
                      <Line type="monotone" dataKey="churn" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: '#0284c7' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Radar size={16} />
                  <p className="text-xs font-medium uppercase tracking-[0.16em]">Health check</p>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    ['Revenue', data.growth.length ? 'On track' : 'No data', 'bg-emerald-500'],
                    ['Retention', latestChurn !== undefined && latestChurn < 4 ? 'Healthy' : 'Review', 'bg-sky-500'],
                    ['Demand', data.sources.length ? 'Active' : 'No data', 'bg-amber-500'],
                    ['Accounts', data.accounts.length ? `${data.accounts.length} tracked` : 'No data', 'bg-slate-700'],
                  ].map(([label, value, color]) => (
                    <div key={label} className="rounded-lg border border-slate-200 p-3">
                      <div className={`mb-3 h-2 w-2 rounded-full ${color}`} />
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        ) : null}

        {activeView === 'accounts' ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Accounts</h3>
                <p className="text-sm text-slate-500">
                  {searching ? 'Searching...' : query ? `Search results for "${query}"` : 'Showing all accounts'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {(['all', 'Enterprise', 'Scale', 'Growth'] as const).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setPlanFilter(plan)}
                    className={`rounded-lg border px-3 py-1.5 ${
                      planFilter === plan
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
                <select
                  aria-label="Sort accounts"
                  value={accountSort}
                  onChange={(event) => setAccountSort(event.target.value as AccountSort)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600"
                >
                  <option value="arr">Sort: ARR</option>
                  <option value="seats">Sort: seats</option>
                  <option value="name">Sort: name</option>
                </select>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Company</th>
                    <th className="px-3 py-2">ARR</th>
                    <th className="px-3 py-2">Seats</th>
                    <th className="px-3 py-2">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAccounts.map((account) => (
                    <tr key={account.id} className="rounded-lg bg-slate-50 text-slate-700">
                      <td className="rounded-l-lg px-3 py-3 font-medium text-slate-900">{account.name}</td>
                      <td className="px-3 py-3">{account.arr}</td>
                      <td className="px-3 py-3">{account.seats}</td>
                      <td className="rounded-r-lg px-3 py-3">{account.plan}</td>
                    </tr>
                  ))}
                  {visibleAccounts.length === 0 ? (
                    <tr>
                      <td className="rounded-lg bg-slate-50 px-3 py-3 text-slate-500" colSpan={4}>
                        No accounts found
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === 'users' ? (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">Workspace Users</h3>
            <p className="mt-1 text-sm text-slate-500">
              Manage user roles and account status directly from the dashboard.
            </p>

            <div className="mt-4 overflow-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="rounded-lg bg-slate-50 text-slate-700">
                      <td className="rounded-l-lg px-3 py-3">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={user.role}
                          onChange={(event) =>
                            void handleUserRoleChange(user.id, event.target.value as UserRole)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={user.status}
                          onChange={(event) =>
                            void handleUserStatusChange(user.id, event.target.value as UserStatus)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                        >
                          <option value="active">active</option>
                          <option value="invited">invited</option>
                          <option value="suspended">suspended</option>
                        </select>
                      </td>
                      <td className="rounded-r-lg px-3 py-3 text-slate-500">{user.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeView === 'security' ? (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>
            <p className="text-sm text-slate-500">
              Configure authentication and session controls for your workspace.
            </p>

            {securityDraft ? (
              <>
                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="text-sm font-medium text-slate-700">Require SSO</span>
                  <input
                    type="checkbox"
                    checked={securityDraft.ssoRequired}
                    onChange={(event) =>
                      setSecurityDraft((previous) =>
                        previous
                          ? {
                              ...previous,
                              ssoRequired: event.target.checked,
                            }
                          : previous,
                      )
                    }
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="text-sm font-medium text-slate-700">Require MFA</span>
                  <input
                    type="checkbox"
                    checked={securityDraft.mfaRequired}
                    onChange={(event) =>
                      setSecurityDraft((previous) =>
                        previous
                          ? {
                              ...previous,
                              mfaRequired: event.target.checked,
                            }
                          : previous,
                      )
                    }
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Session Timeout (minutes)
                  <select
                    value={securityDraft.sessionTimeoutMinutes}
                    onChange={(event) =>
                      setSecurityDraft((previous) =>
                        previous
                          ? {
                              ...previous,
                              sessionTimeoutMinutes: Number(event.target.value),
                            }
                          : previous,
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                    <option value={240}>240</option>
                  </select>
                </label>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <KeyRound size={16} /> API key last rotated
                  </span>
                  <span>
                    {security
                      ? new Date(security.apiKeyLastRotated).toLocaleDateString()
                      : 'Unavailable'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSecuritySave()}
                  className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Save Security Settings
                </button>
              </>
            ) : null}
          </section>
        ) : null}

        {selectedMetric ? (
          <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/30 p-4" role="presentation">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="metric-detail-title"
              className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Metric detail</p>
                  <h3 id="metric-detail-title" className="mt-1 text-xl font-semibold text-slate-900">
                    {selectedMetric.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMetric(null)}
                  aria-label="Close metric detail"
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Current value</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedMetric.value}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Period change</p>
                  <div className="mt-2">
                    <TrendBadge trend={selectedMetric.trend} delta={selectedMetric.delta} />
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                This KPI is calculated from the latest workspace revenue and customer activity snapshot. Use the export control to share the current view with your team.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedMetric(null)
                  exportReport()
                }}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                <Download size={15} /> Export report
              </button>
            </section>
          </div>
        ) : null}
      </main>
      </div>
    </div>
  )
}

export default App
