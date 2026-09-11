import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Logo from '../components/common/Logo'
import { trackEvent } from '../lib/trackEvent'

const TAGLINE = 'UGC agency for ambitious brands.'
const STATEMENT = "We blend strategy, storytelling, and creator content into campaigns that don't just get seen — they get remembered."

const splitChars = (text) =>
  text.split('').map((char, i) => (
    <span key={i} className='inline-block' style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
      {char}
    </span>
  ))

const Home = () => {
  const [scrolled, setScrolled] = useState(false)
  const taglineRef = useRef(null)
  const statementRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.35)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const taglineChars = taglineRef.current?.children
    const statementChars = statementRef.current?.children
    if (!taglineChars || !statementChars) return

    const tl = gsap.timeline()
    if (scrolled) {
      tl.to(taglineChars, { opacity: 0, filter: 'blur(22px)', y: -18, duration: 0.6, stagger: { each: 0.014, from: 'random' }, ease: 'power2.in' })
      tl.fromTo(statementChars, { opacity: 0, filter: 'blur(22px)', y: 18 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: { each: 0.012, from: 'random' }, ease: 'power2.out' }, '-=0.25')
    } else {
      tl.to(statementChars, { opacity: 0, filter: 'blur(22px)', y: 18, duration: 0.5, stagger: { each: 0.01, from: 'random' }, ease: 'power2.in' })
      tl.fromTo(taglineChars, { opacity: 0, filter: 'blur(22px)', y: -18 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, stagger: { each: 0.014, from: 'random' }, ease: 'power2.out' }, '-=0.2')
    }
  }, [scrolled])

  return (
    <div className='relative min-h-[180dvh] text-black'>
      <div className='sticky top-0 z-10 flex h-dvh flex-col justify-between px-6 py-8 lg:px-10 lg:py-10'>
        {/* fila de arriba: queda vacía en Home — el logo/About ya vive en Navbar */}
        <div />

        {/* centro: wordmark + texto que cambia con el scroll */}
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12'>
          <div className='flex shrink-0 items-center gap-3'>
            <Logo className='h-6 w-6 lg:h-8 lg:w-8' />
            <span className='font-[font3] text-xs uppercase tracking-[0.2em] lg:text-sm'>The Creator Garden</span>
          </div>

          <div className='relative max-w-xl'>
            <span ref={taglineRef} className='block font-[font1] text-2xl leading-snug lg:text-3xl'>
              {splitChars(TAGLINE)}
            </span>
            <span ref={statementRef} className='pointer-events-none absolute inset-0 block font-[font1] text-2xl leading-snug opacity-0 lg:text-3xl'>
              {splitChars(STATEMENT)}
            </span>
          </div>
        </div>

        {/* pie: ver proyectos + aviso de scroll */}
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
