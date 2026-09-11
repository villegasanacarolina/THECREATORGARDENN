import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import Logo from '../components/common/Logo'
import HomeStatement from '../components/garden/HomeStatement'
import { trackEvent } from '../lib/trackEvent'

const TAGLINE = 'Innovative digital experiences studio'

const splitChars = (text) => {
  let charIndex = 0

  return text.split(/([ \t]+)/).map((token, tokenIndex) => {
    if (!token) return null
    if (/^[ \t]+$/.test(token)) return <span key={`space-${tokenIndex}`}> </span>

    return (
      <span key={`word-${tokenIndex}`} className='inline-block whitespace-nowrap'>
        {token.split('').map((char) => (
          <span key={charIndex++} data-tagline-char className='inline-block'>
            {char}
          </span>
        ))}
      </span>
    )
  })
}

const Home = () => {
  const [scrolled, setScrolled] = useState(false)
  const wordmarkRef = useRef(null)
  const taglineRef = useRef(null)

  useEffect(() => {
    // Close from the full-screen menu may navigate here from another route.
    // Consume the one-shot flag only after Home exists, then force the original
    // wordmark/tagline state without replaying the 3D loading screen.
    try {
      if (sessionStorage.getItem('tcg:force-home-intro') === '1') {
        sessionStorage.removeItem('tcg:force-home-intro')
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        setScrolled(false)
      }
    } catch {}

    const syncFromScroll = () => {
      const threshold = Math.max(60, window.innerHeight * 0.12)
      setScrolled(window.scrollY > threshold)
    }

    const resetHome = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      setScrolled(false)
    }

    syncFromScroll()
    window.addEventListener('scroll', syncFromScroll, { passive: true })
    window.addEventListener('tcg:reset-home', resetHome)

    return () => {
      window.removeEventListener('scroll', syncFromScroll)
      window.removeEventListener('tcg:reset-home', resetHome)
    }
  }, [])

  useEffect(() => {
    const wordmarkEl = wordmarkRef.current
    const taglineChars = taglineRef.current ? [...taglineRef.current.querySelectorAll('[data-tagline-char]')] : []
    if (!wordmarkEl || taglineChars.length === 0) return undefined

    gsap.killTweensOf([wordmarkEl, ...taglineChars])
    const tl = gsap.timeline()

    if (scrolled) {
      tl.to([wordmarkEl, ...taglineChars], {
        opacity: 0,
        filter: 'blur(24px)',
        y: -20,
        duration: 0.58,
        stagger: 0.01,
        ease: 'power2.in',
      })
    } else {
      tl.fromTo(
        [wordmarkEl, ...taglineChars],
        { opacity: 0, filter: 'blur(24px)', y: -20 },
        { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.86, stagger: 0.01, ease: 'power2.out' },
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
            <Logo tone='black' className='h-6 w-6 lg:h-8 lg:w-8' />
            <span className='font-[font3] text-xs uppercase tracking-[0.2em] lg:text-sm'>The Creator Garden</span>
          </div>

          <span ref={taglineRef} className='block max-w-xl font-[font1] text-2xl leading-snug lg:text-3xl'>
            {splitChars(TAGLINE)}
          </span>
        </div>

        <div className='absolute left-[7vw] top-1/2 w-[86vw] -translate-y-1/2 text-left lg:left-[8vw] lg:w-[min(58vw,55rem)]'>
          <HomeStatement visible={scrolled} />
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
