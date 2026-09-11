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
import useTrackPageview from './hooks/useTrackPageview'
import { NavbarContext } from './context/NavContext'

// Cargado bajo demanda: /admin trae su propia librería de gráficas
// (recharts), así que solo se descarga cuando alguien de verdad entra ahí
// — el resto de los visitantes nunca paga ese peso extra.
const Admin = lazy(() => import('./pages/Admin'))

// Igual que Admin: three.js (la animación 3D) solo se descarga cuando hace
// falta — al entrar a Home, o al abrir el menú desde cualquier otra página.
const GardenScene = lazy(() => import('./components/garden/GardenScene'))
const LoadingScreen = lazy(() => import('./components/garden/LoadingScreen'))

const App = () => {
  const { pathname } = useLocation()
  const [navOpen] = useContext(NavbarContext)
  const [hasOpenedGarden, setHasOpenedGarden] = useState(false)
  const [gardenProgress, setGardenProgress] = useState(0)
  const [gardenReady, setGardenReady] = useState(false)
  const [gardenError, setGardenError] = useState(null)
  const [gardenDebug, setGardenDebug] = useState([])
  useTrackPageview()

  const isHome = pathname === '/'

  useEffect(() => {
    if (isHome || navOpen) setHasOpenedGarden(true)
  }, [isHome, navOpen])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
        Una sola instancia de la animación 3D, compartida entre Home y el
        menú — así nunca se carga el modelo dos veces. Cuando el menú
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
              onDebug={(msg) => setGardenDebug((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`])}
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

      {/* Panel de diagnóstico temporal: visible directo en la página, sin
          necesitar herramientas de desarrollador. Se puede quitar una vez
          que confirmemos que la animación funciona. */}
      {gardenDebug.length > 0 && (
        <div className='fixed bottom-2 right-2 z-[70] max-w-sm space-y-1 rounded bg-black/90 px-3 py-2 font-mono text-[10px] text-lime-400'>
          {gardenDebug.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

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
