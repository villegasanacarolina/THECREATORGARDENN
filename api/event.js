import { getDb } from './_lib/mongodb.js'
import { getRequestInfo } from './_lib/request-info.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { type, label, meta, path, url, visitorId, sessionId } = req.body || {}

    if (!type || !visitorId) {
      res.status(400).json({ error: 'type y visitorId son requeridos' })
      return
    }

    const info = getRequestInfo(req)
    const db = await getDb()
    await db.collection('events').insertOne({
      type,
      label: label || null,
      meta: meta || null,
      path: path || null,
      url: url || path || null,
      visitorId,
      sessionId: sessionId || null,
      ...info,
      createdAt: new Date(),
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('event error', err)
    res.status(200).json({ ok: false })
  }
}
