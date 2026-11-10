import { Download } from 'lucide-react'
import { NAV_ITEMS } from './navigation'
import type { ViewName } from './navigation'

type MobileTabBarProps = {
  activeView: ViewName
  onSelectView: (view: ViewName) => void
  onExport: () => void
}

const LEFT = NAV_ITEMS.slice(0, 2)
const RIGHT = NAV_ITEMS.slice(2)

export function MobileTabBar({ activeView, onSelectView, onExport }: MobileTabBarProps) {
  const renderTab = (id: ViewName) => {
    const item = NAV_ITEMS.find((entry) => entry.id === id)!
    const Icon = item.icon
    const active = activeView === item.id
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelectView(item.id)}
        aria-current={active ? 'page' : undefined}
        className={`tp-press flex min-h-12 flex-col items-center justify-center gap-1 rounded-theme-btn px-1 ${
          active ? 'text-acc' : 'text-mute'
        }`}
      >
        <Icon size={18} />
        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{item.label}</span>
      </button>
    )
  }

  return (
    <nav
      aria-label="Workspace sections"
      className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 items-center gap-1 rounded-theme-lg border border-line bg-surf/95 px-2 pb-2 pt-3 shadow-theme backdrop-blur lg:hidden"
    >
      {LEFT.map((item) => renderTab(item.id))}

      <button
        type="button"
        onClick={onExport}
        className="tp-press mx-auto -mt-7 grid h-12 w-12 place-items-center rounded-theme-btn [background-image:var(--tp-grad)] text-acc-ink shadow-theme-sm"
        aria-label="Export report"
        title="Export report"
      >
        <Download size={18} />
      </button>

      {RIGHT.map((item) => renderTab(item.id))}
    </nav>
  )
}
