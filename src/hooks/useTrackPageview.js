import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

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

const useTrackPageview = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined

    const visitorId = getVisitorId()
    const pageviewId = crypto.randomUUID()
    const startTime = Date.now()
    let maxScrollPercent = 0

    const computeScrollPercent = () => {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      if (scrollable <= 0) return 100
      return Math.min(100, Math.round((window.scrollY / scrollable) * 100))
    }

    const onScroll = () => {
      const percent = computeScrollPercent()
      if (percent > maxScrollPercent) maxScrollPercent = percent
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        visitorId,
        pageviewId,
        language: navigator.language || null,
        screenWidth: window.screen?.width || null,
        screenHeight: window.screen?.height || null,
        viewportWidth: window.innerWidth || null,
        viewportHeight: window.innerHeight || null,
      }),
    }).catch(() => {})

    // Manda cuánto tiempo estuvo y qué tanto scrolleó. sendBeacon funciona
    // incluso cuando la pestaña se está cerrando (fetch normal ahí no
    // garantiza completarse).
    const sendExit = () => {
      const durationMs = Date.now() - startTime
      const payload = JSON.stringify({ pageviewId, durationMs, maxScrollPercent })
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
      if (document.visibilityState === 'hidden') sendExit()
    }

    window.addEventListener('pagehide', sendExit)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pagehide', sendExit)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      // Al cambiar de ruta dentro de la SPA no se dispara pagehide, así que
      // mandamos el cierre de esta página nosotros mismos aquí.
      sendExit()
    }
  }, [pathname])
}

export default useTrackPageview
