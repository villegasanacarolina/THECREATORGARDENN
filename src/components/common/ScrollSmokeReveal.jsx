import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const renderText = (text) =>
  text.split('').map((char, index) => {
    if (char === '\n') return <br key={`br-${index}`} />
    return (
      <span
        key={index}
        data-smoke-char
        className='inline-block'
        style={{
          opacity: 0,
          filter: 'blur(16px)',
          transform: 'translateY(14px)',
          whiteSpace: char === ' ' ? 'pre' : 'normal',
        }}
      >
        {char}
      </span>
    )
  })

/**
 * Reveals text with the same soft smoke language used in Home/Menu.
 * Each instance animates only once, the first time it enters the viewport.
 */
const ScrollSmokeReveal = ({ text, as = 'span', className = '', delay = 0 }) => {
  const containerRef = useRef(null)
  const revealedRef = useRef(false)
  const Tag = as

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const chars = Array.from(element.querySelectorAll('[data-smoke-char]'))
    if (!chars.length) return undefined

    const reveal = () => {
      if (revealedRef.current) return
      revealedRef.current = true

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(chars, { opacity: 1, filter: 'blur(0px)', y: 0 })
        return
      }

      gsap.to(chars, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.95,
        delay,
        stagger: { each: 0.012, from: 'random' },
        ease: 'power2.out',
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal()
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag ref={containerRef} className={className}>
      {renderText(text)}
    </Tag>
  )
}

export default ScrollSmokeReveal
