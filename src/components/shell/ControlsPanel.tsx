import { Download, FileSpreadsheet, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'

type ControlsPanelProps = {
  onExport: () => void
  onClose: () => void
}

export function ControlsPanel({ onExport, onClose }: ControlsPanelProps) {
  return (
    <section
      aria-label="Workspace controls"
      className="tp-sheet-in absolute right-0 top-11 z-30 w-[min(18rem,calc(100vw-2.5rem))] rounded-theme border border-line bg-surf p-4 shadow-theme"
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Controls</p>
        <IconButton label="Close controls" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="mt-3 space-y-2">
        <Button variant="secondary" className="w-full justify-start" onClick={onExport}>
          <FileSpreadsheet size={15} /> Export this report
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={onExport}>
          <Download size={15} /> Download KPI snapshot
        </Button>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-mute">
        The export carries the selected revenue window and the current KPI snapshot.
      </p>
    </section>
  )
}
