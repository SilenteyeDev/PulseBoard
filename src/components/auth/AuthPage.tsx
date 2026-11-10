import { CheckCircle2, Eye, EyeOff, LayoutDashboard, LoaderCircle, LockKeyhole, LogIn, Mail, Radar } from 'lucide-react'
import { AuthBrandPanel } from './AuthBrandPanel'
import { SocialButtons } from './SocialButtons'
import { useAuthForm } from './useAuthForm'
import type { AuthMode } from './useAuthForm'
import { Field } from '../ui/Field'
import { IconButton } from '../ui/IconButton'

const SEGMENTS: { id: AuthMode; label: string }[] = [
  { id: 'register', label: 'Sign up' },
  { id: 'sign-in', label: 'Log in' },
]

const HEADINGS: Record<AuthMode, { title: string; body: string }> = {
  'sign-in': { title: 'Welcome back.', body: 'One screen. Every number that moved.' },
  register: { title: 'Open your workspace.', body: 'Start with a clean view of revenue and churn.' },
  reset: { title: 'Reset your password.', body: 'We send one secure link. Nothing else changes.' },
}

const CTA_LABELS: Record<AuthMode, string> = {
  'sign-in': 'Log in to PulseBoard',
  register: 'Create workspace',
  reset: 'Send reset link',
}

export function AuthPage({ onDemo }: { onDemo: () => void }) {
  const form = useAuthForm()
  const heading = HEADINGS[form.mode]

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto grid min-h-screen w-full max-w-[1560px] lg:grid-cols-[1.05fr_1fr]">
        <AuthBrandPanel />

        <main className="flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-[480px]">
            <div className="mb-9 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-theme-sm [background-image:var(--tp-grad)] text-acc-ink">
                <LayoutDashboard size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold tracking-tight text-ink">PulseBoard</span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-mute">Revenue, made calm</span>
              </span>
            </div>

            {form.mode !== 'reset' ? (
              <div className="mb-7 grid grid-cols-2 gap-1 rounded-theme-btn border border-line bg-surf-2 p-1">
                {SEGMENTS.map((segment) => (
                  <button
                    key={segment.id}
                    type="button"
                    onClick={() => form.switchMode(segment.id)}
                    className={`tp-press min-h-10 rounded-theme-btn px-3 text-sm font-semibold transition-colors duration-[var(--tp-dur)] ${
                      form.mode === segment.id
                        ? 'bg-acc text-acc-ink'
                        : 'text-mute hover:text-ink'
                    }`}
                  >
                    {segment.label}
                  </button>
                ))}
              </div>
            ) : null}

            <h2 className="tp-display text-[32px] text-ink sm:text-[40px]">{heading.title}</h2>
            <p className="mt-3 text-sm leading-6 text-mute">{heading.body}</p>

            {form.mode !== 'reset' ? (
              <>
                <div className="mt-7">
                  <SocialButtons onError={form.setFormError} />
                </div>
                <div className="my-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mute">
                  <span className="h-px flex-1 bg-line" />
                  or
                  <span className="h-px flex-1 bg-line" />
                </div>
              </>
            ) : null}

            <form onSubmit={form.handleSubmit} className="space-y-4">
              {form.mode === 'register' ? (
                <Field
                  label="Full name"
                  value={form.fullName}
                  onChange={(event) => form.setFullName(event.target.value)}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                />
              ) : null}

              <Field
                label="Work email"
                type="email"
                icon={<Mail size={15} />}
                value={form.email}
                onChange={(event) => form.setEmail(event.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />

              {form.mode !== 'reset' ? (
                <Field
                  label="Password"
                  type={form.showPassword ? 'text' : 'password'}
                  icon={<LockKeyhole size={15} />}
                  value={form.password}
                  onChange={(event) => form.setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete={form.mode === 'sign-in' ? 'current-password' : 'new-password'}
                  trailing={
                    <IconButton
                      label={form.showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => form.setShowPassword(!form.showPassword)}
                    >
                      {form.showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </IconButton>
                  }
                />
              ) : null}

              {form.mode === 'register' ? (
                <Field
                  label="Confirm password"
                  type={form.showPassword ? 'text' : 'password'}
                  icon={<LockKeyhole size={15} />}
                  value={form.confirmPassword}
                  onChange={(event) => form.setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              ) : null}

              {form.mode === 'sign-in' ? (
                <button
                  type="button"
                  onClick={() => form.switchMode('reset')}
                  className="text-xs font-medium text-mute underline-offset-4 hover:text-ink hover:underline"
                >
                  Forgot password?
                </button>
              ) : null}

              {form.mode === 'reset' ? (
                <button
                  type="button"
                  onClick={() => form.switchMode('sign-in')}
                  className="text-xs font-medium text-mute underline-offset-4 hover:text-ink hover:underline"
                >
                  Back to log in
                </button>
              ) : null}

              {form.formError ? (
                <p role="alert" className="rounded-theme-sm border border-acc-2/40 bg-acc-2/12 px-3 py-2 text-xs leading-5 text-acc-2">
                  {form.formError}
                </p>
              ) : null}
              {form.formNotice ? (
                <p role="status" className="rounded-theme-sm border border-acc/40 bg-acc/12 px-3 py-2 text-xs leading-5 text-acc">
                  {form.formNotice}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={form.submitting}
                className="tp-press flex min-h-12 w-full items-center justify-center gap-2 rounded-theme-btn bg-acc px-4 text-sm font-semibold text-acc-ink shadow-theme-sm disabled:opacity-60"
              >
                {form.submitting ? <LoaderCircle size={16} className="animate-spin" /> : <LogIn size={16} />}
                {form.submitting ? 'Working...' : CTA_LABELS[form.mode]}
              </button>
            </form>

            <button
              type="button"
              onClick={onDemo}
              className="tp-press mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-theme-btn border border-line bg-transparent px-4 text-sm font-medium text-ink hover:border-acc/50 hover:bg-surf-2"
            >
              <Radar size={16} /> Preview with demo data
            </button>

            <div className="mt-7 flex items-start gap-2 border-t border-line pt-5 text-xs leading-5 text-mute">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-acc" />
              <p>Encrypted in transit. Role-based access. No payment due now.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
