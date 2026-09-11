import { getDb } from './_lib/mongodb.js'
import { getSessionToken, verifySession } from './_lib/auth.js'

const DAY = 24 * 60 * 60 * 1000
const RANGE_MS = {
  '24h': DAY,
  '7d': 7 * DAY,
  '30d': 30 * DAY,
  '90d': 90 * DAY,
}

const validVisitorMatch = { visitorId: { $nin: [null, '', 'unknown'] } }
const validSessionMatch = { sessionId: { $nin: [null, '', 'unknown'] } }

const combine = (...parts) => Object.assign({}, ...parts.filter(Boolean))

const distinctCount = (collection, field, filter) => collection.distinct(field, filter).then((values) => values.filter(Boolean).length)

const normalizeReferrer = (value) => {
  if (!value) return 'Direct / none'
  try {
    return new URL(value).hostname.replace(/^www\./, '') || value
  } catch {
    return value
  }
}

const msAverage = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null)

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
    const requestedRange = typeof req.query?.range === 'string' ? req.query.range : '30d'
    const range = requestedRange === 'all' || RANGE_MS[requestedRange] ? requestedRange : '30d'
    const rangeStart = range === 'all' ? null : new Date(now.getTime() - RANGE_MS[range])
    const rangeFilter = rangeStart ? { createdAt: { $gte: rangeStart } } : {}
    const since24h = new Date(now.getTime() - DAY)
    const since7d = new Date(now.getTime() - 7 * DAY)
    const since30d = new Date(now.getTime() - 30 * DAY)
    const trendStart = rangeStart || new Date(now.getTime() - 90 * DAY)

    const [
      totalViews,
      rangeViews,
      views24h,
      views7d,
      views30d,
      uniqueVisitorsAll,
      uniqueVisitorsRange,
      uniqueVisitors24h,
      uniqueVisitors7d,
      uniqueVisitors30d,
      sessionsRange,
      topPages,
      referrersRaw,
      topCountries,
      topCities,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      languageBreakdown,
      screenBreakdown,
      connectionBreakdown,
      campaignBreakdown,
      dailyTrend,
      hourlyTraffic,
      weekdayTraffic,
      sessionAgg,
      scrollAgg,
      entryPages,
      exitPages,
      topEvents,
      topUiClicks,
      topClickedProjects,
      navDestinations,
      audioBreakdown,
      emailClicks,
      addressClicks,
      uniqueEmailClickers,
      uniqueAddressClickers,
      uniqueContactClickers,
      contactTrend,
      recentContactEvents,
      recentErrors,
      errorCount,
      initialLoadPerf,
      gardenPerf,
      loaderPerf,
      firstInteractionPerf,
      visitorRowsRaw,
      repeatVisitorRows,
    ] = await Promise.all([
      pageviews.countDocuments({}),
      pageviews.countDocuments(rangeFilter),
      pageviews.countDocuments({ createdAt: { $gte: since24h } }),
      pageviews.countDocuments({ createdAt: { $gte: since7d } }),
      pageviews.countDocuments({ createdAt: { $gte: since30d } }),
      distinctCount(pageviews, 'visitorId', validVisitorMatch),
      distinctCount(pageviews, 'visitorId', combine(rangeFilter, validVisitorMatch)),
      distinctCount(pageviews, 'visitorId', combine({ createdAt: { $gte: since24h } }, validVisitorMatch)),
      distinctCount(pageviews, 'visitorId', combine({ createdAt: { $gte: since7d } }, validVisitorMatch)),
      distinctCount(pageviews, 'visitorId', combine({ createdAt: { $gte: since30d } }, validVisitorMatch)),
      distinctCount(pageviews, 'sessionId', combine(rangeFilter, validSessionMatch)),
      pageviews.aggregate([
        { $match: rangeFilter },
        {
          $group: {
            _id: '$path',
            count: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
            avgDurationMs: { $avg: { $ifNull: ['$engagedMs', '$durationMs'] } },
            avgScrollPercent: { $avg: '$maxScrollPercent' },
          },
        },
        {
          $project: {
            count: 1,
            uniqueVisitors: { $size: '$visitors' },
            avgDurationMs: 1,
            avgScrollPercent: 1,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: '$referrer', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { country: { $ne: null } }) },
        { $group: { _id: '$country', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { city: { $ne: null } }) },
        { $group: { _id: '$city', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: { $ifNull: ['$device', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: { $ifNull: ['$browser', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: { $ifNull: ['$os', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { language: { $ne: null } }) },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { screenWidth: { $ne: null }, screenHeight: { $ne: null } }) },
        { $group: { _id: { w: '$screenWidth', h: '$screenHeight' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { effectiveType: { $ne: null } }) },
        { $group: { _id: '$effectiveType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { utmSource: { $ne: null } }) },
        {
          $group: {
            _id: { source: '$utmSource', medium: '$utmMedium', campaign: '$utmCampaign' },
            count: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine({ createdAt: { $gte: trendStart } }, validVisitorMatch) },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: { $hour: { date: '$createdAt', timezone: 'America/Mexico_City' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: rangeFilter },
        { $group: { _id: { $dayOfWeek: { date: '$createdAt', timezone: 'America/Mexico_City' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, validSessionMatch) },
        {
          $group: {
            _id: '$sessionId',
            pages: { $sum: 1 },
            durationMs: { $sum: { $ifNull: ['$engagedMs', { $ifNull: ['$durationMs', 0] }] } },
          },
        },
        {
          $group: {
            _id: null,
            sessions: { $sum: 1 },
            avgPagesPerSession: { $avg: '$pages' },
            avgSessionDurationMs: { $avg: '$durationMs' },
            singlePageSessions: { $sum: { $cond: [{ $eq: ['$pages', 1] }, 1, 0] } },
            engagedSessions: {
              $sum: {
                $cond: [
                  { $or: [{ $gte: ['$pages', 2] }, { $gte: ['$durationMs', 10000] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, { maxScrollPercent: { $ne: null } }) },
        {
          $group: {
            _id: null,
            tracked: { $sum: 1 },
            avg: { $avg: '$maxScrollPercent' },
            reached25: { $sum: { $cond: [{ $gte: ['$maxScrollPercent', 25] }, 1, 0] } },
            reached50: { $sum: { $cond: [{ $gte: ['$maxScrollPercent', 50] }, 1, 0] } },
            reached75: { $sum: { $cond: [{ $gte: ['$maxScrollPercent', 75] }, 1, 0] } },
            reached90: { $sum: { $cond: [{ $gte: ['$maxScrollPercent', 90] }, 1, 0] } },
          },
        },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, validSessionMatch) },
        { $sort: { createdAt: 1 } },
        { $group: { _id: '$sessionId', path: { $first: '$path' } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, validSessionMatch) },
        { $sort: { createdAt: -1 } },
        { $group: { _id: '$sessionId', path: { $first: '$path' } } },
        { $group: { _id: '$path', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: { $nin: ['performance', 'ui_click', 'error', 'hover'] } }) },
        { $group: { _id: { type: '$type', label: '$label' }, count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'ui_click' }) },
        { $group: { _id: '$label', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'click', label: 'project' }) },
        { $group: { _id: '$meta.project', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'click', label: 'nav_link' }) },
        { $group: { _id: '$meta.to', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'audio' }) },
        { $group: { _id: '$label', count: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { count: 1, uniqueVisitors: { $size: '$visitors' } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      events.countDocuments(combine(rangeFilter, { type: 'click', label: 'email' })),
      events.countDocuments(combine(rangeFilter, { type: 'click', label: 'address' })),
      distinctCount(events, 'visitorId', combine(rangeFilter, { type: 'click', label: 'email' }, validVisitorMatch)),
      distinctCount(events, 'visitorId', combine(rangeFilter, { type: 'click', label: 'address' }, validVisitorMatch)),
      distinctCount(events, 'visitorId', combine(rangeFilter, { type: 'click', label: { $in: ['email', 'address'] } }, validVisitorMatch)),
      events.aggregate([
        { $match: combine({ createdAt: { $gte: trendStart } }, { type: 'click', label: { $in: ['email', 'address'] } }) },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            email: { $sum: { $cond: [{ $eq: ['$label', 'email'] }, 1, 0] } },
            address: { $sum: { $cond: [{ $eq: ['$label', 'address'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray(),
      events.find(combine(rangeFilter, { type: 'click', label: { $in: ['email', 'address'] } }))
        .sort({ createdAt: -1 })
        .limit(40)
        .project({ visitorId: 1, label: 1, path: 1, city: 1, country: 1, device: 1, browser: 1, os: 1, createdAt: 1 })
        .toArray(),
      events.find(combine(rangeFilter, { type: 'error' }))
        .sort({ createdAt: -1 })
        .limit(20)
        .project({ label: 1, path: 1, visitorId: 1, meta: 1, device: 1, browser: 1, createdAt: 1 })
        .toArray(),
      events.countDocuments(combine(rangeFilter, { type: 'error' })),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'performance', label: 'initial_load' }) },
        {
          $group: {
            _id: null,
            samples: { $sum: 1 },
            ttfbMs: { $avg: '$meta.ttfbMs' },
            fcpMs: { $avg: '$meta.fcpMs' },
            lcpMs: { $avg: '$meta.lcpMs' },
            cls: { $avg: '$meta.cls' },
            loadMs: { $avg: '$meta.loadMs' },
            domContentLoadedMs: { $avg: '$meta.domContentLoadedMs' },
          },
        },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'performance', label: 'garden_ready' }) },
        { $group: { _id: null, samples: { $sum: 1 }, avgMs: { $avg: '$meta.ms' }, maxMs: { $max: '$meta.ms' } } },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'performance', label: 'loader_exit' }) },
        { $group: { _id: null, samples: { $sum: 1 }, avgMs: { $avg: '$meta.ms' }, maxMs: { $max: '$meta.ms' } } },
      ]).toArray(),
      events.aggregate([
        { $match: combine(rangeFilter, { type: 'performance', label: 'first_interaction' }) },
        { $group: { _id: null, samples: { $sum: 1 }, avgMs: { $avg: '$meta.ms' } } },
      ]).toArray(),
      pageviews.aggregate([
        { $match: validVisitorMatch },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$visitorId',
            lastSeen: { $first: '$createdAt' },
            firstSeen: { $min: '$createdAt' },
            pageviews: { $sum: 1 },
            sessionIds: { $addToSet: '$sessionId' },
            totalEngagedMs: { $sum: { $ifNull: ['$engagedMs', { $ifNull: ['$durationMs', 0] }] } },
            avgScrollPercent: { $avg: '$maxScrollPercent' },
            lastPath: { $first: '$path' },
            country: { $first: '$country' },
            city: { $first: '$city' },
            device: { $first: '$device' },
            browser: { $first: '$browser' },
            os: { $first: '$os' },
            language: { $first: '$language' },
            timezone: { $first: '$timezone' },
            effectiveType: { $first: '$effectiveType' },
            screenWidth: { $first: '$screenWidth' },
            screenHeight: { $first: '$screenHeight' },
            firstReferrer: { $last: '$referrer' },
          },
        },
        { $sort: { lastSeen: -1 } },
        { $limit: 500 },
      ]).toArray(),
      pageviews.aggregate([
        { $match: combine(rangeFilter, validVisitorMatch) },
        { $group: { _id: '$visitorId', sessionIds: { $addToSet: '$sessionId' }, pageviews: { $sum: 1 } } },
      ]).toArray(),
    ])

    const visitorIds = visitorRowsRaw.map((row) => row._id)
    const eventCountsByVisitor = visitorIds.length
      ? await events.aggregate([
          { $match: { visitorId: { $in: visitorIds } } },
          {
            $group: {
              _id: '$visitorId',
              totalEvents: { $sum: 1 },
              emailClicks: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'click'] }, { $eq: ['$label', 'email'] }] }, 1, 0] } },
              addressClicks: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'click'] }, { $eq: ['$label', 'address'] }] }, 1, 0] } },
              projectClicks: { $sum: { $cond: [{ $and: [{ $eq: ['$type', 'click'] }, { $eq: ['$label', 'project'] }] }, 1, 0] } },
              menuClicks: { $sum: { $cond: [{ $eq: ['$label', 'nav_link'] }, 1, 0] } },
              lastEventAt: { $max: '$createdAt' },
            },
          },
        ]).toArray()
      : []

    const eventMap = new Map(eventCountsByVisitor.map((row) => [row._id, row]))
    const visitors = visitorRowsRaw.map((row) => {
      const sessions = (row.sessionIds || []).filter((id) => id && id !== 'unknown')
      const eventRow = eventMap.get(row._id) || {}
      const sessionCount = sessions.length || (row.pageviews > 0 ? 1 : 0)
      return {
        id: row._id,
        shortId: row._id.slice(0, 8),
        firstSeen: row.firstSeen,
        lastSeen: row.lastSeen,
        pageviews: row.pageviews,
        sessions: sessionCount,
        returning: sessionCount >= 2,
        totalEngagedMs: row.totalEngagedMs || 0,
        avgEngagedMs: row.pageviews ? (row.totalEngagedMs || 0) / row.pageviews : 0,
        avgScrollPercent: row.avgScrollPercent ?? null,
        lastPath: row.lastPath || null,
        country: row.country || null,
        city: row.city || null,
        device: row.device || null,
        browser: row.browser || null,
        os: row.os || null,
        language: row.language || null,
        timezone: row.timezone || null,
        effectiveType: row.effectiveType || null,
        screen: row.screenWidth && row.screenHeight ? `${row.screenWidth}×${row.screenHeight}` : null,
        firstReferrer: row.firstReferrer ? normalizeReferrer(row.firstReferrer) : 'Direct / none',
        emailClicks: eventRow.emailClicks || 0,
        addressClicks: eventRow.addressClicks || 0,
        projectClicks: eventRow.projectClicks || 0,
        menuClicks: eventRow.menuClicks || 0,
        totalEvents: eventRow.totalEvents || 0,
      }
    })

    const repeatVisitorsInRange = repeatVisitorRows.filter((row) => {
      const sessions = (row.sessionIds || []).filter((id) => id && id !== 'unknown')
      return sessions.length >= 2
    }).length

    const session = sessionAgg[0] || {}
    const scroll = scrollAgg[0] || {}
    const topReferrers = referrersRaw.map((row) => ({ ...row, _id: normalizeReferrer(row._id) }))
    const screenRows = screenBreakdown.map((row) => ({ _id: `${row._id.w}×${row._id.h}`, count: row.count }))
    const campaignRows = campaignBreakdown.map((row) => ({
      _id: [row._id.source, row._id.medium, row._id.campaign].filter(Boolean).join(' / '),
      count: row.count,
      uniqueVisitors: row.uniqueVisitors,
    }))
    const topEventsRows = topEvents.map((row) => ({
      _id: `${row._id.type}${row._id.label ? `:${row._id.label}` : ''}`,
      count: row.count,
      uniqueVisitors: row.uniqueVisitors,
    }))

    const scrollPercent = (value) => (scroll.tracked ? (value / scroll.tracked) * 100 : null)
    const singlePageRate = session.sessions ? (session.singlePageSessions / session.sessions) * 100 : null
    const engagedSessionRate = session.sessions ? (session.engagedSessions / session.sessions) * 100 : null
    const contactConversionRate = uniqueVisitorsRange ? (uniqueContactClickers / uniqueVisitorsRange) * 100 : 0

    res.status(200).json({
      generatedAt: now,
      range,
      rangeStart,
      totalViews,
      rangeViews,
      views24h,
      views7d,
      views30d,
      uniqueVisitorsAll,
      uniqueVisitorsRange,
      uniqueVisitors24h,
      uniqueVisitors7d,
      uniqueVisitors30d,
      sessionsRange,
      repeatVisitorsInRange,
      avgPagesPerSession: msAverage(session.avgPagesPerSession),
      avgSessionDurationMs: msAverage(session.avgSessionDurationMs),
      singlePageRate,
      engagedSessionRate,
      avgScrollPercent: scroll.avg ?? null,
      scrollDepth: {
        tracked: scroll.tracked || 0,
        reached25: scrollPercent(scroll.reached25 || 0),
        reached50: scrollPercent(scroll.reached50 || 0),
        reached75: scrollPercent(scroll.reached75 || 0),
        reached90: scrollPercent(scroll.reached90 || 0),
      },
      emailClicks,
      addressClicks,
      uniqueEmailClickers,
      uniqueAddressClickers,
      uniqueContactClickers,
      contactConversionRate,
      topPages,
      topReferrers,
      topCountries,
      topCities,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      languageBreakdown,
      screenBreakdown: screenRows,
      connectionBreakdown,
      campaignBreakdown: campaignRows,
      dailyTrend,
      hourlyTraffic,
      weekdayTraffic,
      entryPages,
      exitPages,
      topEvents: topEventsRows,
      topUiClicks,
      topClickedProjects,
      navDestinations,
      audioBreakdown,
      contactTrend,
      recentContactEvents,
      recentErrors,
      errorCount,
      performance: {
        initialLoad: initialLoadPerf[0] || null,
        gardenReady: gardenPerf[0] || null,
        loaderExit: loaderPerf[0] || null,
        firstInteraction: firstInteractionPerf[0] || null,
      },
      visitors,
    })
  } catch (err) {
    console.error('stats error', err)
    res.status(500).json({ error: 'No se pudieron cargar las estadísticas', detail: err.message })
  }
}
