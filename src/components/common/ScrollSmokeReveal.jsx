import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const renderText = (text) => {
  let charIndex = 0

  return text.split(/(\n|[ \t]+)/).map((token, tokenIndex) => {
    if (!token) return null
    if (token === '\n') return <br key={`br-${tokenIndex}`} />
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
                opacity: 0,
                filter: 'blur(16px)',
                transform: 'translateY(14px)',
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

/**
 * Reveals text with the same soft smoke language used in Home/Menu.
 * Each instance animates only once. Text already visible when a section opens
 * waits for the K72 page transition so the user can actually see the reveal;
 * text reached later by scrolling reveals as soon as it enters the viewport.
 */
const ScrollSmokeReveal = ({ text, as = 'span', className = '', delay = 0, immediate = false }) => {
  const containerRef = useRef(null)
  const revealedRef = useRef(false)
  const Tag = as

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const chars = Array.from(element.querySelectorAll('[data-smoke-char]'))
    if (!chars.length) return undefined

    let observer
    let revealTimer
    let rafId
    const mountedAt = performance.now()

    const runReveal = () => {
      if (revealedRef.current) return
      revealedRef.current = true

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(chars, { opacity: 1, filter: 'blur(0px)', y: 0 })
        return
      }

      gsap.fromTo(
        chars,
        { opacity: 0, filter: 'blur(16px)', y: 14 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 0.95,
          delay,
          stagger: { each: 0.012, from: 'random' },
          ease: 'power2.out',
          overwrite: true,
        },
      )
    }

    const revealWhenPageCanBeSeen = () => {
      if (revealedRef.current) return

      // Stairs keeps the new page visually covered/transparent for roughly
      // 1.3 s. IntersectionObserver fires before that, which used to make the
      // first title/paragraph animate invisibly. We wait out only the
      // remaining entrance transition. The stair overlay stays above the page
      // until roughly 2 s, so immediate title/opening-copy reveals start just
      // after it clears instead of animating invisibly behind the transition.
      // Later scroll reveals are immediate.
      const elapsed = performance.now() - mountedAt
      const remainingEntranceMs = Math.max(0, 2050 - elapsed)

      if (remainingEntranceMs > 0) {
        clearTimeout(revealTimer)
        revealTimer = window.setTimeout(runReveal, remainingEntranceMs)
      } else {
        runReveal()
      }
    }

    if (immediate) {
      // Titles and the opening paragraph of each section should reveal as part
      // of the section entrance even if their layout sits just below the fold.
      rafId = requestAnimationFrame(revealWhenPageCanBeSeen)
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            revealWhenPageCanBeSeen()
            observer?.disconnect()
          }
        },
        { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
      )

      // Observe on the next frame so the browser has the final route layout.
      rafId = requestAnimationFrame(() => observer?.observe(element))
    }

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(revealTimer)
      observer?.disconnect()
      gsap.killTweensOf(chars)
      // Important for React StrictMode's development effect replay: if the
      // first effect is cleaned up before the visible animation runs, allow
      // the replayed effect to schedule it again instead of leaving text hidden.
      revealedRef.current = false
    }
  }, [delay, immediate, text])

  return (
    <Tag ref={containerRef} className={className}>
      {renderText(text)}
    </Tag>
  )
}

export default ScrollSmokeReveal
