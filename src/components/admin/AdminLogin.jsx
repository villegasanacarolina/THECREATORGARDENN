import { useState } from 'react'

const AdminLogin = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [debug, setDebug] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setDebug(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'No se pudo iniciar sesión')
        if (data.debug) setDebug(data.debug)
        setLoading(false)
        return
      }
      onSuccess()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-black px-4 text-white'>
      <form onSubmit={handleSubmit} className='w-full max-w-sm space-y-4'>
        <h1 className='mb-6 font-[font2] text-3xl uppercase'>Admin</h1>
        <input
          type='email'
          placeholder='Correo'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='username'
          className='w-full rounded border border-white/30 bg-transparent px-4 py-3 font-[font1] outline-none focus:border-[#D3FD50]'
          required
        />
        <input
          type='password'
          placeholder='Contraseña'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete='current-password'
          className='w-full rounded border border-white/30 bg-transparent px-4 py-3 font-[font1] outline-none focus:border-[#D3FD50]'
          required
        />
        {error && <p className='text-sm text-red-400'>{error}</p>}
        {debug && (
          <div className='rounded border border-red-400/40 bg-red-400/10 p-3 font-[font1] text-xs text-red-300'>
            <p>email coincide: {String(debug.emailMatches)}</p>
            <p>contraseña coincide: {String(debug.passwordMatches)}</p>
            <p>largo escrito (correo): {debug.typedEmailLength} — guardado: {debug.storedEmailLength}</p>
            <p>largo escrito (contraseña): {debug.typedPasswordLength} — guardado: {debug.storedPasswordLength}</p>
          </div>
        )}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-full border-2 border-white py-3 font-[font2] uppercase transition-colors hover:border-[#D3FD50] hover:text-[#D3FD50] disabled:opacity-50'
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default AdminLogin