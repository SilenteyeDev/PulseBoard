import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase, supabaseConfigured } from '../../lib/supabase'

export type AuthMode = 'sign-in' | 'register' | 'reset'

export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formNotice, setFormNotice] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next: AuthMode) {
    setMode(next)
    setFormError(null)
    setFormNotice(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFormNotice(null)

    if (!supabaseConfigured || !supabase) {
      setFormError('Supabase is not configured. Add the required VITE_SUPABASE environment variables.')
      return
    }

    if (mode === 'register' && !fullName.trim()) {
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
      setFormNotice('Reset link sent. Check your inbox, then sign in.')
      setMode('sign-in')
      return
    }

    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        })

    setSubmitting(false)
    if (result.error) {
      setFormError(result.error.message)
      return
    }

    if (mode === 'register' && !result.data.session) {
      setFormNotice('Account created. Confirm your email, then sign in.')
      setMode('sign-in')
      setPassword('')
      setConfirmPassword('')
      return
    }

    setFormNotice('Signed in. Welcome back.')
  }

  return {
    mode,
    switchMode,
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    formError,
    formNotice,
    setFormError,
    submitting,
    handleSubmit,
  }
}
