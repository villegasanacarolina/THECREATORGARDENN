import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Muestra "primary"; cuando revealed pasa a true, "primary" se disuelve
// como humo (blur + sube + se desvanece, letra por letra) mientras
// "secondary" aparece con el mismo efecto en reversa. Todo en negro plano,
// sin imagen — solo tipografía.
const splitChars = (text) =>
  text.split('').map((char, i) => (
    <span key={i} className='inline-block' style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
      {char}
    </span>
  ))

const SmokeText = ({ primary, secondary, revealed }) => {
  const primaryRef = useRef(null)
  const secondaryRef = useRef(null)

  useEffect(() => {
    const primaryChars = primaryRef.current?.children
    const secondaryChars = secondaryRef.current?.children
    if (!primaryChars || !secondaryChars) return

    const tl = gsap.timeline()

    if (revealed) {
      tl.to(primaryChars, {
        opacity: 0,
        filter: 'blur(14px)',
        y: -14,
        duration: 0.6,
        stagger: { each: 0.012, from: 'random' },
        ease: 'power2.in',
      })
      tl.fromTo(
        secondaryChars,
        { opacity: 0, filter: 'blur(14px)', y: 14 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.9,
          stagger: { each: 0.014, from: 'random' },
          ease: 'power2.out',
        },
        '-=0.25',
      )
    } else {
      tl.to(secondaryChars, {
        opacity: 0,
        filter: 'blur(14px)',
        y: 14,
        duration: 0.4,
        stagger: { each: 0.01, from: 'random' },
        ease: 'power2.in',
      })
      tl.fromTo(
        primaryChars,
        { opacity: 0, filter: 'blur(14px)', y: -14 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.7,
          stagger: { each: 0.012, from: 'random' },
          ease: 'power2.out',
        },
        '-=0.15',
      )
    }
  }, [revealed])

  return (
    <span className='relative inline-block'>
      <span ref={primaryRef} className='block'>
        {splitChars(primary)}
      </span>
      <span ref={secondaryRef} className='pointer-events-none absolute inset-0 block opacity-0'>
        {splitChars(secondary)}
      </span>
    </span>
  )
}

export default SmokeText
