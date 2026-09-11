import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const LINES = [
  'Transcend anything seen or',
  'felt before by crafting',
  'unparalleled experiences for',
  'ambitious brands.',
]

const charsFor = (element) => Array.from(element?.querySelectorAll('[data-statement-char]') || [])

const HomeStatement = ({ visible }) => {
  const rootRef = useRef(null)
  const restoreTimeoutRef = useRef(null)

  useEffect(() => {
    const chars = charsFor(rootRef.current)
    if (!chars.length) return undefined

    gsap.killTweensOf(chars)

    if (visible) {
      gsap.fromTo(
        chars,
        { opacity: 0, filter: 'blur(22px)', y: 18, x: 0, rotate: 0 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          x: 0,
          rotate: 0,
          duration: 1.05,
          stagger: { each: 0.012, from: 'random' },
          ease: 'power2.out',
        },
      )
    } else {
      gsap.to(chars, {
        opacity: 0,
        filter: 'blur(18px)',
        y: 14,
        x: 0,
        rotate: 0,
        duration: 0.42,
        stagger: { each: 0.006, from: 'random' },
        ease: 'power2.in',
      })
    }

    return () => {
      clearTimeout(restoreTimeoutRef.current)
      gsap.killTweensOf(chars)
    }
  }, [visible])

  const restore = (line, duration = 0.28) => {
    const chars = charsFor(line)
    if (!chars.length) return

    gsap.killTweensOf(chars)
    gsap.to(chars, {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      rotate: 0,
      duration,
      stagger: { each: 0.003, from: 'random' },
      ease: 'power2.out',
      overwrite: true,
    })
  }

  const deformAtPoint = (line, clientX, clientY, temporary = false) => {
    if (!visible) return
    const chars = charsFor(line)
    if (!chars.length) return

    // El efecto se concentra únicamente alrededor del punto que realmente
    // está encima del texto. Ya no se deforma una línea completa al acercar
    // el cursor a su caja de layout.
    const fontSize = Number.parseFloat(window.getComputedStyle(line).fontSize) || 36
    const radius = Math.max(28, Math.min(46, fontSize * 0.62))
    let nearestDistance = Number.POSITIVE_INFINITY

    const measurements = chars.map((char) => {
      const rect = char.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.hypot(clientX - centerX, clientY - centerY)
      nearestDistance = Math.min(nearestDistance, distance)
      return { char, distance }
    })

    // Si el puntero está dentro del wrapper pero no realmente sobre una
    // letra (por ejemplo, en un hueco de la línea), no activamos el humo.
    if (nearestDistance > radius * 0.72) {
      restore(line, 0.2)
      return
    }

    measurements.forEach(({ char, distance }) => {
      if (distance > radius) {
        gsap.to(char, {
          opacity: 1,
          filter: 'blur(0px)',
          x: 0,
          y: 0,
          rotate: 0,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: true,
        })
        return
      }

      const strength = 1 - distance / radius
      gsap.to(char, {
        opacity: 1 - strength * 0.55,
        filter: `blur(${2 + strength * 5}px)`,
        x: gsap.utils.random(-2.2, 2.2) * strength,
        y: gsap.utils.random(-4.5, 4.5) * strength,
        rotate: gsap.utils.random(-1.6, 1.6) * strength,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: true,
      })
    })

    if (temporary) {
      clearTimeout(restoreTimeoutRef.current)
      restoreTimeoutRef.current = setTimeout(() => restore(line, 0.32), 420)
    }
  }

  const onPointerMove = (event) => {
    if (event.pointerType === 'mouse') {
      deformAtPoint(event.currentTarget, event.clientX, event.clientY)
    }
  }

  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') restore(event.currentTarget)
  }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse') {
      deformAtPoint(event.currentTarget, event.clientX, event.clientY, true)
    }
  }

  return (
    <div
      ref={rootRef}
      className={`font-[font1] text-[clamp(1.85rem,4.2vw,4.3rem)] leading-[1.05] transition-[visibility] ${visible ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
      aria-hidden={!visible}
    >
      {LINES.map((line, lineIndex) => (
        <span key={line} className='mr-[0.22em] inline lg:mr-0 lg:block'>
          <span
            className='inline lg:inline-block'
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            onPointerDown={onPointerDown}
          >
            {line.split('').map((char, charIndex) => (
              <span
                key={`${lineIndex}-${charIndex}`}
                data-statement-char
                className='inline-block'
                style={{
                  opacity: 0,
                  filter: 'blur(18px)',
                  whiteSpace: char === ' ' ? 'pre' : 'normal',
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}

export default HomeStatement
