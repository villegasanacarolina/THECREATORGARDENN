import { useEffect, useState } from 'react'
import { CONTACT_EMAIL } from '../data/site'

const contactScenes = [
  { subject: 'project' },
  { subject: 'brand' },
  { subject: 'next idea' },
]

const TICKER_ROTATION_DEG = 8
const TICKER_OFFSET_X = '-48%'

const ContactTicker = ({ scrollDirection, topClass }) => {
  const [inverted, setInverted] = useState(false)
  const tickerText = `${CONTACT_EMAIL}  ♥  `
  const rotation = scrollDirection === 'up' ? -TICKER_ROTATION_DEG : TICKER_ROTATION_DEG

  return (
    <button
      type='button'
      aria-label='Email The Creator Garden'
      onClick={() => setInverted((current) => !current)}
      onMouseEnter={() => setInverted(true)}
      onMouseLeave={() => setInverted(false)}
      className={`contact-ticker absolute ${topClass} left-1/2 z-30 w-[120vw] overflow-hidden py-3 text-left font-[font2] text-[9vw] uppercase leading-none transition-[background-color,transform] duration-700 lg:text-[6vw] ${inverted ? 'bg-white text-black' : 'bg-[#D3FD50] text-black'}`}
      style={{
        transform: `translate(${TICKER_OFFSET_X}, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <span className='contact-ticker-track inline-flex whitespace-nowrap'>
        {Array.from({ length: 10 }, (_, index) => <span key={index}>{tickerText}</span>)}
      </span>
    </button>
  )
}

/* ============================================================================
   VERSIÓN MOBILE — toca SOLO estos 4 valores para ajustar mobile.
   ============================================================================ */
const MOBILE_SECTION_HEIGHT = 'min-h-[45vh]'
const MOBILE_HEADING_PADDING = 'pb-[8vh]'
const MOBILE_TICKER_TOP = 'top-[82%]'
const MOBILE_SMALL_TEXT_BOTTOM = 'bottom-[58%]'
// 4) TAMAÑO DEL TEXTO PEQUEÑO + LA DIRECCIÓN
const MOBILE_SMALL_TEXT_SIZE = 'text-[8.4px]'

const ContactMobile = ({ scrollDirection }) => (
  <div className='block lg:hidden'>
    {contactScenes.map((scene) => (
      <section
        key={scene.subject}
        className={`relative z-0 isolate flex ${MOBILE_SECTION_HEIGHT} flex-col justify-center overflow-hidden px-6 py-16`}
      >
        <h1 className={`mx-auto max-w-[12ch] ${MOBILE_HEADING_PADDING} text-center font-[font2] text-[14vw] uppercase leading-[0.82]`}>
          To talk<br />about<br />your<br />{scene.subject}
        </h1>
        <p className={`absolute ${MOBILE_SMALL_TEXT_BOTTOM} left-4 max-w-[12rem] text-center font-[font1] ${MOBILE_SMALL_TEXT_SIZE} leading-tight`}>
          Onscreen or in an office.<br />Here. There.<br />Anywhere.
        </p>
        <a
          href='https://maps.google.com/?q=ITESM+Campus+Gdl+Zapopan+Jalisco'
          target='_blank'
          rel='noreferrer'
          className={`absolute ${MOBILE_SMALL_TEXT_BOTTOM} right-4 max-w-[15rem] text-right font-[font1] ${MOBILE_SMALL_TEXT_SIZE} leading-tight hover:text-[#D3FD50]`}
        >
          ITESM Campus Gdl<br />Zapopan, Jalisco →
        </a>
        <ContactTicker scrollDirection={scrollDirection} topClass={MOBILE_TICKER_TOP} />
      </section>
    ))}
  </div>
)

/* ============================================================================
   VERSIÓN DESKTOP — toca SOLO estos 4 valores para ajustar desktop.
   ============================================================================ */
const DESKTOP_SECTION_HEIGHT = 'min-h-[115vh]'
const DESKTOP_HEADING_PADDING = 'pb-[36vh]'
const DESKTOP_TICKER_TOP = 'top-[80%]'
const DESKTOP_SMALL_TEXT_BOTTOM = 'bottom-[54%]'
// 4) TAMAÑO DEL TEXTO PEQUEÑO + LA DIRECCIÓN
const DESKTOP_SMALL_TEXT_SIZE = 'text-lg'

const ContactDesktop = ({ scrollDirection }) => (
  <div className='hidden lg:block'>
    {contactScenes.map((scene) => (
      <section
        key={scene.subject}
        className={`relative z-0 isolate flex ${DESKTOP_SECTION_HEIGHT} flex-col justify-center overflow-hidden px-16 py-24`}
      >
        <h1 className={`mx-auto max-w-[12ch] ${DESKTOP_HEADING_PADDING} text-center font-[font2] text-[9vw] uppercase leading-[0.82]`}>
          To talk<br />about<br />your<br />{scene.subject}
        </h1>
        <p className={`absolute ${DESKTOP_SMALL_TEXT_BOTTOM} left-16 max-w-[12rem] text-center font-[font1] ${DESKTOP_SMALL_TEXT_SIZE} leading-tight`}>
          Onscreen or in an office.<br />Here. There.<br />Anywhere.
        </p>
        <a
          href='https://maps.google.com/?q=ITESM+Campus+Gdl+Zapopan+Jalisco'
          target='_blank'
          rel='noreferrer'
          className={`absolute ${DESKTOP_SMALL_TEXT_BOTTOM} right-16 max-w-[15rem] text-right font-[font1] ${DESKTOP_SMALL_TEXT_SIZE} leading-tight hover:text-[#D3FD50]`}
        >
          ITESM Campus Gdl<br />Zapopan, Jalisco →
        </a>
        <ContactTicker scrollDirection={scrollDirection} topClass={DESKTOP_TICKER_TOP} />
      </section>
    ))}
  </div>
)

const Contact = () => {
  const [scrollDirection, setScrollDirection] = useState('down')

  useEffect(() => {
    let previousScroll = window.scrollY

    const detectDirection = () => {
      const currentScroll = window.scrollY
      if (Math.abs(currentScroll - previousScroll) > 2) {
        setScrollDirection(currentScroll < previousScroll ? 'up' : 'down')
        previousScroll = currentScroll
      }
    }

    window.addEventListener('scroll', detectDirection, { passive: true })
    return () => window.removeEventListener('scroll', detectDirection)
  }, [])

  return (
    <main className='bg-black text-white'>
      <ContactMobile scrollDirection={scrollDirection} />
      <ContactDesktop scrollDirection={scrollDirection} />
      <footer className='flex flex-wrap items-center justify-between gap-8 border-t border-white/30 px-4 py-8 lg:px-8'>
        <a href={`mailto:${CONTACT_EMAIL}`} className='font-[font1] text-sm hover:text-[#D3FD50] lg:text-lg'>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  )
}

export default Contact