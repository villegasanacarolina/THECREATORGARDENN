import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/trackEvent'

const safeText = (value, max = 90) => {
  if (!value) return null
  return value.replace(/\s+/g, ' ').trim().slice(0, max) || null
}

const useExperienceAnalytics = () => {
  const { pathname } = useLocation()
  const mountedAtRef = useRef(typeof performance !== 'undefined' ? performance.now() : 0)

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined

    let errorCount = 0
    let clickHistory = []

    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('a,button,[role="button"]') : null
      if (!target) return

      const rect = target.getBoundingClientRect()
      const href = target instanceof HTMLAnchorElement ? target.getAttribute('href') : null
      const label =
        target.getAttribute('data-analytics-label') ||
        (href?.startsWith('mailto:') ? 'email' : null) ||
        (href?.includes('maps.google') ? 'address' : null) ||
        target.getAttribute('aria-label') ||
        safeText(target.textContent) ||
        target.tagName.toLowerCase()

      trackEvent('ui_click', label, {
        tag: target.tagName.toLowerCase(),
        text: safeText(target.textContent),
        href: href ? href.slice(0, 180) : null,
        xPct: window.innerWidth ? Math.round((event.clientX / window.innerWidth) * 1000) / 10 : null,
        yPct: window.innerHeight ? Math.round((event.clientY / window.innerHeight) * 1000) / 10 : null,
        targetWidth: Math.round(rect.width),
        targetHeight: Math.round(rect.height),
      })

      const now = Date.now()
      clickHistory = clickHistory.filter((item) => now - item.time < 1200)
      clickHistory.push({ time: now, x: event.clientX, y: event.clientY })
      const nearby = clickHistory.filter((item) => Math.hypot(item.x - event.clientX, item.y - event.clientY) < 45)
      if (nearby.length >= 3) {
        trackEvent('friction', 'rage_click', { label, count: nearby.length })
        clickHistory = []
      }
    }

    const onFirstInteraction = (event) => {
      try {
        if (sessionStorage.getItem('tcg_first_interaction_tracked') === '1') return
        sessionStorage.setItem('tcg_first_interaction_tracked', '1')
      } catch {
        // continue without sessionStorage
      }

      trackEvent('performance', 'first_interaction', {
        ms: Math.max(0, Math.round(performance.now() - mountedAtRef.current)),
        kind: event.type,
      })
    }

    const onError = (event) => {
      if (errorCount >= 10) return
      errorCount += 1
      trackEvent('error', 'javascript', {
        message: safeText(event.message, 180),
        source: safeText(event.filename, 160),
        line: event.lineno || null,
        column: event.colno || null,
      })
    }

    const onUnhandledRejection = (event) => {
      if (errorCount >= 10) return
      errorCount += 1
      trackEvent('error', 'unhandled_rejection', {
        message: safeText(event.reason?.message || String(event.reason || 'Unknown rejection'), 180),
      })
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('pointerdown', onFirstInteraction, { once: true, capture: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true, capture: true })
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)

    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('pointerdown', onFirstInteraction, true)
      window.removeEventListener('keydown', onFirstInteraction, true)
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [pathname])

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined
    if (typeof performance === 'undefined') return undefined

    try {
      if (sessionStorage.getItem('tcg_perf_tracked') === '1') return undefined
    } catch {
      // continue
    }

    let lcp = null
    let cls = 0
    let perfObserverLcp = null
    let perfObserverCls = null

    try {
      perfObserverLcp = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const last = entries[entries.length - 1]
        if (last) lcp = Math.round(last.startTime)
      })
      perfObserverLcp.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {
      // unsupported browser
    }

    try {
      perfObserverCls = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) cls += entry.value
        }
      })
      perfObserverCls.observe({ type: 'layout-shift', buffered: true })
    } catch {
      // unsupported browser
    }

    const timer = window.setTimeout(() => {
      const nav = performance.getEntriesByType('navigation')[0]
      const fcp = performance.getEntriesByName('first-contentful-paint')[0]

      trackEvent('performance', 'initial_load', {
        dnsMs: nav ? Math.round(nav.domainLookupEnd - nav.domainLookupStart) : null,
        connectMs: nav ? Math.round(nav.connectEnd - nav.connectStart) : null,
        ttfbMs: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
        responseMs: nav ? Math.round(nav.responseEnd - nav.responseStart) : null,
        domInteractiveMs: nav ? Math.round(nav.domInteractive) : null,
        domContentLoadedMs: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
        loadMs: nav ? Math.round(nav.loadEventEnd || nav.duration) : null,
        fcpMs: fcp ? Math.round(fcp.startTime) : null,
        lcpMs: lcp,
        cls: Math.round(cls * 1000) / 1000,
        transferSize: nav?.transferSize || null,
      })

      try {
        sessionStorage.setItem('tcg_perf_tracked', '1')
      } catch {
        // no-op
      }
      perfObserverLcp?.disconnect()
      perfObserverCls?.disconnect()
    }, 5000)

    return () => {
      window.clearTimeout(timer)
      perfObserverLcp?.disconnect()
      perfObserverCls?.disconnect()
    }
  }, [pathname])
}

export default useExperienceAnalytics
