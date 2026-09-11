import { lazy, Suspense, useContext, useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Approach from './pages/Approach'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Navbar from './components/Navigation/Navbar'
import FullScreenNav from './components/Navigation/FullScreenNav'
import Stairs from './components/common/Stairs'
import SoundIcon from './components/common/SoundIcon'
import useTrackPageview from './hooks/useTrackPageview'
import { NavbarContext, NavbarColorContext } from './context/NavContext'

// Cargado bajo demanda: /admin trae su propia librería de gráficas
// (recharts), así que solo se descarga cuando alguien de verdad entra ahí
// — el resto de los visitantes nunca paga ese peso extra.
const Admin = lazy(() => import('./pages/Admin'))

// Igual que Admin: three.js (la animación 3D) solo se descarga cuando hace
// falta — al entrar a Home o Work, o al abrir el menú desde cualquier otra
// página.
const GardenScene = lazy(() => import('./components/garden/GardenScene'))
const LoadingScreen = lazy(() => import('./components/garden/LoadingScreen'))

const App = () => {
  const { pathname } = useLocation()
  const [navOpen] = useContext(NavbarContext)
  const [navColor] = useContext(NavbarColorContext)
  const [hasOpenedGarden, setHasOpenedGarden] = useState(false)
  const [gardenProgress, setGardenProgress] = useState(0)
  const [gardenReady, setGardenReady] = useState(false)
  const [gardenError, setGardenError] = useState(null)
  const [soundMuted, setSoundMuted] = useState(true)
  useTrackPageview()

  const isHome = pathname === '/'
  const isWork = pathname === '/work' || pathname === '/projects'

  useEffect(() => {
    if (isHome || isWork || navOpen) setHasOpenedGarden(true)
  }, [isHome, isWork, navOpen])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Música de fondo: arranca SIEMPRE silenciada (los navegadores solo
  // permiten autoplay sin sonido) y solo se activa cuando el usuario le da
  // clic al botón de sonido — nunca por ningún otro clic en la página. Así
  // nunca se "reactiva sola" después de que la silencias a propósito.
  useEffect(() => {
    let audio = document.getElementById('background-audio')
    if (!audio) {
      audio = document.createElement('audio')
      audio.id = 'background-audio'
      audio.src = '/GRIMES.MP3'
      audio.preload = 'auto'
      audio.loop = true
      audio.muted = true
      audio.setAttribute('aria-hidden', 'true')
      document.body.appendChild(audio)
    }
    audio.volume = 0.8
    audio.play().catch(() => {})
  }, [])

  function toggleSound() {
    const audio = document.getElementById('background-audio')
    if (!audio) return
    const next = !audio.muted
    audio.muted = next
    if (!next && audio.paused) audio.play().catch(() => {})
    setSoundMuted(next)
  }

  return (
    <div className='overflow-x-clip'>
      {/*
        Navbar y FullScreenNav viven FUERA de Stairs a propósito: Stairs le
        aplica un transform a todo lo que envuelve para la animación de
        transición, y en CSS eso convierte a ese contenedor en el punto de
        referencia de cualquier position:fixed de adentro. Si el menú quedaba
        adentro, dejaba de estar fijo a la pantalla real.
      */}
      <Navbar />

      {/*
        Una sola instancia de la animación 3D, compartida entre Home, Work y
        el menú — así nunca se carga el modelo dos veces. Cuando el menú
        está cerrado vive detrás de todo (z-0); cuando se abre, sube por
        encima del contenido de la página pero sigue debajo del texto del
        menú (z-45 < z-50 del menú).
      */}
      <Suspense fallback={null}>
        {hasOpenedGarden && (
          <div className={`pointer-events-none fixed inset-0 ${navOpen ? 'z-[45]' : 'z-0'}`}>
            <GardenScene
              initialize
              onProgress={setGardenProgress}
              onReady={() => setGardenReady(true)}
              onError={(err) => setGardenError(err?.message || 'error desconocido')}
            />
          </div>
        )}
        {isHome && <LoadingScreen progress={gardenProgress} ready={gardenReady} />}
      </Suspense>

      {gardenError && (
        <div className='fixed bottom-2 left-2 z-[70] max-w-xs rounded bg-red-600 px-3 py-2 font-[font1] text-xs text-white'>
          No se pudo cargar la animación 3D: {gardenError}
        </div>
      )}

      <FullScreenNav />

      {/* Botón de sonido: muy pequeño, pegado justo a la izquierda de
          About/Close. z-[55] para estar siempre visible sin importar si el
          menú está abierto. */}
      <button
        type='button'
        aria-label={soundMuted ? 'Activar sonido' : 'Desactivar sonido'}
        onClick={toggleSound}
        className={`fixed right-14 top-2 z-[55] p-2 transition-colors lg:right-24 lg:top-4 ${navColor === 'black' ? 'text-black/50 hover:text-black' : 'text-white/50 hover:text-white'}`}
      >
        <SoundIcon muted={soundMuted} className='h-4 w-4 lg:h-5 lg:w-5' />
      </button>

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
