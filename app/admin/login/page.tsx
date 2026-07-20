'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? 'Não foi possível entrar.')
      }

      router.replace('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080808' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[380px] flex flex-col gap-6 px-8 py-10"
        style={{ background: '#0D0D0D', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Image src="/images/logo.png" alt="Malds Maker" width={140} height={38} className="h-8 w-auto object-contain" />
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: '#C9A84C' }} />
            <span className="font-mono-mm text-[10px] tracking-[0.14em]" style={{ color: '#888' }}>
              ÁREA RESTRITA
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="font-mono-mm text-[10px] tracking-[0.12em]" style={{ color: '#666' }}>
              USUÁRIO
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="h-11 px-3 font-body text-sm outline-none"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', color: '#F2F2F2' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="font-mono-mm text-[10px] tracking-[0.12em]" style={{ color: '#666' }}>
              SENHA
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="h-11 px-3 font-body text-sm outline-none"
              style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)', color: '#F2F2F2' }}
            />
          </div>
        </div>

        {error && (
          <p
            className="font-mono-mm text-[10px] tracking-[0.06em] px-3 py-2"
            style={{ background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.3)', color: '#F1948A' }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 font-mono-mm text-[11px] tracking-[0.14em] transition-opacity duration-200 disabled:opacity-50"
          style={{ background: '#C9A84C', color: '#080808' }}
        >
          {loading ? 'ENTRANDO...' : 'ENTRAR'}
        </button>
      </form>
    </div>
  )
}
