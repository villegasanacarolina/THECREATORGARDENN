import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const splitChars = (text, hidden = false) => {
  let charIndex = 0

  return text.split(/([ \t]+)/).map((token, tokenIndex) => {
    if (!token) return null
    if (/^[ \t]+$/.test(token)) return <span key={`space-${tokenIndex}`}> </span>

    return (
      <span key={`word-${tokenIndex}`} className='inline-block whitespace-nowrap'>
        {token.split('').map((char) => {
          const index = charIndex++
          return (
            <span
              key={index}
              data-smoke-char
              className='inline-block'
              style={{
                opacity: hidden ? 0 : 1,
                filter: hidden ? 'blur(14px)' : 'blur(0px)',
              }}
            >
              {char}
            </span>
          )
        })}
      </span>
    )
  })
}

const SmokeText = ({ primary, secondary, revealed, departing = false, secondaryClassName = '' }) => {
  const primaryRef = useRef(null)
  const secondaryRef = useRef(null)

  useEffect(() => {
    const primaryChars = Array.from(primaryRef.current?.querySelectorAll('[data-smoke-char]') || [])
    const secondaryChars = Array.from(secondaryRef.current?.querySelectorAll('[data-smoke-char]') || [])
    if (!primaryChars.length || !secondaryChars.length) return undefined

    gsap.killTweensOf([...primaryChars, ...secondaryChars])
    const tl = gsap.timeline()

    if (departing) {
      tl.to([...primaryChars, ...secondaryChars], {
        opacity: 0,
        filter: 'blur(18px)',
        x: () => gsap.utils.random(-7, 7),
        y: () => gsap.utils.random(-12, 12),
        duration: 0.62,
        stagger: { each: 0.008, from: 'random' },
        ease: 'power2.in',
      })
      return () => tl.kill()
    }

    if (revealed) {
      tl.to(primaryChars, {
        opacity: 0,
        filter: 'blur(14px)',
        y: -14,
        duration: 0.48,
        stagger: { each: 0.009, from: 'random' },
        ease: 'power2.in',
      })
      tl.fromTo(
        secondaryChars,
        { opacity: 0, filter: 'blur(16px)', y: 14, x: 0 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          x: 0,
          duration: 0.82,
          stagger: { each: 0.011, from: 'random' },
          ease: 'power2.out',
        },
        '-=0.22',
      )
    } else {
      tl.to(secondaryChars, {
        opacity: 0,
        filter: 'blur(14px)',
        y: 14,
        duration: 0.3,
        stagger: { each: 0.006, from: 'random' },
        ease: 'power2.in',
      })
      tl.fromTo(
        primaryChars,
        { opacity: 0, filter: 'blur(14px)', y: -12, x: 0 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          x: 0,
          duration: 0.62,
          stagger: { each: 0.009, from: 'random' },
          ease: 'power2.out',
        },
        '-=0.12',
      )
    }

    return () => tl.kill()
  }, [departing, revealed])

  return (
    <span className='relative mx-auto block min-h-[1.05em] w-full max-w-[94vw]'>
      <span ref={primaryRef} className='block'>
        {splitChars(primary)}
      </span>
      <span
        ref={secondaryRef}
        className={`pointer-events-none absolute left-1/2 top-1/2 block w-[92vw] -translate-x-1/2 -translate-y-1/2 whitespace-normal ${secondaryClassName}`}
        aria-hidden='true'
      >
        {splitChars(secondary, true)}
      </span>
    </span>
  )
}

export default SmokeText
