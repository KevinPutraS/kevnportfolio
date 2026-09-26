'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Status = 'idle' | 'submitting' | 'error'

/**
 * Admin sign-in.
 *
 * Credentials are exchanged with Supabase Auth via `/api/auth/signin`; this
 * app never handles a password itself and stores nothing client-side. There
 * are no demo or hard-coded accounts.
 */
export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        // Only allow same-site relative redirects, never an absolute URL.
        const target = nextPath?.startsWith('/admin') ? nextPath : '/admin'
        router.replace(target)
        router.refresh()
        return
      }

      const payload = (await response.json().catch(() => ({}))) as { message?: string }
      setStatus('error')
      setMessage(payload.message ?? 'Could not sign in. Please try again.')
    } catch {
      setStatus('error')
      setMessage('Could not reach the server. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm">
      <div className="space-y-5">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          disabled={status === 'submitting'}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          disabled={status === 'submitting'}
        />
      </div>

      <p role="alert" aria-live="assertive" className={message ? 'field-error mt-5' : 'sr-only'}>
        {message}
      </p>

      <Button
        type="submit"
        size="lg"
        loading={status === 'submitting'}
        className="mt-8 w-full"
      >
        {status === 'submitting' ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
