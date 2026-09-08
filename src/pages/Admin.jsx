import { useEffect, useState } from 'react'
import AdminLogin from '../components/admin/AdminLogin'
import AdminDashboard from '../components/admin/AdminDashboard'

const Admin = () => {
  const [status, setStatus] = useState('checking') // checking | loggedOut | loggedIn
  const [stats, setStats] = useState(null)

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
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
      setStatus('loggedOut')
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (status === 'checking') {
    return <div className='flex min-h-screen items-center justify-center bg-black font-[font1] text-white'>Cargando…</div>
  }

  if (status === 'loggedOut') {
    return <AdminLogin onSuccess={loadStats} />
  }

  return <AdminDashboard stats={stats} onRefresh={loadStats} />
}

export default Admin
