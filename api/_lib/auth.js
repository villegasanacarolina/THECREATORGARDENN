import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'tcg_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 días

export function signSession() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no está configurada en las variables de entorno')
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: MAX_AGE_SECONDS })
}

export function verifySession(token) {
  const secret = process.env.JWT_SECRET
  if (!secret || !token) return false
  try {
    const payload = jwt.verify(token, secret)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export function setSessionCookie(res, token) {
  const isProd = process.env.VERCEL_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Strict${isProd ? '; Secure' : ''}`,
  )
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`)
}

export function getSessionToken(req) {
  const cookieHeader = req.headers.cookie || ''
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`))
  return match ? match.split('=')[1] : null
}
