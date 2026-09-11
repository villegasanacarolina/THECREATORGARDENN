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

  useEffect(() => {
    const chars = charsFor(rootRef.current)
    if (!chars.length) return undefined

    gsap.killTweensOf(chars)

    if (visible) {
      gsap.fromTo(
        chars,
        { opacity: 0, filter: 'blur(22px)', y: 18, x: 0 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          x: 0,
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
        duration: 0.42,
        stagger: { each: 0.006, from: 'random' },
        ease: 'power2.in',
      })
    }

    return () => gsap.killTweensOf(chars)
  }, [visible])

  const deform = (line, hold = true) => {
    if (!visible) return
    const chars = charsFor(line)
    if (!chars.length) return

    gsap.killTweensOf(chars)
    gsap.to(chars, {
      opacity: () => gsap.utils.random(0.28, 0.62),
      filter: () => `blur(${gsap.utils.random(3, 8)}px)`,
      x: () => gsap.utils.random(-5, 5),
      y: () => gsap.utils.random(-7, 7),
      rotate: () => gsap.utils.random(-2.5, 2.5),
      duration: 0.36,
      stagger: { each: 0.008, from: 'random' },
      ease: 'power2.out',
      onComplete: hold ? undefined : () => restore(line),
    })
  }

  const restore = (line) => {
    const chars = charsFor(line)
    if (!chars.length) return
    gsap.killTweensOf(chars)
    gsap.to(chars, {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      rotate: 0,
      duration: 0.42,
      stagger: { each: 0.006, from: 'random' },
      ease: 'power2.out',
    })
  }

  const onPointerEnter = (event) => {
    if (event.pointerType === 'mouse') deform(event.currentTarget, true)
  }

  const onPointerLeave = (event) => {
    if (event.pointerType === 'mouse') restore(event.currentTarget)
  }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse') deform(event.currentTarget, false)
  }

  return (
    <div
      ref={rootRef}
      className={`font-[font1] text-[clamp(1.85rem,4.2vw,4.3rem)] leading-[1.05] transition-[visibility] ${visible ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
      aria-hidden={!visible}
    >
      {LINES.map((line, lineIndex) => (
        <span
          key={line}
          className='mr-[0.22em] inline lg:mr-0 lg:block'
          onPointerEnter={onPointerEnter}
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
      ))}
    </div>
  )
}

export default HomeStatement
