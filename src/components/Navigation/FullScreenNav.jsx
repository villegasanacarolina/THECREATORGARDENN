import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarContext } from '../../context/NavContext'
import SmokeText from './SmokeText'

const links = [
  { label: 'Work', hover: 'See everything', to: '/work' },
  { label: 'Our Approach', hover: 'How we work', to: '/approach' },
  { label: 'Services', hover: 'What we do', to: '/services' },
  { label: 'Contact', hover: 'Write us', to: '/contact' },
]

// Cuánto se espera después del clic (para que se alcance a ver la
// transición de humo) antes de navegar de verdad a la página.
const NAVIGATE_DELAY_MS = 850

const FullScreenNav = () => {
  const [navOpen, setNavOpen] = useContext(NavbarContext)
  const [activeIndex, setActiveIndex] = useState(null)
  const navigate = useNavigate()
  const navigateTimeoutRef = useRef(null)

  function go(path, index) {
    setActiveIndex(index)
    clearTimeout(navigateTimeoutRef.current)
    navigateTimeoutRef.current = setTimeout(() => {
      window.scrollTo(0, 0)
      navigate(path)
      setNavOpen(false)
      setActiveIndex(null)
    }, NAVIGATE_DELAY_MS)
  }

  // Close siempre regresa a Home, sin importar en qué página estabas
  // cuando abriste el menú.
  function closeMenu() {
    clearTimeout(navigateTimeoutRef.current)
    setActiveIndex(null)
    window.scrollTo(0, 0)
    navigate('/')
    setNavOpen(false)
  }

  function gsapAnimation() {
    const tl = gsap.timeline()
    tl.set('.nav-link-item', { opacity: 0, y: 20 })
    tl.set('.fullscreennav', { display: 'block' })
    tl.to('.nav-link-item', { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out' })
  }

  function gsapAnimationReverse() {
    clearTimeout(navigateTimeoutRef.current)
    setActiveIndex(null)
    const tl = gsap.timeline()
    tl.to('.nav-link-item', { opacity: 0, y: -20, stagger: 0.04, duration: 0.3, ease: 'power2.in' })
    tl.set('.fullscreennav', { display: 'none' })
  }

  useGSAP(() => {
    if (navOpen) gsapAnimation()
    else gsapAnimationReverse()
  }, [navOpen])

  return (
    // Sin fondo propio a propósito: la animación 3D que se ve detrás es la
    // instancia GLOBAL compartida (ver App.jsx), que sube de capa (z-45)
    // justo cuando el menú se abre. Así nunca se carga el modelo dos veces.
    <div id='fullscreennav' className='fullscreennav isolate fixed inset-0 z-50 hidden overflow-hidden'>
      <button
        type='button'
        aria-label='Close menu'
        onClick={closeMenu}
        className='absolute right-5 top-5 z-10 font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] uppercase tracking-wide text-black/70 transition-colors hover:text-black lg:right-10 lg:top-10'
      >
        Close
      </button>

      <div className='relative z-10 flex h-dvh flex-col items-center justify-center gap-3 px-6 lg:gap-5'>
        {links.map((item, index) => (
          <div
            key={item.to}
            className='nav-link-item cursor-pointer text-center font-[font3] text-[clamp(2.5rem,7vw,5.5rem)] uppercase leading-none text-black'
            onClick={() => go(item.to, index)}
          >
            <SmokeText primary={item.label} secondary={item.hover} revealed={activeIndex === index} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default FullScreenNav
