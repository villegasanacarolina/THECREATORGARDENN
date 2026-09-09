import { getDb } from './_lib/mongodb.js'
import { getRequestInfo } from './_lib/request-info.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const {
      path,
      referrer,
      visitorId,
      pageviewId,
      language,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
    } = req.body || {}

    if (!path || !visitorId) {
      res.status(400).json({ error: 'path y visitorId son requeridos' })
      return
    }

    const info = getRequestInfo(req)

    const db = await getDb()
    await db.collection('pageviews').insertOne({
      path,
      referrer: referrer || null,
      visitorId,
      pageviewId: pageviewId || null,
      language: language || null,
      screenWidth: screenWidth || null,
      screenHeight: screenHeight || null,
      viewportWidth: viewportWidth || null,
      viewportHeight: viewportHeight || null,
      // Se llenan después, cuando el visitante sale de la página
      // (ver api/track-exit.js)
      durationMs: null,
      maxScrollPercent: null,
      ...info,
      createdAt: new Date(),
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('track error', err)
    res.status(200).json({ ok: false })
  }
}
