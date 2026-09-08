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

  try {
    const db = await getDb()
    const col = db.collection('pageviews')

    const now = new Date()
    const since24h = new Date(now - 24 * 60 * 60 * 1000)
    const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000)

    const [
      totalViews,
      views24h,
      views7d,
      views30d,
      uniqueVisitorsAll,
      uniqueVisitors30d,
      topPages,
      topReferrers,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      dailyViews,
    ] = await Promise.all([
      col.countDocuments({}),
      col.countDocuments({ createdAt: { $gte: since24h } }),
      col.countDocuments({ createdAt: { $gte: since7d } }),
      col.countDocuments({ createdAt: { $gte: since30d } }),
      col.distinct('visitorId').then((a) => a.length),
      col.distinct('visitorId', { createdAt: { $gte: since30d } }).then((a) => a.length),
      col.aggregate([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      col.aggregate([
        { $match: { referrer: { $ne: null } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      col.aggregate([
        { $match: { country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      col.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      col.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      col.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray(),
    ])

    res.status(200).json({
      totalViews,
      views24h,
      views7d,
      views30d,
      uniqueVisitorsAll,
      uniqueVisitors30d,
      topPages,
      topReferrers,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      dailyViews,
    })
  } catch (err) {
    console.error('stats error', err)
    res.status(500).json({ error: 'No se pudieron cargar las estadísticas' })
  }
}
