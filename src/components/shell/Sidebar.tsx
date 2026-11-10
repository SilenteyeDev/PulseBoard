import { LayoutDashboard, LogOut } from 'lucide-react'
import { NAV_ITEMS } from './navigation'
import type { ViewName } from './navigation'

type SidebarProps = {
  activeView: ViewName
  onSelectView: (view: ViewName) => void
  demoMode: boolean
  onSignOut: () => void
}

export function Sidebar({ activeView, onSelectView, demoMode, onSignOut }: SidebarProps) {
  return (
    <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[248px] shrink-0 flex-col rounded-theme-lg border border-line bg-surf p-5 lg:flex">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-theme-sm [background-image:var(--tp-grad)] text-acc-ink">
          <LayoutDashboard size={18} />
        </span>
        <span>
          <span className="block text-[15px] font-semibold tracking-tight text-ink">PulseBoard</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Revenue, made calm</span>
        </span>
      </div>

      <nav className="mt-8 flex-1 space-y-1.5" aria-label="Workspace sections">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = activeView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`tp-press flex w-full items-center gap-3 rounded-theme-btn border px-3.5 py-2.5 text-left text-sm font-medium ${
                active
                  ? 'border-transparent bg-acc text-acc-ink'
                  : 'border-transparent text-mute hover:bg-surf-2 hover:text-ink'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="rounded-theme border border-line bg-surf-2 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">Environment</p>
          <span
            className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
              demoMode ? 'text-acc-2' : 'text-acc'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${demoMode ? 'bg-acc-2' : 'bg-acc'}`} />
            {demoMode ? 'Demo' : 'Live'}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-mute">
          {demoMode ? 'Sample numbers. Edits stay in this browser.' : 'Connected to your Supabase workspace.'}
        </p>
        <button
          type="button"
          onClick={onSignOut}
          className="tp-press mt-3 inline-flex min-h-9 items-center gap-2 rounded-theme-btn px-1 text-xs font-medium text-mute hover:text-ink"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  )
}
