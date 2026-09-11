import { useCallback, useEffect, useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'

const Admin = () => {
  const [status, setStatus] = useState('checking')
  const [stats, setStats] = useState(null)
  const [range, setRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const loadStats = useCallback(async (nextRange = range, silent = false) => {
    if (!silent) {
      setLoading(true)
      setActionMessage('')
    }
    try {
      const res = await fetch(`/api/stats?range=${encodeURIComponent(nextRange)}&t=${Date.now()}`, {
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (res.status === 401) {
        setStatus('loggedOut')
        return false
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStats(data)
      setStatus('loggedIn')
      if (!silent) setActionMessage('Datos actualizados')
      return true
    } catch (err) {
      console.error('admin refresh error', err)
      if (status === 'checking') setStatus('loggedOut')
      else if (!silent) setActionMessage('No se pudieron actualizar los datos')
      return false
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


  const handleLogout = useCallback(async () => {
    setActionMessage('Cerrando sesión…')
    try {
      const res = await fetch('/api/admin-logout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
    } catch (err) {
      console.error('admin logout error', err)
    } finally {
      setStats(null)
      setStatus('loggedOut')
      setActionMessage('')
    }
  }, [])

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
      onLogout={handleLogout}
      actionMessage={actionMessage}
    />
  )
}

export default Admin
