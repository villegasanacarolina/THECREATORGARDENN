import { lazy, Suspense, useCallback, useContext, useEffect, useRef, useState } from 'react'
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
import { useSound } from './hooks/useSound'

const Admin = lazy(() => import('./pages/Admin'))
const GardenScene = lazy(() => import('./components/garden/GardenScene'))
const LoadingScreen = lazy(() => import('./components/garden/LoadingScreen'))

const App = () => {
  const { pathname } = useLocation()
  const [navOpen] = useContext(NavbarContext)
  const [, , startSound, prepareSound] = useSound()
  const [hasOpenedGarden, setHasOpenedGarden] = useState(false)
  const [gardenProgress, setGardenProgress] = useState(0)
  const [gardenReady, setGardenReady] = useState(false)
  const [initialLoaderDone, setInitialLoaderDone] = useState(false)
  const [gardenError, setGardenError] = useState(null)
  const firstSoundGestureHandledRef = useRef(false)
  useTrackPageview()

  const isHome = pathname === '/'
  const isWork = pathname === '/work' || pathname === '/projects'

  useEffect(() => {
    if (isHome || isWork || navOpen) setHasOpenedGarden(true)
  }, [isHome, isWork, navOpen])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const handleGardenReady = useCallback(() => {
    setGardenProgress(100)
    setGardenReady(true)
  }, [])

  const handleGardenError = useCallback((err) => {
    setGardenError(err?.message || 'error desconocido')
  }, [])

  const handleLoaderExited = useCallback(() => {
    setInitialLoaderDone(true)
    prepareSound?.()
  }, [prepareSound])

  useEffect(() => {
    if (!initialLoaderDone || firstSoundGestureHandledRef.current) return undefined

    const handleFirstGesture = (event) => {
      // If the very first interaction is the speaker itself, let that control
      // handle the user's intent and do not run an extra global play call.
      if (event.target instanceof Element && event.target.closest('[data-sound-toggle]')) {
        firstSoundGestureHandledRef.current = true
        window.removeEventListener('pointerdown', handleFirstGesture, true)
        return
      }

      firstSoundGestureHandledRef.current = true
      startSound?.()
      window.removeEventListener('pointerdown', handleFirstGesture, true)
    }

    window.addEventListener('pointerdown', handleFirstGesture, true)
    return () => window.removeEventListener('pointerdown', handleFirstGesture, true)
  }, [initialLoaderDone, startSound])

  return (
    <div className='overflow-x-clip'>
      <Navbar />

      <Suspense fallback={null}>
        {hasOpenedGarden && (
          <div
            className={`pointer-events-none fixed inset-0 bg-[#e5e5e5] ${navOpen ? 'z-[45]' : 'z-0'} ${isHome || isWork || navOpen ? 'visible' : 'invisible'}`}
            aria-hidden='true'
          >
            <GardenScene
              initialize
              onProgress={setGardenProgress}
              onReady={handleGardenReady}
              onError={handleGardenError}
            />
          </div>
        )}
        {isHome && !initialLoaderDone && (
          <LoadingScreen progress={gardenProgress} ready={gardenReady} onExited={handleLoaderExited} />
        )}
      </Suspense>

      {gardenError && (
        <div className='fixed bottom-2 left-2 z-[70] max-w-xs rounded bg-red-600 px-3 py-2 font-[font1] text-xs text-white'>
          No se pudo cargar la animación 3D: {gardenError}
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
