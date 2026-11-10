import { AlertCircle, LoaderCircle } from 'lucide-react'
import { Button } from './Button'

export function LoadingState() {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-sm rounded-theme-lg border border-line bg-surf p-8 text-center">
        <LoaderCircle className="mx-auto animate-spin text-acc" size={22} />
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mute">Balancing the books</p>
        <p className="mt-2 text-sm text-mute">One moment while we load your numbers.</p>
        <div className="mt-6 space-y-2.5">
          {[92, 74, 58].map((width) => (
            <div key={width} className="h-2 overflow-hidden rounded-theme-btn bg-surf-2">
              <div
                className="h-full rounded-theme-btn bg-line"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-md rounded-theme-lg border border-line bg-surf p-8">
        <span className="inline-flex items-center gap-2 rounded-theme-btn border border-acc-2/40 bg-acc-2/12 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-acc-2">
          <AlertCircle size={12} /> Off balance
        </span>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">We could not load your numbers.</h2>
        <p className="mt-2 text-sm leading-6 text-mute">{message}</p>
        <Button variant="primary" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  )
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-theme border border-dashed border-line bg-surf-2/40 px-4 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-xs leading-5 text-mute">{description}</p>
    </div>
  )
}
