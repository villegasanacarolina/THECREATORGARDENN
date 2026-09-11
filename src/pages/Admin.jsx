import { useCallback, useEffect, useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'

const Admin = () => {
  const [status, setStatus] = useState('checking')
  const [stats, setStats] = useState(null)
  const [range, setRange] = useState('30d')
  const [loading, setLoading] = useState(false)

  const loadStats = useCallback(async (nextRange = range, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await fetch(`/api/stats?range=${encodeURIComponent(nextRange)}`)
      if (res.status === 401) {
        setStatus('loggedOut')
        return
      }
      if (!res.ok) {
        setStatus('loggedOut')
        return
      }
      const data = await res.json()
      setStats(data)
      setStatus('loggedIn')
    } catch {
      if (status === 'checking') setStatus('loggedOut')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [range, status])

  useEffect(() => {
    loadStats(range)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (status !== 'loggedIn') return undefined
    const interval = window.setInterval(() => loadStats(range, true), 60000)
    return () => window.clearInterval(interval)
  }, [status, range, loadStats])

  const handleRangeChange = (nextRange) => {
    setRange(nextRange)
    loadStats(nextRange)
  }

  if (status === 'checking') {
    return <div className='flex min-h-screen items-center justify-center bg-black font-[font1] text-white'>Cargando…</div>
  }

  if (status === 'loggedOut') {
    return <AdminLogin onSuccess={() => loadStats(range)} />
  }

  return (
    <AdminDashboard
      stats={stats}
      range={range}
      loading={loading}
      onRangeChange={handleRangeChange}
      onRefresh={() => loadStats(range)}
    />
  )
}

export default Admin
