import bcrypt from 'bcryptjs'
import { signSession, setSessionCookie } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  if (!adminEmail || !adminPasswordHash) {
    res.status(500).json({ error: 'Las credenciales de admin no están configuradas en el servidor' })
    return
  }

  const { email, password } = req.body || {}

  if (!email || !password) {
    res.status(400).json({ error: 'Correo y contraseña son requeridos' })
    return
  }

  const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase()
  const passwordMatches = emailMatches ? await bcrypt.compare(password, adminPasswordHash) : false

  if (!emailMatches || !passwordMatches) {
    res.status(401).json({ error: 'Credenciales inválidas' })
    return
  }

  const token = signSession()
  setSessionCookie(res, token)
  res.status(200).json({ ok: true })
}
