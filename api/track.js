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
      query,
      url,
      title,
      referrer,
      visitorId,
      sessionId,
      pageviewId,
      language,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      screenWidth,
      screenHeight,
      viewportWidth,
      viewportHeight,
      pixelRatio,
      hardwareConcurrency,
      deviceMemory,
      maxTouchPoints,
      connectionType,
      effectiveType,
      downlink,
      saveData,
      orientation,
      colorScheme,
      standalone,
      timezone,
      platform,
    } = req.body || {}

    if (!path || !visitorId) {
      res.status(400).json({ error: 'path y visitorId son requeridos' })
      return
    }

    const info = getRequestInfo(req)
    const db = await getDb()

    await db.collection('pageviews').insertOne({
      path,
      query: query || null,
      url: url || path,
      title: title || null,
      referrer: referrer || null,
      visitorId,
      sessionId: sessionId || null,
      pageviewId: pageviewId || null,
      language: language || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      utmTerm: utmTerm || null,
      screenWidth: screenWidth || null,
      screenHeight: screenHeight || null,
      viewportWidth: viewportWidth || null,
      viewportHeight: viewportHeight || null,
      pixelRatio: typeof pixelRatio === 'number' ? pixelRatio : null,
      hardwareConcurrency: hardwareConcurrency || null,
      deviceMemory: deviceMemory || null,
      maxTouchPoints: typeof maxTouchPoints === 'number' ? maxTouchPoints : null,
      connectionType: connectionType || null,
      effectiveType: effectiveType || null,
      downlink: typeof downlink === 'number' ? downlink : null,
      saveData: Boolean(saveData),
      orientation: orientation || null,
      colorScheme: colorScheme || null,
      standalone: Boolean(standalone),
      timezone: timezone || null,
      platform: platform || null,
      durationMs: null,
      engagedMs: null,
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
