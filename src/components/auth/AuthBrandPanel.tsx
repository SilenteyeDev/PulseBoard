import { LayoutDashboard, Sparkles } from 'lucide-react'

const FACTS = [
  ['$161.4k', 'revenue this month'],
  ['2,849', 'active customers'],
  ['2.8%', 'churn, still falling'],
]

export function AuthBrandPanel() {
  return (
    <section className="relative hidden overflow-hidden border-r border-line bg-surf p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div className="tp-fx" aria-hidden="true" />

      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-theme-sm [background-image:var(--tp-grad)] text-acc-ink">
          <LayoutDashboard size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-tight text-ink">PulseBoard</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Revenue, made calm</span>
        </span>
      </div>

      <div className="max-w-lg">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acc">Every number, one calm screen</p>
        <h1 className="tp-display mt-5 text-[44px] text-ink xl:text-[56px]">
          Your balance, your churn, your growth. All calm.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-mute">
          PulseBoard watches revenue, accounts and retention so your team only reads what moved.
        </p>

        <div className="mt-9 rounded-theme-lg border border-line bg-surf-2 p-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">This month</p>
            <span className="inline-flex items-center gap-1.5 rounded-theme-btn border border-acc/40 bg-acc/12 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-acc">
              <Sparkles size={11} /> Live
            </span>
          </div>
          <p className="mt-3 font-mono text-[40px] font-semibold leading-none tracking-[-0.05em] text-ink">
            $161,400
          </p>
          <p className="mt-2 text-xs text-mute">+12.4% against last month</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {FACTS.map(([value, label]) => (
              <div key={label} className="border-l border-line pl-3">
                <p className="font-mono text-sm font-semibold text-ink">{value}</p>
                <p className="mt-1 text-[11px] leading-4 text-mute">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <figure className="max-w-lg rounded-theme border border-line bg-surf-2 p-5">
        <blockquote className="text-sm leading-6 text-ink">
          “We open PulseBoard once a day. Everything else is quiet now.”
        </blockquote>
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          Dana Whitfield · Head of Revenue, Northbeam
        </figcaption>
      </figure>
    </section>
  )
}
