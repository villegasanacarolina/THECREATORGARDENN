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
  { label: 'Our work', hover: 'Shaping the future with visionary clients', to: '/work' },
  { label: 'Our approach', hover: 'Our singular approach to craftsmanship', to: '/approach' },
  { label: 'Services', hover: 'Services driven by purpose and vision', to: '/services' },
  { label: 'Contact us', hover: 'To talk about your brand', to: '/contact' },
]

const NAVIGATE_DELAY_MS = 720

const FullScreenNav = () => {
  const [navOpen, setNavOpen] = useContext(NavbarContext)
  const [muted, toggleSound] = useSound()
  const [activeIndex, setActiveIndex] = useState(null)
  const [leavingIndex, setLeavingIndex] = useState(null)
  const navigate = useNavigate()
  const navigateTimeoutRef = useRef(null)

  const isTouchNavigation = () =>
    typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

  const go = (path, index) => {
    if (leavingIndex !== null) return
    setActiveIndex(index)
    setLeavingIndex(index)
    trackEvent('click', 'nav_link', { to: path })

    clearTimeout(navigateTimeoutRef.current)
    navigateTimeoutRef.current = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      navigate(path)
      setNavOpen(false)
      setActiveIndex(null)
      setLeavingIndex(null)
    }, NAVIGATE_DELAY_MS)
  }

  const selectLink = (item, index) => {
    if (isTouchNavigation() && activeIndex !== index) {
      setLeavingIndex(null)
      setActiveIndex(index)
      return
    }
    go(item.to, index)
  }

  const closeMenu = () => {
    clearTimeout(navigateTimeoutRef.current)
    setActiveIndex(null)
    setLeavingIndex(null)

    // Close must always return to the original Home state without replaying
    // the loading screen. Route state is the reliable signal for a newly
    // mounted Home; the custom event covers Home when it is already mounted.
    setNavOpen(false)

    if (window.location.pathname === '/') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      window.dispatchEvent(new Event('tcg:reset-home'))
      return
    }

    navigate('/', {
      state: { forceHomeIntro: true, closeNonce: Date.now() },
    })
  }

  const gsapAnimation = () => {
    const tl = gsap.timeline()
    tl.set('.nav-link-item', { opacity: 0, y: 20 })
    tl.set('.fullscreennav', { display: 'block' })
    tl.to('.nav-link-item', { opacity: 1, y: 0, stagger: 0.07, duration: 0.55, ease: 'power2.out' })
  }

  const gsapAnimationReverse = () => {
    clearTimeout(navigateTimeoutRef.current)
    setActiveIndex(null)
    setLeavingIndex(null)
    const tl = gsap.timeline()
    tl.to('.nav-link-item', { opacity: 0, y: -20, stagger: 0.035, duration: 0.26, ease: 'power2.in' })
    tl.set('.fullscreennav', { display: 'none' })
  }

  useGSAP(() => {
    if (navOpen) gsapAnimation()
    else gsapAnimationReverse()
  }, [navOpen])

  return (
    <div id='fullscreennav' className='fullscreennav isolate fixed inset-0 z-50 hidden overflow-hidden bg-transparent'>
      <div className='absolute right-5 top-5 z-10 flex items-center gap-2 lg:right-10 lg:top-10 lg:gap-3'>
        <button
          type='button'
          aria-label={muted ? 'Activar sonido' : 'Desactivar sonido'}
          data-sound-toggle
          onClick={toggleSound}
          className='inline-flex h-[1.1rem] items-center justify-center text-black/70 transition-colors hover:text-black'
        >
          <SoundIcon muted={muted} />
        </button>
        <button
          type='button'
          aria-label='Close menu'
          onClick={closeMenu}
          className='inline-flex h-[1.1rem] items-center font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] leading-none tracking-wide text-black/70 transition-colors hover:text-black'
        >
          Close
        </button>
      </div>

      <div className='relative z-10 flex h-dvh flex-col items-center justify-center gap-1 px-4 lg:gap-2 lg:px-6'>
        {links.map((item, index) => (
          <div
            key={item.to}
            className='nav-link-item flex min-h-[5.4rem] w-full cursor-pointer items-center justify-center text-center font-[font3] text-[clamp(2.35rem,7vw,5.5rem)] leading-none text-black lg:min-h-[7rem]'
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse' && leavingIndex === null) {
                setActiveIndex(index)
                trackEvent('hover', 'nav_preview', { to: item.to })
              }
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse' && leavingIndex === null) setActiveIndex(null)
            }}
            onClick={() => selectLink(item, index)}
          >
            <SmokeText
              primary={item.label}
              secondary={item.hover}
              revealed={activeIndex === index}
              departing={leavingIndex === index}
              secondaryClassName='font-[font1] text-[clamp(1.3rem,3.15vw,3.25rem)] normal-case leading-[1.08] tracking-normal'
            />
          </div>
        ))}
      </div>

      <div
        className='nav-link-item absolute bottom-5 left-5 z-10 cursor-pointer font-[font1] text-sm text-black transition-colors hover:text-black/60 lg:bottom-10 lg:left-10'
        onClick={() => go('/work', 'work-footer')}
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
