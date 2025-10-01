'use client'
import { useState } from 'react'

export default function GenerateWeeklyButton() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true); setMsg(null)
    try {
      const res = await fetch('/api/weekly-note', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')
      setMsg('Weekly note generated.')
      // simple refresh
      window.location.reload()
    } catch (e: any) {
      setMsg(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-xl border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate Weekly Note'}
      </button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  )
}
