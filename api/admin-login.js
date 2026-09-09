import { signSession, setSessionCookie } from './_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim()
    const adminPassword = (process.env.ADMIN_PASSWORD || '').trim()
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

    // Recortamos espacios de AMBOS lados: lo que escribió el usuario, y lo
    // que quedó guardado en la variable de entorno. Antes solo se recortaba
    // el email, no la contraseña — un espacio invisible en Vercel bastaba
    // para que nunca coincidiera.
    const typedEmail = email.trim().toLowerCase()
    const typedPassword = password.trim()

    const emailMatches = typedEmail === adminEmail.toLowerCase()
    const passwordMatches = typedPassword === adminPassword

    if (!emailMatches || !passwordMatches) {
      // Diagnóstico temporal: solo largos de texto, nunca el valor real.
      // Si typedPasswordLength !== storedPasswordLength, confirma que hay
      // un espacio o carácter de más/menos en algún lado.
      res.status(401).json({
        error: 'Credenciales inválidas',
        debug: {
          emailMatches,
          passwordMatches,
          typedEmailLength: typedEmail.length,
          storedEmailLength: adminEmail.length,
          typedPasswordLength: typedPassword.length,
          storedPasswordLength: adminPassword.length,
        },
      })
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
