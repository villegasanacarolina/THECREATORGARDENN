function getVisitorId() {
  try {
    return localStorage.getItem('tcg_visitor_id') || 'unknown'
  } catch {
    return 'unknown'
  }
}

// Uso: trackEvent('click', 'email') / trackEvent('click', 'project', { project: 'charlotte-tilbury' })
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
        visitorId: getVisitorId(),
      }),
    }).catch(() => {})
  } catch {
    // no-op: nunca debe romper la navegación del visitante
  }
}
