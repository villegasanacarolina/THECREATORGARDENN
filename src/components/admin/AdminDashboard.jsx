import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

const ACCENT = '#D3FD50'
const PIE_COLORS = ['#D3FD50', '#8b8b8b', '#4a4a4a', '#ffffff']

const tooltipStyle = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 4,
  fontFamily: 'font1',
  fontSize: 12,
  color: '#fff',
}

const StatCard = ({ label, value }) => (
  <div className='rounded border border-white/20 p-4'>
    <p className='font-[font1] text-xs uppercase tracking-wide text-white/60'>{label}</p>
    <p className='font-[font2] text-3xl'>{value}</p>
  </div>
)

const ChartCard = ({ title, children, height = 220 }) => (
  <div className='rounded border border-white/20 p-4'>
    <p className='mb-3 font-[font1] text-xs uppercase tracking-wide text-white/60'>{title}</p>
    <div style={{ width: '100%', height }}>{children}</div>
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

const formatDuration = (ms) => {
  if (!ms) return '—'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}m ${rest}s`
}

// 'YYYY-MM-DD' -> 'DD/MM', para que el eje no se vea saturado
const formatDayTick = (value) => {
  const parts = value.split('-')
  if (parts.length !== 3) return value
  return `${parts[2]}/${parts[1]}`
}

// Recorta labels largos (ids de páginas, referidos, etc.) para que no se
// salgan del eje de la gráfica.
const truncate = (value, max = 18) => (value && value.length > max ? `${value.slice(0, max)}…` : value || '—')

const AdminDashboard = ({ stats, onRefresh }) => {
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
  }

  if (!stats) return null

  const topPagesChart = stats.topPages.map((r) => ({ ...r, label: truncate(r._id) }))
  const topCountriesChart = stats.topCountries.map((r) => ({ ...r, label: truncate(r._id) }))
  const topEventsChart = stats.topEvents.map((r) => ({ ...r, label: truncate(r._id) }))
  const topProjectsChart = stats.topClickedProjects.map((r) => ({ ...r, label: truncate(r._id) }))

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

      {/* Números clave */}
      <div className='mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6'>
        <StatCard label='Vistas totales' value={stats.totalViews} />
        <StatCard label='Últimas 24h' value={stats.views24h} />
        <StatCard label='Últimos 7 días' value={stats.views7d} />
        <StatCard label='Últimos 30 días' value={stats.views30d} />
        <StatCard label='Visitantes únicos' value={stats.uniqueVisitorsAll} />
        <StatCard label='Únicos (30 días)' value={stats.uniqueVisitors30d} />
      </div>

      <div className='mb-8 grid grid-cols-2 gap-4'>
        <StatCard label='Tiempo promedio en página' value={formatDuration(stats.avgDurationMs)} />
        <StatCard label='Scroll promedio' value={stats.avgScrollPercent != null ? `${Math.round(stats.avgScrollPercent)}%` : '—'} />
      </div>

      {/* Gráficas — solo las que de verdad muestran un patrón útil */}
      <div className='mb-4'>
        <p className='mb-3 font-[font1] text-sm uppercase tracking-wide text-white/40'>Tendencia</p>
        <ChartCard title='Vistas por día (últimos 30 días)' height={240}>
          <ResponsiveContainer>
            <LineChart data={stats.dailyViews}>
              <CartesianGrid stroke='rgba(255,255,255,0.1)' vertical={false} />
              <XAxis dataKey='_id' tickFormatter={formatDayTick} stroke='rgba(255,255,255,0.4)' fontSize={11} />
              <YAxis stroke='rgba(255,255,255,0.4)' fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDayTick} />
              <Line type='monotone' dataKey='count' name='Vistas' stroke={ACCENT} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className='mb-4 mt-8'>
        <p className='mb-3 font-[font1] text-sm uppercase tracking-wide text-white/40'>Qué mira y toca la gente</p>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <ChartCard title='Dispositivo'>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.deviceBreakdown}
                  dataKey='count'
                  nameKey='_id'
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {stats.deviceBreakdown.map((entry, index) => (
                    <Cell key={entry._id} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title='Páginas más vistas'>
            <ResponsiveContainer>
              <BarChart data={topPagesChart} layout='vertical' margin={{ left: 8 }}>
                <XAxis type='number' stroke='rgba(255,255,255,0.4)' fontSize={11} allowDecimals={false} />
                <YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.4)' fontSize={11} width={90} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey='count' name='Vistas' fill={ACCENT} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title='Qué tocan más (correo, dirección, menú...)'>
            <ResponsiveContainer>
              <BarChart data={topEventsChart} layout='vertical' margin={{ left: 8 }}>
                <XAxis type='number' stroke='rgba(255,255,255,0.4)' fontSize={11} allowDecimals={false} />
                <YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.4)' fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey='count' name='Clics' fill={ACCENT} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title='Videos/creadores más abiertos'>
            <ResponsiveContainer>
              <BarChart data={topProjectsChart} layout='vertical' margin={{ left: 8 }}>
                <XAxis type='number' stroke='rgba(255,255,255,0.4)' fontSize={11} allowDecimals={false} />
                <YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.4)' fontSize={11} width={110} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey='count' name='Clics' fill={ACCENT} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className='mb-4 mt-8'>
        <p className='mb-3 font-[font1] text-sm uppercase tracking-wide text-white/40'>De dónde viene la gente</p>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <ChartCard title='Países'>
            <ResponsiveContainer>
              <BarChart data={topCountriesChart} layout='vertical' margin={{ left: 8 }}>
                <XAxis type='number' stroke='rgba(255,255,255,0.4)' fontSize={11} allowDecimals={false} />
                <YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.4)' fontSize={11} width={60} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey='count' name='Visitas' fill={ACCENT} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ListCard title='Referidos' rows={stats.topReferrers} />
        </div>
      </div>

      {/* Detalles técnicos: listas simples, no aportan más como gráfica */}
      <div className='mb-4 mt-8'>
        <p className='mb-3 font-[font1] text-sm uppercase tracking-wide text-white/40'>Detalles técnicos</p>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <ListCard title='Navegadores' rows={stats.browserBreakdown} />
          <ListCard title='Sistema operativo' rows={stats.osBreakdown} />
          <ListCard title='Idioma' rows={stats.languageBreakdown} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
