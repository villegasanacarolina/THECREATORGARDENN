import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarContext } from '../../context/NavContext'
import Logo from '../common/Logo'
import { trackEvent } from '../../lib/trackEvent'

const links = [
  { label: 'Work', hover: 'See everything', to: '/work' },
  { label: 'Our Approach', hover: 'How we work', to: '/approach' },
  { label: 'Services', hover: 'What we do', to: '/services' },
  { label: 'Contact', hover: 'Write us', to: '/contact' },
]

const FullScreenNav = () => {
  const fullNavLinksRef = useRef(null)
  const fullScreenRef = useRef(null)
  const isNavigatingRef = useRef(false)
  const [navOpen, setNavOpen] = useContext(NavbarContext)
  const navigate = useNavigate()
  const thumbA = '/jewelry.jpg'

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = navOpen ? 'hidden' : previousOverflow

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [navOpen])

  function go(path) {
    trackEvent('click', 'nav_link', { to: path })
    isNavigatingRef.current = true
    window.scrollTo(0, 0)
    navigate(path)
    setNavOpen(false)
  }

  function gsapAnimation() {
    const tl = gsap.timeline()

    // Estado inicial forzado (defensa extra, sin importar cómo haya quedado
    // de una apertura/cierre anterior): links y logo/botón ocultos, listos
    // para animar. El fondo negro (bg-black en #fullscreennav) ya cubre todo
    // desde el primer frame, así que nunca hay un instante "a medias".
    tl.set('.link', { opacity: 0, rotateX: 90 })
    tl.set('.navlink', { opacity: 0 })
    tl.to('.fullscreennav', { display: 'block' })
    tl.to('.stairing', {
      delay: 0.2,
      height: '100%',
      stagger: { amount: -0.3 },
    })
    tl.to('.link', {
      opacity: 1,
      rotateX: 0,
      stagger: { amount: 0.3 },
    })
    tl.to('.navlink', { opacity: 1 })
  }

  function gsapAnimationReverse() {
    if (isNavigatingRef.current) {
      // Viniste de darle clic a un link (no a la X): cerramos YA, sin
      // animación, para que se note la transición escalonada de Stairs
      // en la sección nueva en vez de quedar tapada detrás del cierre
      // lento del menú.
      isNavigatingRef.current = false
      const tl = gsap.timeline()
      tl.set('.link', { opacity: 0, rotateX: 90 })
      tl.set('.navlink', { opacity: 0 })
      tl.set('.stairing', { height: 0 })
      tl.set('.fullscreennav', { display: 'none' })
      return
    }

    // Cerraste con la X (sin navegar): animación completa, como siempre.
    const tl = gsap.timeline()
    tl.to('.link', {
      opacity: 0,
      rotateX: 90,
      stagger: { amount: 0.1 },
    })
    tl.to('.stairing', {
      height: 0,
      stagger: { amount: 0.1 },
    })
    tl.to('.navlink', { opacity: 0 })
    tl.to('.fullscreennav', { display: 'none' })
  }

  useGSAP(function () {
    if (navOpen) gsapAnimation()
    else gsapAnimationReverse()
  }, [navOpen])

  return (
    <div ref={fullScreenRef} id='fullscreennav' className='fullscreennav isolate fixed inset-0 z-50 hidden overflow-hidden bg-black text-white'>
      <div className='fixed inset-0'>
        <div className='h-full w-full flex'>
          <div className='stairing h-full w-1/5 bg-black'></div>
          <div className='stairing h-full w-1/5 bg-black'></div>
          <div className='stairing h-full w-1/5 bg-black'></div>
          <div className='stairing h-full w-1/5 bg-black'></div>
          <div className='stairing h-full w-1/5 bg-black'></div>
        </div>
      </div>
      <div ref={fullNavLinksRef} className='relative flex h-dvh flex-col overflow-hidden'>
        <div className="navlink relative flex w-full justify-center p-5">
          <div className='w-[clamp(12rem,22vw,18rem)] cursor-pointer' onClick={() => go('/')}>
            <Logo fill='white' className='w-full h-auto' />
          </div>
          <button
            type='button'
            aria-label='Close menu'
            onClick={() => setNavOpen(false)}
            className='group absolute right-5 top-5 h-[clamp(9rem,14vw,14rem)] w-[clamp(9rem,14vw,14rem)] cursor-pointer'
          >
            <div className='absolute left-1/2 top-0 h-[clamp(12rem,16vw,18rem)] w-0.5 -rotate-45 origin-top bg-white transition-colors group-hover:bg-[#D3FD50] group-active:bg-[#D3FD50] lg:w-1'></div>
            <div className='absolute right-0 top-0 h-[clamp(12rem,16vw,18rem)] w-0.5 rotate-45 origin-top bg-white transition-colors group-hover:bg-[#D3FD50] group-active:bg-[#D3FD50] lg:w-1'></div>
          </button>
        </div>

        <div className='flex flex-1 flex-col items-center justify-center'>
          {links.map((item) => (
            <div
              key={item.to}
              className='link relative w-full origin-top cursor-pointer border-y border-white/30 text-center'
              onClick={() => go(item.to)}
            >
              <h1 className='font-[font2] text-[clamp(3.25rem,8vw,7rem)] text-center leading-[0.8] pt-3 uppercase'>
                {item.label}
              </h1>
              <div className='moveLink absolute inset-0 flex h-full w-full items-center overflow-hidden bg-[#D3FD50] text-black'>
                <div className='moveX flex h-full shrink-0 items-center'>
                  <h2 className='whitespace-nowrap font-[font2] text-[clamp(3.25rem,8vw,7rem)] uppercase'>{item.hover}</h2>
                  <img className='h-[clamp(6rem,9vw,15rem)] w-[clamp(13rem,20vw,40rem)] shrink-0 rounded-full object-cover' src={thumbA} alt='' />
                  <h2 className='whitespace-nowrap font-[font2] text-[clamp(3.25rem,8vw,7rem)] uppercase'>{item.hover}&nbsp;</h2>
                  <img className='h-[clamp(6rem,9vw,15rem)] w-[clamp(13rem,20vw,40rem)] shrink-0 rounded-full object-cover' src={thumbA} alt='' />
                </div>
                <div className='moveX flex h-full shrink-0 items-center' aria-hidden='true'>
                  <h2 className='whitespace-nowrap font-[font2] text-[clamp(3.25rem,8vw,7rem)] uppercase'>{item.hover}</h2>
                  <img className='h-[clamp(6rem,9vw,15rem)] w-[clamp(13rem,20vw,40rem)] shrink-0 rounded-full object-cover' src={thumbA} alt='' />
                  <h2 className='whitespace-nowrap font-[font2] text-[clamp(3.25rem,8vw,7rem)] uppercase'>{item.hover}&nbsp;</h2>
                  <img className='h-[clamp(6rem,9vw,15rem)] w-[clamp(13rem,20vw,40rem)] shrink-0 rounded-full object-cover' src={thumbA} alt='' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FullScreenNav
