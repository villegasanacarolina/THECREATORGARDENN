// Info compartida que sacamos de cada request: quién es, desde dónde,
// con qué dispositivo/navegador. La usan track.js y event.js por igual.
export function getRequestInfo(req) {
  const userAgent = req.headers['user-agent'] || ''
  const country = req.headers['x-vercel-ip-country'] || null
  const city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || null
  const { browser, device, os } = parseUserAgent(userAgent)
  return { userAgent, country, city, ip, browser, device, os }
}

function parseUserAgent(ua) {
  const device = /Mobi|Android/i.test(ua) ? 'mobile' : /iPad|Tablet/i.test(ua) ? 'tablet' : 'desktop'

  let browser = 'Otro'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome'
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'

  let os = 'Otro'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/Mac OS X/.test(ua)) os = 'macOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return { browser, device, os }
}
