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
    // No trackeamos el panel de admin como si fuera una visita normal del sitio
    if (pathname.startsWith('/admin')) return

    const visitorId = getVisitorId()
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        visitorId,
      }),
    }).catch(() => {})
  }, [pathname])
}

export default useTrackPageview
