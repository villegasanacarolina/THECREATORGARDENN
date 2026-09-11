import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarContext } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import { trackEvent } from '../../lib/trackEvent'
import SmokeText from './SmokeText'
import SoundIcon from '../common/SoundIcon'

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
  const [muted, toggleSound] = useSound()
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
    // bg-[#e5e5e5] es un RESPALDO: si por lo que sea la animación 3D (que
    // vive detrás, ver App.jsx) tardara en cargar o fallara, este fondo
    // sólido evita que la página de atrás se alcance a ver a través del
    // menú — nunca debe haber traslape con el contenido de otra página.
    <div id='fullscreennav' className='fullscreennav isolate fixed inset-0 z-50 hidden overflow-hidden bg-[#e5e5e5]'>
      <div className='absolute right-5 top-5 z-10 flex items-center gap-2 lg:right-10 lg:top-10 lg:gap-3'>
        <button
          type='button'
          aria-label={muted ? 'Activar sonido' : 'Desactivar sonido'}
          data-sound-toggle
          onClick={toggleSound}
          className='text-black/70 transition-colors hover:text-black'
        >
          <SoundIcon muted={muted} />
        </button>
        <button
          type='button'
          aria-label='Close menu'
          onClick={closeMenu}
          className='font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] uppercase tracking-wide text-black/70 transition-colors hover:text-black'
        >
          Close
        </button>
      </div>

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

      <div
        className='nav-link-item absolute bottom-5 left-5 z-10 cursor-pointer font-[font1] text-sm uppercase text-black transition-colors hover:text-black/60 lg:bottom-10 lg:left-10'
        onClick={() => { trackEvent('click', 'nav_link', { to: '/work' }); go('/work', 'work-footer') }}
        onKeyDown={(e) => e.key === 'Enter' && go('/work', 'work-footer')}
        role='button'
        tabIndex={0}
      >
        See all projects →
      </div>
    </div>
  )
}

export default FullScreenNav
