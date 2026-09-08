import { getDb } from './_lib/mongodb.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { path, referrer, visitorId } = req.body || {}

    if (!path || !visitorId) {
      res.status(400).json({ error: 'path y visitorId son requeridos' })
      return
    }

    const userAgent = req.headers['user-agent'] || ''
    // Vercel agrega estos headers de geolocalización automáticamente en su red,
    // sin necesidad de contratar ningún servicio externo de geo-IP.
    const country = req.headers['x-vercel-ip-country'] || null
    const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null

    const { browser, device } = parseUserAgent(userAgent)

    const db = await getDb()
    await db.collection('pageviews').insertOne({
      path,
      referrer: referrer || null,
      visitorId,
      userAgent,
      browser,
      device,
      country,
      city,
      ip,
      createdAt: new Date(),
    })

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('track error', err)
    // Nunca tumbamos el sitio del visitante si el tracking falla
    res.status(200).json({ ok: false })
  }
}

function parseUserAgent(ua) {
  const device = /Mobi|Android/i.test(ua) ? 'mobile' : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop'
  let browser = 'Otro'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  return { browser, device }
}
