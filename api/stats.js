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
    const pageviews = db.collection('pageviews')
    const events = db.collection('events')

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
      osBreakdown,
      languageBreakdown,
      dailyViews,
      avgDurationAgg,
      avgScrollAgg,
      topEvents,
      topClickedProjects,
    ] = await Promise.all([
      pageviews.countDocuments({}),
      pageviews.countDocuments({ createdAt: { $gte: since24h } }),
      pageviews.countDocuments({ createdAt: { $gte: since7d } }),
      pageviews.countDocuments({ createdAt: { $gte: since30d } }),
      pageviews.distinct('visitorId').then((a) => a.length),
      pageviews.distinct('visitorId', { createdAt: { $gte: since30d } }).then((a) => a.length),
      pageviews.aggregate([
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { referrer: { $ne: null } } },
        { $group: { _id: '$referrer', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { country: { $ne: null } } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      pageviews.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { language: { $ne: null } } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { durationMs: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$durationMs' } } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: { maxScrollPercent: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$maxScrollPercent' } } },
      ]).toArray(),
      events.aggregate([
        { $group: { _id: { type: '$type', label: '$label' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]).toArray(),
      events.aggregate([
        { $match: { type: 'click', label: 'project' } },
        { $group: { _id: '$meta.project', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
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
      osBreakdown,
      languageBreakdown,
      dailyViews,
      avgDurationMs: avgDurationAgg[0]?.avg ?? null,
      avgScrollPercent: avgScrollAgg[0]?.avg ?? null,
      topEvents: topEvents.map((e) => ({
        _id: `${e._id.type}${e._id.label ? ':' + e._id.label : ''}`,
        count: e.count,
      })),
      topClickedProjects,
    })
  } catch (err) {
    console.error('stats error', err)
    res.status(500).json({ error: 'No se pudieron cargar las estadísticas' })
  }
}
