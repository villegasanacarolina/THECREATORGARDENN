import { useCallback, useEffect, useState } from 'react'
import { SoundContext } from './soundContextValue'
import { trackEvent } from '../lib/trackEvent'

export const SoundProvider = ({ children }) => {
  const [muted, setMuted] = useState(false)

  const getAudio = useCallback(() => document.getElementById('background-audio'), [])

  useEffect(() => {
    let audio = getAudio()
    if (!audio) {
      audio = document.createElement('audio')
      audio.id = 'background-audio'
      audio.src = '/GRIMES.MP3'
      // Do not compete with the 3D model during the initial load.
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

  const prepareSound = useCallback(() => {
    const audio = getAudio()
    if (!audio || audio.dataset.userMuted === 'true') return

    // The 3D scene is already visible at this point, so the audio can buffer
    // without slowing the loader. We still do NOT play it until the user's
    // first real interaction.
    if (audio.preload !== 'auto') {
      audio.preload = 'auto'
      audio.load()
    }
  }, [getAudio])

  const startSound = useCallback(() => {
    const audio = getAudio()
    if (!audio || audio.dataset.userMuted === 'true') return

    audio.preload = 'auto'
    audio.muted = false
    audio.play().then(() => {
      audio.dataset.userStarted = 'true'
      setMuted(false)
      trackEvent('audio', 'started', { trigger: 'first_interaction' })
    }).catch(() => {
      // startSound is called from a user gesture, so modern browsers should
      // allow it. If one still blocks it, leave the speaker state muted and
      // let the explicit speaker button be the only retry mechanism.
      audio.muted = true
      setMuted(true)
      trackEvent('audio', 'blocked', { trigger: 'first_interaction' })
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
      audio.play().then(() => {
        audio.dataset.userStarted = 'true'
        setMuted(false)
        trackEvent('audio', 'unmuted', { trigger: 'speaker_button' })
      }).catch(() => {
        audio.muted = true
        audio.dataset.userMuted = 'true'
        setMuted(true)
        trackEvent('audio', 'blocked', { trigger: 'speaker_button' })
      })
      return
    }

    setMuted(true)
    trackEvent('audio', 'muted', { trigger: 'speaker_button' })
  }, [getAudio])

  return (
    <SoundContext.Provider value={[muted, toggleSound, startSound, prepareSound]}>
      {children}
    </SoundContext.Provider>
  )
}
