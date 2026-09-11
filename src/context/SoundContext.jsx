import { useEffect, useState } from 'react'
import { SoundContext } from './soundContextValue'

export const SoundProvider = ({ children }) => {
  const [muted, setMuted] = useState(true)

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
    audio.muted = true
    audio.play().catch(() => {})

    // Solo la PRIMERA interacción del usuario en toda la página activa el
    // sonido automáticamente. Se ignora a propósito si esa primera
    // interacción fue sobre el propio botón de sonido (data-sound-toggle):
    // ese caso ya lo maneja toggleSound() de forma explícita — sin esto,
    // el primer clic en el botón para APAGAR el sonido terminaba
    // reactivándolo por accidente, porque este listener global también se
    // disparaba con ese mismo clic.
    const unmuteOnFirstInteraction = (event) => {
      if (event.target?.closest?.('[data-sound-toggle]')) return
      audio.muted = false
      setMuted(false)
      if (audio.paused) audio.play().catch(() => {})
      window.removeEventListener('pointerdown', unmuteOnFirstInteraction, true)
      window.removeEventListener('keydown', unmuteOnFirstInteraction, true)
      window.removeEventListener('touchstart', unmuteOnFirstInteraction, true)
    }

    window.addEventListener('pointerdown', unmuteOnFirstInteraction, true)
    window.addEventListener('keydown', unmuteOnFirstInteraction, true)
    window.addEventListener('touchstart', unmuteOnFirstInteraction, true)

    return () => {
      window.removeEventListener('pointerdown', unmuteOnFirstInteraction, true)
      window.removeEventListener('keydown', unmuteOnFirstInteraction, true)
      window.removeEventListener('touchstart', unmuteOnFirstInteraction, true)
    }
  }, [])

  function toggleSound() {
    const audio = document.getElementById('background-audio')
    if (!audio) return
    const next = !audio.muted
    audio.muted = next
    if (!next && audio.paused) audio.play().catch(() => {})
    setMuted(next)
  }

  return <SoundContext.Provider value={[muted, toggleSound]}>{children}</SoundContext.Provider>
}
