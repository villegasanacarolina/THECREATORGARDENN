function getVisitorId() {
  try {
    return localStorage.getItem('tcg_visitor_id') || 'unknown'
  } catch {
    return 'unknown'
  }
}

function getSessionId() {
  try {
    const raw = localStorage.getItem('tcg_session')
    return raw ? JSON.parse(raw)?.id || null : null
  } catch {
    return null
  }
}

export function trackEvent(type, label, meta) {
  try {
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        label: label || null,
        meta: meta || null,
        path: window.location.pathname,
        url: `${window.location.pathname}${window.location.search || ''}`,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    // La analítica nunca debe romper la experiencia del visitante.
  }
}
