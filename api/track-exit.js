import { getDb } from './_lib/mongodb.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    // navigator.sendBeacon a veces manda el body como texto plano en vez de
    // JSON ya parseado — lo cubrimos por si acaso.
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        body = {}
      }
    }

    const { pageviewId, durationMs, maxScrollPercent } = body || {}

    if (!pageviewId) {
      res.status(200).json({ ok: false })
      return
    }

    const db = await getDb()
    await db.collection('pageviews').updateOne(
      { pageviewId },
      {
        $set: {
          durationMs: typeof durationMs === 'number' ? durationMs : null,
          maxScrollPercent: typeof maxScrollPercent === 'number' ? maxScrollPercent : null,
        },
      },
    )

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('track-exit error', err)
    res.status(200).json({ ok: false })
  }
}
