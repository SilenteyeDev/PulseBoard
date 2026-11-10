import { Bell, Download, RefreshCw, Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import type { NotificationItem } from '../../types/dashboard'
import { formatUpdatedAt, greetingFor } from '../../lib/format'
import { IconButton } from '../ui/IconButton'
import { Button } from '../ui/Button'
import { NotificationsPanel } from './NotificationsPanel'
import { ControlsPanel } from './ControlsPanel'
import type { NavItem } from './navigation'

type TopBarProps = {
  view: NavItem
  userName: string
  demoMode: boolean
  updatedAt: string
  query: string
  searchPlaceholder: string
  searchDisabled: boolean
  searching: boolean
  onQueryChange: (value: string) => void
  onSearch: () => void
  onClearSearch: () => void
  onRefresh: () => void
  refreshing: boolean
  onExport: () => void
  notifications: NotificationItem[]
  unreadCount: number
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export function TopBar({
  view,
  userName,
  demoMode,
  updatedAt,
  query,
  searchPlaceholder,
  searchDisabled,
  searching,
  onQueryChange,
  onSearch,
  onClearSearch,
  onRefresh,
  refreshing,
  onExport,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
}: TopBarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [controlsOpen, setControlsOpen] = useState(false)

  return (
    <header className="relative rounded-theme-lg border border-line bg-surf p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
            {view.kicker} <span className="text-line">/</span> <span className="text-acc">{view.label}</span>
          </p>
          <h1 className="tp-display mt-2 text-[26px] text-ink sm:text-[30px]">
            {greetingFor(new Date())}, {userName}.
          </h1>
          <p className="mt-1.5 font-mono text-[11px] tracking-[0.02em] text-mute">
            Updated {formatUpdatedAt(updatedAt)} · {demoMode ? 'demo data' : 'live workspace'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`flex min-h-9 items-center gap-2 rounded-theme-btn border border-line bg-surf-2 px-3 text-sm ${
              searchDisabled ? 'opacity-50' : ''
            }`}
          >
            <Search size={14} className="text-mute" aria-hidden="true" />
            <input
              aria-label={searchPlaceholder}
              className="w-32 border-none bg-transparent text-ink outline-none placeholder:text-mute/70 sm:w-44"
              placeholder={searchPlaceholder}
              value={query}
              disabled={searchDisabled}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onSearch()
                }
              }}
            />
            {query ? (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search"
                className="text-mute hover:text-ink"
              >
                <X size={13} />
              </button>
            ) : null}
          </label>

          <Button size="sm" variant="secondary" onClick={onSearch} disabled={searchDisabled || searching} className="min-h-9">
            {searching ? 'Searching' : 'Search'}
          </Button>

          <IconButton label="Refresh numbers" onClick={onRefresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </IconButton>

          <Button size="sm" variant="secondary" onClick={onExport} className="hidden min-h-9 sm:inline-flex">
            <Download size={14} /> Export
          </Button>

          <div className="flex items-center gap-2 rounded-theme-btn border border-line bg-surf-2 px-1 py-1 sm:hidden">
            <span className="grid h-7 w-7 place-items-center rounded-theme-btn bg-acc text-[11px] font-semibold text-acc-ink">
              {userName.slice(0, 1).toUpperCase()}
            </span>
          </div>

          <span className="hidden items-center gap-2 rounded-theme-btn border border-line bg-surf-2 py-1 pl-1 pr-3 sm:flex">
            <span className="grid h-7 w-7 place-items-center rounded-theme-btn bg-acc text-[11px] font-semibold text-acc-ink">
              {userName.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-32 truncate text-xs font-medium text-ink">{userName}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          <span className={`h-1.5 w-1.5 rounded-full ${demoMode ? 'bg-acc-2' : 'bg-acc'}`} />
          {demoMode ? 'Demo workspace' : 'Live workspace'}
        </p>

        <div className="relative flex items-center gap-2">
          <IconButton
            label="Workspace controls"
            active={controlsOpen}
            onClick={() => {
              setControlsOpen((value) => !value)
              setNotificationsOpen(false)
            }}
          >
            <SlidersHorizontal size={15} />
          </IconButton>

          <span className="relative">
            <IconButton
              label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              active={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((value) => !value)
                setControlsOpen(false)
              }}
            >
              <Bell size={15} />
            </IconButton>
            {unreadCount > 0 ? (
              <span className="pointer-events-none absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-theme-btn bg-acc px-1 font-mono text-[9px] font-bold text-acc-ink">
                {unreadCount}
              </span>
            ) : null}
          </span>

          {notificationsOpen ? (
            <NotificationsPanel
              notifications={notifications}
              onMarkRead={onMarkRead}
              onMarkAllRead={onMarkAllRead}
            />
          ) : null}

          {controlsOpen ? (
            <ControlsPanel onExport={onExport} onClose={() => setControlsOpen(false)} />
          ) : null}
        </div>
      </div>
    </header>
  )
}
