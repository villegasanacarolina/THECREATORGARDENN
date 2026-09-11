import { useMemo, useState } from 'react'
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
  Legend,
} from 'recharts'

const ACCENT = '#D9A99B'
const SECONDARY = '#8b8b8b'
const PIE_COLORS = ['#D9A99B', '#8b8b8b', '#4a4a4a', '#ffffff', '#6f5b55', '#bfbfbf']
const RANGE_OPTIONS = [
  ['24h', '24 h'],
  ['7d', '7 días'],
  ['30d', '30 días'],
  ['90d', '90 días'],
  ['all', 'Todo'],
]

const tooltipStyle = {
  backgroundColor: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6,
  fontFamily: 'font1',
  fontSize: 12,
  color: '#fff',
}

const safeRows = (rows) => (Array.isArray(rows) ? rows : [])
const number = (value) => new Intl.NumberFormat('es-MX').format(value || 0)
const percent = (value, digits = 0) => (value == null ? '—' : `${Number(value).toFixed(digits)}%`)
const formatDuration = (ms) => {
  if (ms == null || Number.isNaN(Number(ms))) return '—'
  const seconds = Math.round(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes < 60) return `${minutes}m ${rest}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}
const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Mexico_City',
  }).format(new Date(value))
}
const formatDayTick = (value) => {
  const parts = String(value || '').split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value
}
const truncate = (value, max = 24) => (value && String(value).length > max ? `${String(value).slice(0, max)}…` : value || '—')

const SectionTitle = ({ eyebrow, title, note }) => (
  <div className='mb-4 mt-10'>
    <p className='font-[font1] text-[11px] uppercase tracking-[0.18em] text-white/35'>{eyebrow}</p>
    <div className='mt-1 flex flex-wrap items-end justify-between gap-2'>
      <h2 className='font-[font2] text-2xl lg:text-3xl'>{title}</h2>
      {note && <p className='max-w-2xl font-[font1] text-xs text-white/45'>{note}</p>}
    </div>
  </div>
)

const StatCard = ({ label, value, sub }) => (
  <div className='rounded-md border border-white/15 bg-white/[0.02] p-4'>
    <p className='font-[font1] text-[11px] uppercase tracking-[0.12em] text-white/45'>{label}</p>
    <p className='mt-1 font-[font2] text-3xl'>{value}</p>
    {sub && <p className='mt-1 font-[font1] text-xs text-white/40'>{sub}</p>}
  </div>
)

const ChartCard = ({ title, children, height = 240, note }) => (
  <div className='rounded-md border border-white/15 bg-white/[0.02] p-4'>
    <div className='mb-3'>
      <p className='font-[font1] text-xs uppercase tracking-wide text-white/55'>{title}</p>
      {note && <p className='mt-1 font-[font1] text-[11px] text-white/35'>{note}</p>}
    </div>
    <div style={{ width: '100%', height }}>{children}</div>
  </div>
)

const ListCard = ({ title, rows, valueLabel = 'Total', secondaryKey = 'uniqueVisitors' }) => (
  <div className='rounded-md border border-white/15 bg-white/[0.02] p-4'>
    <p className='mb-3 font-[font1] text-xs uppercase tracking-wide text-white/55'>{title}</p>
    {safeRows(rows).length === 0 && <p className='font-[font1] text-sm text-white/35'>Sin datos todavía</p>}
    <ul className='space-y-2'>
      {safeRows(rows).map((row, index) => (
        <li key={`${String(row._id)}-${index}`} className='flex items-start justify-between gap-3 border-b border-white/[0.06] pb-2 font-[font1] text-sm last:border-0 last:pb-0'>
          <span className='min-w-0 break-words'>{row._id || '—'}</span>
          <span className='shrink-0 text-right text-white/55'>
            {number(row.count)}
            {row[secondaryKey] != null && <span className='block text-[10px] text-white/30'>{number(row[secondaryKey])} únicos</span>}
            {!row[secondaryKey] && valueLabel !== 'Total' && <span className='block text-[10px] text-white/30'>{valueLabel}</span>}
          </span>
        </li>
      ))}
    </ul>
  </div>
)

const DetailTable = ({ children }) => (
  <div className='overflow-x-auto rounded-md border border-white/15 bg-white/[0.02]'>
    <table className='min-w-full border-collapse font-[font1] text-xs'>{children}</table>
  </div>
)

const TableHead = ({ children }) => <th className='whitespace-nowrap border-b border-white/15 px-3 py-3 text-left font-normal uppercase tracking-wide text-white/40'>{children}</th>
const TableCell = ({ children, className = '' }) => <td className={`border-b border-white/[0.06] px-3 py-3 align-top text-white/75 ${className}`}>{children}</td>

const AdminDashboard = ({ stats, range, loading, onRangeChange, onRefresh }) => {
  const [loggingOut, setLoggingOut] = useState(false)
  const [visitorSearch, setVisitorSearch] = useState('')
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [visitorDetail, setVisitorDetail] = useState(null)
  const [visitorDetailLoading, setVisitorDetailLoading] = useState(false)
  const [visitorDetailError, setVisitorDetailError] = useState('')

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/admin-logout', { method: 'POST' }).catch(() => {})
    window.location.reload()
  }

  const visitors = safeRows(stats?.visitors)
  const filteredVisitors = useMemo(() => {
    const q = visitorSearch.trim().toLowerCase()
    if (!q) return visitors
    return visitors.filter((v) => [v.id, v.shortId, v.city, v.country, v.device, v.browser, v.os, v.lastPath, v.firstReferrer]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)))
  }, [visitors, visitorSearch])

  const openVisitor = async (visitor) => {
    setSelectedVisitor(visitor)
    setVisitorDetail(null)
    setVisitorDetailError('')
    setVisitorDetailLoading(true)
    try {
      const res = await fetch(`/api/visitor-detail?id=${encodeURIComponent(visitor.id)}`)
      if (!res.ok) throw new Error('No se pudo cargar el recorrido')
      setVisitorDetail(await res.json())
    } catch (err) {
      setVisitorDetailError(err.message || 'No se pudo cargar el recorrido')
    } finally {
      setVisitorDetailLoading(false)
    }
  }

  const exportVisitors = () => {
    const headers = [
      'visitor_id', 'first_seen', 'last_seen', 'sessions', 'pageviews', 'engaged_ms', 'avg_scroll',
      'email_clicks', 'address_clicks', 'project_clicks', 'country', 'city', 'device', 'browser', 'os',
      'language', 'screen', 'connection', 'referrer', 'last_path',
    ]
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = visitors.map((v) => [
      v.id, v.firstSeen, v.lastSeen, v.sessions, v.pageviews, Math.round(v.totalEngagedMs || 0),
      v.avgScrollPercent == null ? '' : Math.round(v.avgScrollPercent), v.emailClicks, v.addressClicks,
      v.projectClicks, v.country, v.city, v.device, v.browser, v.os, v.language, v.screen, v.effectiveType,
      v.firstReferrer, v.lastPath,
    ])
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `thecreatorgarden-visitors-${range}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!stats) return null

  const dailyTrend = safeRows(stats.dailyTrend)
  const topPages = safeRows(stats.topPages)
  const pageChart = topPages.slice(0, 8).map((r) => ({ ...r, label: truncate(r._id, 18) }))
  const countryChart = safeRows(stats.topCountries).slice(0, 8).map((r) => ({ ...r, label: truncate(r._id, 14) }))
  const contactTrend = safeRows(stats.contactTrend)
  const performance = stats.performance || {}
  const initialPerf = performance.initialLoad || {}
  const gardenPerf = performance.gardenReady || {}
  const loaderPerf = performance.loaderExit || {}
  const firstInteractionPerf = performance.firstInteraction || {}
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const weekdayTraffic = safeRows(stats.weekdayTraffic).map((row) => ({ ...row, label: weekdays[(row._id - 1 + 7) % 7] }))
  const hourlyTraffic = safeRows(stats.hourlyTraffic).map((row) => ({ ...row, label: `${String(row._id).padStart(2, '0')}:00` }))

  return (
    <div className='min-h-screen bg-black px-4 py-8 text-white lg:px-10 xl:px-16'>
      <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='font-[font1] text-[11px] uppercase tracking-[0.2em] text-white/35'>The Creator Garden</p>
          <h1 className='font-[font2] text-4xl lg:text-5xl'>Analytics</h1>
          <p className='mt-2 font-[font1] text-xs text-white/35'>Última actualización: {formatDate(stats.generatedAt)} · refresco automático cada 60 s</p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button type='button' onClick={exportVisitors} className='rounded-full border border-white/25 px-4 py-2 font-[font1] text-sm hover:border-[#D9A99B] hover:text-[#D9A99B]'>Exportar visitantes CSV</button>
          <button type='button' onClick={onRefresh} disabled={loading} className='rounded-full border border-white/25 px-4 py-2 font-[font1] text-sm hover:border-[#D9A99B] hover:text-[#D9A99B] disabled:opacity-40'>{loading ? 'Actualizando…' : 'Actualizar'}</button>
          <button type='button' onClick={handleLogout} disabled={loggingOut} className='rounded-full border border-white/25 px-4 py-2 font-[font1] text-sm hover:border-red-400 hover:text-red-400 disabled:opacity-40'>Cerrar sesión</button>
        </div>
      </div>

      <div className='mb-7 flex flex-wrap gap-2'>
        {RANGE_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type='button'
            onClick={() => onRangeChange(value)}
            className={`rounded-full border px-4 py-2 font-[font1] text-xs transition-colors ${range === value ? 'border-[#D9A99B] bg-[#D9A99B] text-black' : 'border-white/20 text-white/60 hover:border-white/50'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <SectionTitle eyebrow='Overview' title='Lo esencial' note='Los visitantes únicos se reconocen con un identificador anónimo guardado en el navegador; no revela su nombre ni correo.' />
      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6'>
        <StatCard label='Vistas en periodo' value={number(stats.rangeViews)} sub={`${number(stats.totalViews)} all-time`} />
        <StatCard label='Únicos en periodo' value={number(stats.uniqueVisitorsRange)} sub={`${number(stats.uniqueVisitorsAll)} all-time`} />
        <StatCard label='Sesiones' value={number(stats.sessionsRange)} />
        <StatCard label='Páginas / sesión' value={stats.avgPagesPerSession == null ? '—' : Number(stats.avgPagesPerSession).toFixed(2)} />
        <StatCard label='Sesión promedio' value={formatDuration(stats.avgSessionDurationMs)} />
        <StatCard label='Sesiones engaged' value={percent(stats.engagedSessionRate)} sub='≥10 s o 2+ páginas' />
        <StatCard label='Únicos 24 h' value={number(stats.uniqueVisitors24h)} />
        <StatCard label='Únicos 7 días' value={number(stats.uniqueVisitors7d)} />
        <StatCard label='Únicos 30 días' value={number(stats.uniqueVisitors30d)} />
        <StatCard label='Recurrentes en periodo' value={number(stats.repeatVisitorsInRange)} sub='2+ sesiones identificadas' />
        <StatCard label='Una sola página' value={percent(stats.singlePageRate)} />
        <StatCard label='Scroll promedio' value={percent(stats.avgScrollPercent)} />
      </div>

      <div className='mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <ChartCard title='Vistas y visitantes únicos por día' height={270}>
          <ResponsiveContainer>
            <LineChart data={dailyTrend}>
              <CartesianGrid stroke='rgba(255,255,255,0.08)' vertical={false} />
              <XAxis dataKey='_id' tickFormatter={formatDayTick} stroke='rgba(255,255,255,0.35)' fontSize={10} />
              <YAxis stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={formatDayTick} />
              <Legend />
              <Line type='monotone' dataKey='count' name='Vistas' stroke={ACCENT} strokeWidth={2} dot={false} />
              <Line type='monotone' dataKey='uniqueVisitors' name='Únicos' stroke={SECONDARY} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title='Páginas más vistas' height={270}>
          <ResponsiveContainer>
            <BarChart data={pageChart} layout='vertical' margin={{ left: 6 }}>
              <XAxis type='number' stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} />
              <YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.35)' fontSize={10} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey='count' name='Vistas' fill={ACCENT} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionTitle eyebrow='Contact intent' title='Correo y dirección' note='Aquí puedes distinguir clics totales de personas únicas que mostraron intención de contacto.' />
      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6'>
        <StatCard label='Clics en correo' value={number(stats.emailClicks)} />
        <StatCard label='Únicos → correo' value={number(stats.uniqueEmailClickers)} />
        <StatCard label='Clics en dirección' value={number(stats.addressClicks)} />
        <StatCard label='Únicos → dirección' value={number(stats.uniqueAddressClickers)} />
        <StatCard label='Únicos con intención' value={number(stats.uniqueContactClickers)} />
        <StatCard label='Conversión a contacto' value={percent(stats.contactConversionRate, 1)} sub='únicos que tocaron correo o dirección' />
      </div>

      <div className='mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <ChartCard title='Clics de contacto por día' height={250}>
          <ResponsiveContainer>
            <LineChart data={contactTrend}>
              <CartesianGrid stroke='rgba(255,255,255,0.08)' vertical={false} />
              <XAxis dataKey='_id' tickFormatter={formatDayTick} stroke='rgba(255,255,255,0.35)' fontSize={10} />
              <YAxis stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type='monotone' dataKey='email' name='Correo' stroke={ACCENT} strokeWidth={2} />
              <Line type='monotone' dataKey='address' name='Dirección' stroke={SECONDARY} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className='rounded-md border border-white/15 bg-white/[0.02] p-4'>
          <p className='mb-3 font-[font1] text-xs uppercase tracking-wide text-white/55'>Actividad de contacto reciente</p>
          <div className='max-h-[250px] overflow-auto'>
            {safeRows(stats.recentContactEvents).length === 0 ? <p className='font-[font1] text-sm text-white/35'>Sin clics todavía</p> : (
              <ul className='space-y-2'>
                {safeRows(stats.recentContactEvents).map((row) => (
                  <li key={row._id} className='border-b border-white/[0.06] pb-2 font-[font1] text-xs last:border-0'>
                    <div className='flex justify-between gap-3'>
                      <span className='text-white'>{row.label === 'email' ? 'Correo' : 'Dirección'} · visitante {String(row.visitorId || '').slice(0, 8)}</span>
                      <span className='text-white/35'>{formatDate(row.createdAt)}</span>
                    </div>
                    <p className='mt-1 text-white/45'>{[row.city, row.country, row.device, row.browser].filter(Boolean).join(' · ') || 'Sin detalles técnicos'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <SectionTitle eyebrow='Unique visitors' title='Quién volvió y qué hizo' note='No identifica legalmente a una persona. Es un perfil de comportamiento por navegador/dispositivo.' />
      <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
        <input
          value={visitorSearch}
          onChange={(e) => setVisitorSearch(e.target.value)}
          placeholder='Buscar ID, ciudad, país, dispositivo, página…'
          className='w-full max-w-lg rounded-full border border-white/20 bg-transparent px-4 py-2 font-[font1] text-sm outline-none placeholder:text-white/25 focus:border-[#D9A99B]'
        />
        <p className='font-[font1] text-xs text-white/35'>Mostrando {filteredVisitors.length} de {visitors.length} visitantes recientes</p>
      </div>
      <DetailTable>
        <thead><tr>
          <TableHead>Visitante</TableHead><TableHead>Última visita</TableHead><TableHead>Sesiones</TableHead><TableHead>Páginas</TableHead><TableHead>Tiempo activo</TableHead><TableHead>Scroll</TableHead><TableHead>Correo</TableHead><TableHead>Dirección</TableHead><TableHead>Proyectos</TableHead><TableHead>Ubicación aprox.</TableHead><TableHead>Dispositivo</TableHead><TableHead>Entrada</TableHead><TableHead>Última página</TableHead>
        </tr></thead>
        <tbody>
          {filteredVisitors.map((v) => (
            <tr key={v.id}>
              <TableCell>
                <button type='button' onClick={() => openVisitor(v)} className='text-left transition-colors hover:text-[#D9A99B]' title='Ver recorrido completo'>
                  <span className='font-mono text-[11px]' title={v.id}>{v.shortId}</span>
                  <span className='ml-2 text-[10px] underline underline-offset-2'>ver recorrido</span>
                </button>
                <span className={`ml-2 rounded-full px-2 py-0.5 text-[9px] ${v.returning ? 'bg-[#D9A99B]/20 text-[#D9A99B]' : 'bg-white/10 text-white/45'}`}>{v.returning ? 'recurrente' : 'nuevo'}</span>
                <div className='mt-1 text-[10px] text-white/30'>1ª {formatDate(v.firstSeen)}</div>
              </TableCell>
              <TableCell>{formatDate(v.lastSeen)}</TableCell>
              <TableCell>{number(v.sessions)}</TableCell>
              <TableCell>{number(v.pageviews)}</TableCell>
              <TableCell>{formatDuration(v.totalEngagedMs)}</TableCell>
              <TableCell>{percent(v.avgScrollPercent)}</TableCell>
              <TableCell>{number(v.emailClicks)}</TableCell>
              <TableCell>{number(v.addressClicks)}</TableCell>
              <TableCell>{number(v.projectClicks)}</TableCell>
              <TableCell>{[v.city, v.country].filter(Boolean).join(', ') || '—'}</TableCell>
              <TableCell>{[v.device, v.os, v.browser, v.screen, v.effectiveType].filter(Boolean).join(' · ') || '—'}</TableCell>
              <TableCell>{truncate(v.firstReferrer, 28)}</TableCell>
              <TableCell>{v.lastPath || '—'}</TableCell>
            </tr>
          ))}
        </tbody>
      </DetailTable>

      {selectedVisitor && (
        <div className='mt-4 rounded-md border border-[#D9A99B]/35 bg-[#D9A99B]/[0.04] p-4 lg:p-6'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <p className='font-[font1] text-[11px] uppercase tracking-[0.18em] text-[#D9A99B]'>Visitor journey</p>
              <h3 className='mt-1 font-[font2] text-2xl'>Visitante {selectedVisitor.shortId}</h3>
              <p className='mt-1 break-all font-mono text-[10px] text-white/30'>{selectedVisitor.id}</p>
            </div>
            <button type='button' onClick={() => { setSelectedVisitor(null); setVisitorDetail(null) }} className='rounded-full border border-white/20 px-4 py-2 font-[font1] text-xs hover:border-white/60'>Cerrar detalle</button>
          </div>

          <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6'>
            <StatCard label='Sesiones' value={number(selectedVisitor.sessions)} />
            <StatCard label='Páginas' value={number(selectedVisitor.pageviews)} />
            <StatCard label='Tiempo activo' value={formatDuration(selectedVisitor.totalEngagedMs)} />
            <StatCard label='Scroll prom.' value={percent(selectedVisitor.avgScrollPercent)} />
            <StatCard label='Correo' value={number(selectedVisitor.emailClicks)} />
            <StatCard label='Dirección' value={number(selectedVisitor.addressClicks)} />
          </div>

          <div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3'>
            <div className='rounded border border-white/10 p-3 font-[font1] text-xs'>
              <p className='uppercase text-white/35'>Contexto</p>
              <p className='mt-2 text-white/70'>{[selectedVisitor.city, selectedVisitor.country].filter(Boolean).join(', ') || 'Ubicación no disponible'}</p>
              <p className='mt-1 text-white/45'>{[selectedVisitor.device, selectedVisitor.os, selectedVisitor.browser, selectedVisitor.screen].filter(Boolean).join(' · ') || '—'}</p>
              <p className='mt-1 text-white/45'>Conexión: {selectedVisitor.effectiveType || '—'}</p>
            </div>
            <div className='rounded border border-white/10 p-3 font-[font1] text-xs'>
              <p className='uppercase text-white/35'>Adquisición</p>
              <p className='mt-2 break-words text-white/70'>Primera referencia: {selectedVisitor.firstReferrer || 'Direct / none'}</p>
              <p className='mt-1 text-white/45'>Última página: {selectedVisitor.lastPath || '—'}</p>
            </div>
            <div className='rounded border border-white/10 p-3 font-[font1] text-xs'>
              <p className='uppercase text-white/35'>Fechas</p>
              <p className='mt-2 text-white/70'>Primera vez: {formatDate(selectedVisitor.firstSeen)}</p>
              <p className='mt-1 text-white/45'>Última vez: {formatDate(selectedVisitor.lastSeen)}</p>
            </div>
          </div>

          {visitorDetailLoading && <p className='mt-5 font-[font1] text-sm text-white/45'>Cargando recorrido…</p>}
          {visitorDetailError && <p className='mt-5 font-[font1] text-sm text-red-400'>{visitorDetailError}</p>}
          {visitorDetail && (
            <div className='mt-5 space-y-4'>
              <p className='font-[font1] text-xs uppercase tracking-wide text-white/45'>Recorrido por sesión · páginas, tiempo, scroll e interacciones</p>
              {safeRows(visitorDetail.sessions).map((session, sessionIndex) => {
                const timeline = [
                  ...safeRows(session.pageviews).map((item) => ({ ...item, _kind: 'pageview' })),
                  ...safeRows(session.events).map((item) => ({ ...item, _kind: 'event' })),
                ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                return (
                  <div key={session.id || sessionIndex} className='rounded border border-white/10 bg-black/30 p-3'>
                    <div className='mb-3 flex flex-wrap items-center justify-between gap-2 font-[font1] text-xs'>
                      <span className='text-white/70'>Sesión {safeRows(visitorDetail.sessions).length - sessionIndex}</span>
                      <span className='text-white/35'>{formatDate(session.startedAt)} → {formatDate(session.endedAt)}</span>
                    </div>
                    <div className='space-y-2'>
                      {timeline.map((item, itemIndex) => (
                        <div key={`${item._kind}-${item._id || itemIndex}`} className='grid grid-cols-[5rem_1fr] gap-3 border-t border-white/[0.05] pt-2 font-[font1] text-xs first:border-0 first:pt-0'>
                          <span className='text-white/30'>{new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Mexico_City' }).format(new Date(item.createdAt))}</span>
                          {item._kind === 'pageview' ? (
                            <div>
                              <p className='text-white/80'>Vio <span className='text-[#D9A99B]'>{item.path}</span></p>
                              <p className='mt-0.5 text-white/35'>activo {formatDuration(item.engagedMs ?? item.durationMs)} · scroll {percent(item.maxScrollPercent)}{item.utmSource ? ` · UTM ${item.utmSource}${item.utmCampaign ? ` / ${item.utmCampaign}` : ''}` : ''}</p>
                            </div>
                          ) : (
                            <div>
                              <p className='text-white/80'>{item.type}: <span className='text-[#D9A99B]'>{item.label || 'sin etiqueta'}</span></p>
                              <p className='mt-0.5 break-words text-white/35'>{item.path || '—'}{item.meta?.project ? ` · proyecto ${item.meta.project}` : ''}{item.meta?.to ? ` · → ${item.meta.to}` : ''}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <SectionTitle eyebrow='Behavior' title='Cómo navegan y hasta dónde llegan' />
      <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
        <StatCard label='Llegó a 25%' value={percent(stats.scrollDepth?.reached25)} />
        <StatCard label='Llegó a 50%' value={percent(stats.scrollDepth?.reached50)} />
        <StatCard label='Llegó a 75%' value={percent(stats.scrollDepth?.reached75)} />
        <StatCard label='Llegó a 90%' value={percent(stats.scrollDepth?.reached90)} />
      </div>
      <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <ListCard title='Páginas de entrada' rows={stats.entryPages} />
        <ListCard title='Páginas de salida' rows={stats.exitPages} />
        <ListCard title='Navegación desde menú' rows={stats.navDestinations} />
        <ListCard title='Eventos principales' rows={stats.topEvents} />
        <ListCard title='Elementos más clicados' rows={stats.topUiClicks} />
        <ListCard title='Videos / proyectos abiertos' rows={stats.topClickedProjects} />
        <ListCard title='Audio' rows={stats.audioBreakdown} />
        <ListCard title='Conexión' rows={stats.connectionBreakdown} />
      </div>

      <div className='mt-4'>
        <p className='mb-3 font-[font1] text-xs uppercase tracking-wide text-white/55'>Detalle por página</p>
        <DetailTable>
          <thead><tr><TableHead>Página</TableHead><TableHead>Vistas</TableHead><TableHead>Únicos</TableHead><TableHead>Tiempo activo prom.</TableHead><TableHead>Scroll prom.</TableHead></tr></thead>
          <tbody>{topPages.map((row) => <tr key={row._id}><TableCell>{row._id}</TableCell><TableCell>{number(row.count)}</TableCell><TableCell>{number(row.uniqueVisitors)}</TableCell><TableCell>{formatDuration(row.avgDurationMs)}</TableCell><TableCell>{percent(row.avgScrollPercent)}</TableCell></tr>)}</tbody>
        </DetailTable>
      </div>

      <SectionTitle eyebrow='When' title='Cuándo entra la gente' note='Hora mostrada en tiempo de Ciudad de México.' />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <ChartCard title='Tráfico por hora' height={250}>
          <ResponsiveContainer><BarChart data={hourlyTraffic}><CartesianGrid stroke='rgba(255,255,255,0.08)' vertical={false} /><XAxis dataKey='label' stroke='rgba(255,255,255,0.35)' fontSize={9} interval={2} /><YAxis stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey='count' name='Vistas' fill={ACCENT} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title='Tráfico por día de la semana' height={250}>
          <ResponsiveContainer><BarChart data={weekdayTraffic}><CartesianGrid stroke='rgba(255,255,255,0.08)' vertical={false} /><XAxis dataKey='label' stroke='rgba(255,255,255,0.35)' fontSize={10} /><YAxis stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey='count' name='Vistas' fill={ACCENT} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionTitle eyebrow='Acquisition' title='De dónde llegan' />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
        <ChartCard title='Países' height={260}>
          <ResponsiveContainer><BarChart data={countryChart} layout='vertical'><XAxis type='number' stroke='rgba(255,255,255,0.35)' fontSize={10} allowDecimals={false} /><YAxis type='category' dataKey='label' stroke='rgba(255,255,255,0.35)' fontSize={10} width={90} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey='count' name='Vistas' fill={ACCENT} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ListCard title='Ciudades aproximadas' rows={stats.topCities} />
        <ListCard title='Referidos' rows={stats.topReferrers} />
        <ListCard title='Campañas UTM' rows={stats.campaignBreakdown} />
      </div>

      <SectionTitle eyebrow='Technology' title='Dispositivos y contexto técnico' />
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-3'>
        <ChartCard title='Dispositivo' height={230}>
          <ResponsiveContainer>
            <PieChart><Pie data={safeRows(stats.deviceBreakdown)} dataKey='count' nameKey='_id' innerRadius={48} outerRadius={80} paddingAngle={2}>{safeRows(stats.deviceBreakdown).map((entry, index) => <Cell key={`${entry._id}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ListCard title='Navegadores' rows={stats.browserBreakdown} />
        <ListCard title='Sistemas operativos' rows={stats.osBreakdown} />
        <ListCard title='Idiomas' rows={stats.languageBreakdown} />
        <ListCard title='Resoluciones de pantalla' rows={stats.screenBreakdown} />
        <ListCard title='Tipo de conexión' rows={stats.connectionBreakdown} />
      </div>

      <SectionTitle eyebrow='Experience & performance' title='Qué tan rápida y estable se siente' note='Estas métricas empiezan a acumularse desde esta versión del sitio.' />
      <div className='grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8'>
        <StatCard label='TTFB' value={formatDuration(initialPerf.ttfbMs)} sub={`${number(initialPerf.samples)} muestras`} />
        <StatCard label='FCP' value={formatDuration(initialPerf.fcpMs)} />
        <StatCard label='LCP' value={formatDuration(initialPerf.lcpMs)} />
        <StatCard label='Load completo' value={formatDuration(initialPerf.loadMs)} />
        <StatCard label='CLS' value={initialPerf.cls == null ? '—' : Number(initialPerf.cls).toFixed(3)} />
        <StatCard label='3D lista' value={formatDuration(gardenPerf.avgMs)} sub={`máx ${formatDuration(gardenPerf.maxMs)}`} />
        <StatCard label='Loader desaparece' value={formatDuration(loaderPerf.avgMs)} sub={`máx ${formatDuration(loaderPerf.maxMs)}`} />
        <StatCard label='Primer gesto' value={formatDuration(firstInteractionPerf.avgMs)} />
      </div>

      <SectionTitle eyebrow='Reliability' title='Errores detectados' />
      <div className='mb-4 grid grid-cols-2 gap-3 md:grid-cols-4'>
        <StatCard label='Errores JS en periodo' value={number(stats.errorCount)} />
      </div>
      <div className='rounded-md border border-white/15 bg-white/[0.02] p-4'>
        {safeRows(stats.recentErrors).length === 0 ? <p className='font-[font1] text-sm text-white/35'>No se han detectado errores del navegador en este periodo.</p> : (
          <ul className='space-y-3'>
            {safeRows(stats.recentErrors).map((row) => (
              <li key={row._id} className='border-b border-white/[0.06] pb-3 font-[font1] text-xs last:border-0'>
                <div className='flex flex-wrap justify-between gap-2'><span>{row.label} · {row.path}</span><span className='text-white/35'>{formatDate(row.createdAt)}</span></div>
                <p className='mt-1 break-words text-white/50'>{row.meta?.message || 'Sin mensaje'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className='mt-10 border-t border-white/10 pt-5 font-[font1] text-[11px] leading-relaxed text-white/30'>
        Privacidad: el panel muestra comportamiento técnico y una ubicación aproximada proporcionada por la infraestructura de Vercel. Un ID de visitante permite reconocer el mismo navegador, pero no te dice el nombre, teléfono o correo real de esa persona. Un clic en “correo” registra la intención de abrir el cliente de email; no permite saber si finalmente envió el mensaje.
      </p>
    </div>
  )
}

export default AdminDashboard
