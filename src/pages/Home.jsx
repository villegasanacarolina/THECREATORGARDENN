import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Logo from '../components/common/Logo'
import { trackEvent } from '../lib/trackEvent'

const TAGLINE = 'Innovative digital experiences studio'
const STATEMENT = 'Transcend anything seen or felt before by crafting unparalleled experiences for ambitious brands.'

const splitChars = (text) =>
  text.split('').map((char, i) => (
    <span key={i} className='inline-block' style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
      {char}
    </span>
  ))

const Home = () => {
  const [scrolled, setScrolled] = useState(false)
  const wordmarkRef = useRef(null)
  const taglineRef = useRef(null)
  const statementRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.2)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const wordmarkEl = wordmarkRef.current
    const taglineChars = taglineRef.current ? [...taglineRef.current.children] : []
    const statementChars = statementRef.current ? [...statementRef.current.children] : []
    if (!wordmarkEl || taglineChars.length === 0 || statementChars.length === 0) return

    const tl = gsap.timeline()

    if (scrolled) {
      tl.to([wordmarkEl, ...taglineChars], {
        opacity: 0,
        filter: 'blur(24px)',
        y: -20,
        duration: 0.6,
        stagger: 0.012,
        ease: 'power2.in',
      })
      tl.fromTo(
        statementChars,
        { opacity: 0, filter: 'blur(24px)', y: 20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.1, stagger: 0.012, ease: 'power2.out' },
        '-=0.25',
      )
    } else {
      tl.to(statementChars, {
        opacity: 0,
        filter: 'blur(24px)',
        y: 20,
        duration: 0.5,
        stagger: 0.01,
        ease: 'power2.in',
      })
      tl.fromTo(
        [wordmarkEl, ...taglineChars],
        { opacity: 0, filter: 'blur(24px)', y: -20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.9, stagger: 0.012, ease: 'power2.out' },
        '-=0.2',
      )
    }

    return () => tl.kill()
  }, [scrolled])

  return (
    <div className='relative min-h-[180dvh] text-black'>
      <div className='sticky top-0 z-10 flex h-dvh flex-col justify-between px-6 py-8 lg:px-10 lg:py-10'>
        <div />

        <div className='flex flex-col gap-6 pl-2 lg:flex-row lg:items-center lg:gap-12 lg:pl-6'>
          <div ref={wordmarkRef} className='flex shrink-0 items-center gap-3'>
            <Logo className='h-6 w-6 lg:h-8 lg:w-8' />
            <span className='font-[font3] text-xs uppercase tracking-[0.2em] lg:text-sm'>The Creator Garden</span>
          </div>

          <span ref={taglineRef} className='block max-w-xl font-[font1] text-2xl leading-snug lg:text-3xl'>
            {splitChars(TAGLINE)}
          </span>
        </div>

        {/* Al hacer scroll, este texto aparece como una pieza independiente,
            centrada verticalmente en la zona izquierda y con aire suficiente
            respecto al borde, como en la referencia. */}
        <div className='pointer-events-none absolute left-[7vw] top-1/2 w-[min(46rem,82vw)] -translate-y-1/2 text-left lg:left-[8vw] lg:w-[min(48rem,58vw)]'>
          <span ref={statementRef} className='block font-[font1] text-[clamp(2rem,4.2vw,4.3rem)] leading-[1.05]' style={{ opacity: 0 }}>
            {splitChars(STATEMENT)}
          </span>
        </div>

        <div className='flex items-end justify-between'>
          <Link
            to='/work'
            onClick={() => trackEvent('click', 'home_cta', { to: '/work' })}
            className='font-[font1] text-sm uppercase text-black transition-colors hover:text-[#D9A99B]'
          >
            See all projects →
          </Link>
          <span className={`font-[font1] text-sm text-black/50 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
            Scroll down
          </span>
        </div>
      </div>
    </div>
  )
}

export default Home
