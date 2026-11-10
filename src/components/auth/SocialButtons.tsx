import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'

type Provider = 'apple' | 'google'

type SocialButtonsProps = {
  onError: (message: string) => void
}

function AppleMark() {
  return (
    <svg width="15" height="16" viewBox="0 0 15 16" fill="currentColor" aria-hidden="true">
      <path d="M11.02 8.47c-.01-1.5.82-2.66 2.47-3.5-.9-1.29-2.26-2-4.06-2.13-1.16-.09-2.43.68-2.9.68-.5 0-1.62-.65-2.5-.65C2.1 2.9.24 4.36.24 7.3c0 1.31.24 2.66 1.05 4.06.73 1.24 1.75 2.75 3.22 2.7 1.16-.04 1.6-.75 2.99-.75 1.38 0 1.78.75 3 .73 1.24-.02 2.14-1.26 2.9-2.5.64-1.05.9-1.58 1.4-2.77-2.2-.83-2.77-2.06-2.78-3.3ZM8.9 1.5c.9-1.08.62-2.2.55-2.5-.96.06-2.08.66-2.72 1.4-.7.79-1.11 1.77-1.02 2.84 1.06.08 2.03-.5 2.72-1.24" />
    </svg>
  )
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.77 24c0-1.6.27-3.15.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.85.92 7.5 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}

export function SocialButtons({ onError }: SocialButtonsProps) {
  const [pending, setPending] = useState<Provider | null>(null)

  async function handleOAuth(provider: Provider) {
    if (!supabaseConfigured || !supabase) {
      onError('Supabase is not configured. Add the VITE_SUPABASE environment variables.')
      return
    }

    setPending(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    setPending(null)

    if (error) {
      onError(
        provider === 'apple'
          ? 'Apple sign-in is not enabled for this workspace yet.'
          : 'Google sign-in is not enabled for this workspace yet.',
      )
    }
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => void handleOAuth('apple')}
        disabled={pending !== null}
        className="tp-press inline-flex min-h-11 items-center justify-center gap-2 rounded-theme-btn border border-black bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending === 'apple' ? <LoaderCircle size={15} className="animate-spin" /> : <AppleMark />}
        Continue with Apple
      </button>
      <button
        type="button"
        onClick={() => void handleOAuth('google')}
        disabled={pending !== null}
        className="tp-press inline-flex min-h-11 items-center justify-center gap-2 rounded-theme-btn border bg-white px-4 py-3 text-sm font-semibold disabled:opacity-60"
        style={{ borderColor: '#dadce0', color: '#1f1f1f' }}
      >
        {pending === 'google' ? <LoaderCircle size={15} className="animate-spin" /> : <GoogleMark />}
        Continue with Google
      </button>
    </div>
  )
}
