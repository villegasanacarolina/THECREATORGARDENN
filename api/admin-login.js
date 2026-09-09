import { signSession, setSessionCookie } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD
    const jwtSecret = process.env.JWT_SECRET

    const missing = []
    if (!adminEmail) missing.push('ADMIN_EMAIL')
    if (!adminPassword) missing.push('ADMIN_PASSWORD')
    if (!jwtSecret) missing.push('JWT_SECRET')

    if (missing.length > 0) {
      res.status(500).json({ error: `Faltan estas variables de entorno en Vercel: ${missing.join(', ')}` })
      return
    }

    const { email, password } = req.body || {}

    if (!email || !password) {
      res.status(400).json({ error: 'Correo y contraseña son requeridos' })
      return
    }

    const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
    const passwordMatches = password === adminPassword

    if (!emailMatches || !passwordMatches) {
      res.status(401).json({ error: 'Credenciales inválidas' })
      return
    }

    const token = signSession()
    setSessionCookie(res, token)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('admin-login error', err)
    res.status(500).json({ error: 'Error inesperado al iniciar sesión', detail: err.message })
  }
}