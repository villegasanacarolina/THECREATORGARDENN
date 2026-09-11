import { getDb } from './_lib/mongodb.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    let body = req.body
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body)
      } catch {
        body = {}
      }
    }

    const { pageviewId, durationMs, engagedMs, maxScrollPercent } = body || {}

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
          engagedMs: typeof engagedMs === 'number' ? engagedMs : null,
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
