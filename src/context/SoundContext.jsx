import { useCallback, useEffect, useState } from 'react'
import { SoundContext } from './soundContextValue'

export const SoundProvider = ({ children }) => {
  const [muted, setMuted] = useState(false)

  const getAudio = useCallback(() => document.getElementById('background-audio'), [])

  useEffect(() => {
    let audio = getAudio()
    if (!audio) {
      audio = document.createElement('audio')
      audio.id = 'background-audio'
      audio.src = '/GRIMES.MP3'
      // No descargamos el MP3 mientras la escena 3D está cargando. En móvil
      // esto evita competir por ancho de banda con el GLB y acelera el loader.
      audio.preload = 'none'
      audio.loop = true
      audio.playsInline = true
      audio.setAttribute('aria-hidden', 'true')
      document.body.appendChild(audio)
    }

    audio.volume = 0.8
    audio.loop = true
    audio.muted = false
    setMuted(false)
  }, [getAudio])

  const startSound = useCallback(() => {
    const audio = getAudio()
    if (!audio || audio.dataset.userMuted === 'true') return

    audio.preload = 'auto'
    audio.muted = false
    audio.play().then(() => {
      setMuted(false)
    }).catch(() => {
      // Safari/Chrome pueden bloquear autoplay con sonido. No añadimos un
      // listener global de clic: si el navegador lo bloquea, solo la bocina
      // puede activarlo después, tal como se pidió.
      audio.muted = true
      setMuted(true)
    })
  }, [getAudio])

  const toggleSound = useCallback(() => {
    const audio = getAudio()
    if (!audio) return

    const nextMuted = !audio.muted
    audio.muted = nextMuted
    audio.dataset.userMuted = nextMuted ? 'true' : 'false'

    if (!nextMuted) {
      audio.preload = 'auto'
      audio.play().then(() => setMuted(false)).catch(() => {
        audio.muted = true
        audio.dataset.userMuted = 'true'
        setMuted(true)
      })
      return
    }

    setMuted(true)
  }, [getAudio])

  return <SoundContext.Provider value={[muted, toggleSound, startSound]}>{children}</SoundContext.Provider>
}
