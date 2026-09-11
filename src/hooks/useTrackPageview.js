import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SESSION_TIMEOUT_MS = 30 * 60 * 1000

function getVisitorId() {
  try {
    let id = localStorage.getItem('tcg_visitor_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('tcg_visitor_id', id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

function getSessionId() {
  try {
    const now = Date.now()
    const raw = localStorage.getItem('tcg_session')
    let current = raw ? JSON.parse(raw) : null

    if (!current?.id || !current?.lastActivity || now - current.lastActivity > SESSION_TIMEOUT_MS) {
      current = { id: crypto.randomUUID(), startedAt: now, lastActivity: now }
    } else {
      current.lastActivity = now
    }

    localStorage.setItem('tcg_session', JSON.stringify(current))
    return current.id
  } catch {
    return 'unknown'
  }
}

function getClientInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const orientation = window.screen?.orientation?.type || null
  const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  return {
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    platform: navigator.userAgentData?.platform || navigator.platform || null,
    screenWidth: window.screen?.width || null,
    screenHeight: window.screen?.height || null,
    viewportWidth: window.innerWidth || null,
    viewportHeight: window.innerHeight || null,
    pixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemory: navigator.deviceMemory || null,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    connectionType: connection?.type || null,
    effectiveType: connection?.effectiveType || null,
    downlink: connection?.downlink || null,
    saveData: connection?.saveData || false,
    orientation,
    colorScheme,
    standalone: window.matchMedia?.('(display-mode: standalone)').matches || false,
  }
}

const useTrackPageview = () => {
  const { pathname, search } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined

    const visitorId = getVisitorId()
    const sessionId = getSessionId()
    const pageviewId = crypto.randomUUID()
    const startTime = Date.now()
    let maxScrollPercent = 0
    let engagedMs = 0
    let visibleStartedAt = document.visibilityState === 'visible' ? Date.now() : null

    const computeScrollPercent = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      if (scrollable <= 0) return 100
      return Math.min(100, Math.round((window.scrollY / scrollable) * 100))
    }

    maxScrollPercent = computeScrollPercent()

    const onScroll = () => {
      const percent = computeScrollPercent()
      if (percent > maxScrollPercent) maxScrollPercent = percent
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    const params = new URLSearchParams(search)
    const clientInfo = getClientInfo()

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        query: search || null,
        url: `${pathname}${search || ''}`,
        title: document.title || null,
        referrer: document.referrer || null,
        visitorId,
        sessionId,
        pageviewId,
        language: navigator.language || null,
        utmSource: params.get('utm_source'),
        utmMedium: params.get('utm_medium'),
        utmCampaign: params.get('utm_campaign'),
        utmContent: params.get('utm_content'),
        utmTerm: params.get('utm_term'),
        ...clientInfo,
      }),
    }).catch(() => {})

    const getCurrentEngagedMs = () => {
      if (visibleStartedAt == null) return engagedMs
      return engagedMs + (Date.now() - visibleStartedAt)
    }

    const sendExit = () => {
      const durationMs = Date.now() - startTime
      const payload = JSON.stringify({
        pageviewId,
        durationMs,
        engagedMs: getCurrentEngagedMs(),
        maxScrollPercent,
      })

      try {
        navigator.sendBeacon('/api/track-exit', new Blob([payload], { type: 'application/json' }))
      } catch {
        fetch('/api/track-exit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (visibleStartedAt != null) {
          engagedMs += Date.now() - visibleStartedAt
          visibleStartedAt = null
        }
        sendExit()
      } else if (visibleStartedAt == null) {
        visibleStartedAt = Date.now()
      }
    }

    window.addEventListener('pagehide', sendExit)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', sendExit)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      sendExit()
    }
  }, [pathname, search])
}

export default useTrackPageview
