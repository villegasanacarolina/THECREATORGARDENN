import { useState } from 'react'

const StatCard = ({ label, value }) => (
  <div className='rounded border border-white/20 p-4'>
    <p className='font-[font1] text-xs uppercase tracking-wide text-white/60'>{label}</p>
    <p className='font-[font2] text-3xl'>{value}</p>
  </div>
)

const ListCard = ({ title, rows }) => (
  <div className='rounded border border-white/20 p-4'>
    <p className='mb-3 font-[font1] text-xs uppercase tracking-wide text-white/60'>{title}</p>
    {rows.length === 0 && <p className='font-[font1] text-sm text-white/40'>Sin datos todavía</p>}
    <ul className='space-y-1'>
      {rows.map((row) => (
        <li key={row._id} className='flex items-center justify-between gap-3 font-[font1] text-sm'>
          <span className='truncate'>{row._id || '—'}</span>
          <span className='shrink-0 text-white/60'>{row.count}</span>
        </li>
      ))}
    </ul>
  </div>
)

const AdminDashboard = ({ stats, onRefresh }) => {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
  }

  if (!stats) return null

  const maxDaily = Math.max(1, ...stats.dailyViews.map((d) => d.count))

  return (
    <div className='min-h-screen bg-black px-6 py-10 text-white lg:px-16'>
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='font-[font2] text-4xl uppercase'>Estadísticas</h1>
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={onRefresh}
            className='rounded-full border border-white/40 px-4 py-2 font-[font1] text-sm hover:border-[#D3FD50] hover:text-[#D3FD50]'
          >
            Actualizar
          </button>
          <button
            type='button'
            onClick={handleLogout}
            disabled={loggingOut}
            className='rounded-full border border-white/40 px-4 py-2 font-[font1] text-sm hover:border-red-400 hover:text-red-400 disabled:opacity-50'
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className='mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6'>
        <StatCard label='Vistas totales' value={stats.totalViews} />
        <StatCard label='Últimas 24h' value={stats.views24h} />
        <StatCard label='Últimos 7 días' value={stats.views7d} />
        <StatCard label='Últimos 30 días' value={stats.views30d} />
        <StatCard label='Visitantes únicos' value={stats.uniqueVisitorsAll} />
        <StatCard label='Únicos (30 días)' value={stats.uniqueVisitors30d} />
      </div>

      <div className='mb-8 rounded border border-white/20 p-4'>
        <p className='mb-4 font-[font1] text-xs uppercase tracking-wide text-white/60'>Vistas por día (últimos 30 días)</p>
        {stats.dailyViews.length === 0 ? (
          <p className='font-[font1] text-sm text-white/40'>Sin datos todavía</p>
        ) : (
          <div className='flex h-32 items-end gap-1'>
            {stats.dailyViews.map((d) => (
              <div
                key={d._id}
                title={`${d._id}: ${d.count}`}
                className='min-h-[2px] flex-1 bg-[#D3FD50]'
                style={{ height: `${(d.count / maxDaily) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <ListCard title='Páginas más vistas' rows={stats.topPages} />
        <ListCard title='Referidos' rows={stats.topReferrers} />
        <ListCard title='Países' rows={stats.topCountries} />
        <ListCard title='Dispositivos' rows={stats.deviceBreakdown} />
        <ListCard title='Navegadores' rows={stats.browserBreakdown} />
      </div>
    </div>
  )
}

export default AdminDashboard
