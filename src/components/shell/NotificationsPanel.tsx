import type { NotificationItem } from '../../types/dashboard'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/StateScreens'

type NotificationsPanelProps = {
  notifications: NotificationItem[]
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
}

export function NotificationsPanel({ notifications, onMarkRead, onMarkAllRead }: NotificationsPanelProps) {
  const unread = notifications.filter((item) => !item.read).length

  return (
    <section
      aria-label="Notifications"
      className="tp-sheet-in absolute right-0 top-11 z-30 w-[min(20rem,calc(100vw-2.5rem))] rounded-theme border border-line bg-surf p-3 shadow-theme"
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
          {unread > 0 ? `${unread} unread` : 'All clear'}
        </p>
        <Button size="sm" variant="ghost" onClick={onMarkAllRead} disabled={unread === 0}>
          Mark all read
        </Button>
      </div>

      <div className="mt-2 max-h-72 space-y-2 overflow-auto tp-scroll">
        {notifications.length === 0 ? (
          <EmptyState title="Nothing new" description="Quiet is good. We will flag anything that moves." />
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-theme-sm border px-3 py-2.5 ${
                notification.read ? 'border-line/60 bg-transparent' : 'border-acc/30 bg-acc/[0.06]'
              }`}
            >
              <p className={`text-sm font-medium ${notification.read ? 'text-mute' : 'text-ink'}`}>
                {notification.title}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-mute">{notification.message}</p>
              <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-mute">
                <span>{notification.createdAt}</span>
                {notification.read ? null : (
                  <button
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                    className="font-semibold text-acc hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
