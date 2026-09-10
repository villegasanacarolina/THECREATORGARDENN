import { useRef } from 'react'
import gsap from 'gsap'

// Al tocar/pasar el mouse sobre el texto, se ve como si la animación 3D de
// atrás también lo estuviera "tocando" — las letras se vuelven humo por un
// instante. Al dejar de tocar, vuelve rápido a la letra normal.
const TouchSmokeText = ({ text, className = '' }) => {
  const containerRef = useRef(null)

  const handleEnter = () => {
    const chars = containerRef.current?.children
    if (!chars) return
    gsap.to(chars, {
      filter: 'blur(6px)',
      opacity: 0.35,
      y: () => gsap.utils.random(-6, 6),
      duration: 0.35,
      stagger: { each: 0.008, from: 'random' },
      ease: 'power2.out',
    })
  }

  const handleLeave = () => {
    const chars = containerRef.current?.children
    if (!chars) return
    gsap.to(chars, {
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      duration: 0.25,
      stagger: { each: 0.004, from: 'random' },
      ease: 'power2.out',
    })
  }

  return (
    <span
      ref={containerRef}
      className={`inline-block ${className}`}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {text.split('').map((char, i) => (
        <span key={i} className='inline-block' style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}>
          {char}
        </span>
      ))}
    </span>
  )
}

export default TouchSmokeText
