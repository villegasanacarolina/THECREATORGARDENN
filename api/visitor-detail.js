import { getDb } from './_lib/mongodb.js'
import { getSessionToken, verifySession } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const token = getSessionToken(req)
  if (!verifySession(token)) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const visitorId = typeof req.query?.id === 'string' ? req.query.id.trim() : ''
  if (!visitorId || visitorId.length > 160) {
    res.status(400).json({ error: 'Visitor id inválido' })
    return
  }

  try {
    const db = await getDb()
    const [pageviews, events] = await Promise.all([
      db.collection('pageviews')
        .find({ visitorId })
        .sort({ createdAt: -1 })
        .limit(250)
        .project({
          visitorId: 0,
          ip: 0,
          userAgent: 0,
        })
        .toArray(),
      db.collection('events')
        .find({ visitorId })
        .sort({ createdAt: -1 })
        .limit(400)
        .project({
          visitorId: 0,
          ip: 0,
          userAgent: 0,
        })
        .toArray(),
    ])

    const sessions = new Map()
    for (const view of pageviews) {
      const id = view.sessionId || `legacy-${String(view._id)}`
      if (!sessions.has(id)) sessions.set(id, { id, pageviews: [], events: [] })
      sessions.get(id).pageviews.push(view)
    }
    for (const event of events) {
      const id = event.sessionId || 'legacy-events'
      if (!sessions.has(id)) sessions.set(id, { id, pageviews: [], events: [] })
      sessions.get(id).events.push(event)
    }

    const sessionRows = [...sessions.values()]
      .map((session) => {
        const timestamps = [...session.pageviews, ...session.events]
          .map((item) => new Date(item.createdAt).getTime())
          .filter(Number.isFinite)
        return {
          ...session,
          startedAt: timestamps.length ? new Date(Math.min(...timestamps)) : null,
          endedAt: timestamps.length ? new Date(Math.max(...timestamps)) : null,
        }
      })
      .sort((a, b) => new Date(b.startedAt || 0) - new Date(a.startedAt || 0))

    res.status(200).json({
      visitorId,
      pageviews,
      events,
      sessions: sessionRows,
    })
  } catch (err) {
    console.error('visitor-detail error', err)
    res.status(500).json({ error: 'No se pudo cargar el detalle del visitante' })
  }
}
