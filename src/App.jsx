import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Approach from './pages/Approach'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Navbar from './components/Navigation/Navbar'
import FullScreenNav from './components/Navigation/FullScreenNav'
import Stairs from './components/common/Stairs'
import useTrackPageview from './hooks/useTrackPageview'

// Cargado bajo demanda: /admin trae su propia librería de gráficas
// (recharts), así que solo se descarga cuando alguien de verdad entra ahí
// — el resto de los visitantes nunca paga ese peso extra.
const Admin = lazy(() => import('./pages/Admin'))

const App = () => {
  const { pathname } = useLocation()
  useTrackPageview()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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

    const unmute = () => {
      audio.muted = false
      if (audio.paused) audio.play().catch(() => {})
      window.removeEventListener('pointerdown', unmute, true)
      window.removeEventListener('keydown', unmute, true)
      window.removeEventListener('touchstart', unmute, true)
    }

    window.addEventListener('pointerdown', unmute, true)
    window.addEventListener('keydown', unmute, true)
    window.addEventListener('touchstart', unmute, true)

    return () => {
      window.removeEventListener('pointerdown', unmute, true)
      window.removeEventListener('keydown', unmute, true)
      window.removeEventListener('touchstart', unmute, true)
    }
  }, [])

  return (
    <div className='overflow-x-hidden'>
      {/*
        Navbar y FullScreenNav viven FUERA de Stairs a propósito: Stairs le
        aplica un transform (scale) a todo lo que envuelve para la animación
        de transición, y en CSS eso convierte a ese contenedor en el punto de
        referencia de cualquier position:fixed de adentro. Si el menú quedaba
        adentro, dejaba de estar fijo a la pantalla real y pasaba a estar fijo
        a la altura de TODA la página — de ahí el bug de que el menú "se
        perdía" o se dibujaba traslapado. Ahora el menú queda siempre fijo a
        la ventana, sin importar el scroll ni las transiciones de página.
      */}
      <Navbar />
      <FullScreenNav />
      <Stairs>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/work' element={<Projects />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/approach' element={<Approach />} />
          <Route path='/services' element={<Services />} />
          <Route path='/contact' element={<Contact />} />
          {/* Ruta oculta: no aparece en ningún menú. Se llega vía el logo (5 clics rápidos). */}
          <Route
            path='/admin'
            element={
              <Suspense fallback={<div className='flex min-h-screen items-center justify-center bg-black font-[font1] text-white'>Cargando…</div>}>
                <Admin />
              </Suspense>
            }
          />
        </Routes>
      </Stairs>
    </div>
  )
}

export default App
