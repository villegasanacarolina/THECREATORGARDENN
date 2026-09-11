import { useEffect, useState } from 'react'
import { SoundContext } from './soundContextValue'

export const SoundProvider = ({ children }) => {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    let audio = document.getElementById('background-audio')
    if (!audio) {
      audio = document.createElement('audio')
      audio.id = 'background-audio'
      audio.src = '/GRIMES.MP3'
      audio.preload = 'auto'
      audio.loop = true
      audio.setAttribute('aria-hidden', 'true')
      document.body.appendChild(audio)
    }

    audio.volume = 0.8
    audio.loop = true
    audio.muted = false

    // Intentamos iniciar el audio únicamente al entrar a la página. Algunos
    // navegadores bloquean el autoplay con sonido; si eso ocurre, el estado
    // queda silenciado y la única forma de activarlo es el botón de bocina.
    audio.play().catch(() => {
      audio.muted = true
      setMuted(true)
    })

    setMuted(audio.muted)
  }, [])

  function toggleSound() {
    const audio = document.getElementById('background-audio')
    if (!audio) return

    const nextMuted = !audio.muted
    audio.muted = nextMuted

    if (!nextMuted && audio.paused) {
      audio.play().catch(() => {
        audio.muted = true
        setMuted(true)
      })
    }

    setMuted(nextMuted)
  }

  return <SoundContext.Provider value={[muted, toggleSound]}>{children}</SoundContext.Provider>
}
