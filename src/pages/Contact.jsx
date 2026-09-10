import { useEffect, useState } from 'react'
import { CONTACT_EMAIL } from '../data/site'
import { trackEvent } from '../lib/trackEvent'
import SectionVideo from '../components/common/SectionVideo'

const contactScenes = [
  { subject: 'project' },
  { subject: 'brand' },
  { subject: 'next idea' },
]

const TICKER_ROTATION_DEG = 8
const TICKER_OFFSET_X = '-48%'

const HeartIcon = () => (
  <svg viewBox='0 0 24 24' fill='currentColor' className='mx-3 inline-block h-[0.55em] w-[0.55em] align-middle'>
    <path d='M12 21s-6.7-4.33-9.3-8.1C1 10.5 1.3 7 4 5.3c2.2-1.4 4.9-.7 6.3 1.1L12 8l1.7-1.6c1.4-1.8 4.1-2.5 6.3-1.1 2.7 1.7 3 5.2 1.3 7.6C18.7 16.67 12 21 12 21z' />
  </svg>
)

const ContactTicker = ({ scrollDirection, topClass }) => {
  const rotation = scrollDirection === 'up' ? -TICKER_ROTATION_DEG : TICKER_ROTATION_DEG

  return (
    <button
      type='button'
      aria-label='Email The Creator Garden'
      onClick={() => trackEvent('click', 'email_ticker')}
      className={`contact-ticker absolute ${topClass} left-1/2 z-30 w-[120vw] overflow-hidden bg-white py-3 text-left font-[font2] text-[9vw] uppercase leading-none text-black lg:text-[6vw]`}
      style={{
        transform: `translate(${TICKER_OFFSET_X}, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <span className='contact-ticker-track inline-flex items-center whitespace-nowrap'>
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} className='inline-flex items-center'>
            {CONTACT_EMAIL}
            <HeartIcon />
          </span>
        ))}
      </span>
    </button>
  )
}

const MOBILE_SECTION_HEIGHT = 'min-h-[58vh]'
const MOBILE_HEADING_PADDING = 'pb-[8vh]'
const MOBILE_TICKER_TOP = 'top-[78%]'
const MOBILE_SMALL_TEXT_BOTTOM = 'bottom-[60%]'
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
        <a href='https://maps.google.com/?q=ITESM+Campus+Gdl+Zapopan+Jalisco' target='_blank' rel='noreferrer' onClick={() => trackEvent('click', 'address')} className={`absolute ${MOBILE_SMALL_TEXT_BOTTOM} right-4 max-w-[15rem] rounded-md bg-white px-2 py-1.5 text-right font-[font1] ${MOBILE_SMALL_TEXT_SIZE} leading-tight text-black transition-colors hover:bg-[#D9A99B]`}>
          ITESM Campus Gdl<br />Zapopan, Jalisco →
        </a>
        <ContactTicker scrollDirection={scrollDirection} topClass={MOBILE_TICKER_TOP} />
      </section>
    ))}
  </div>
)

const DESKTOP_SECTION_HEIGHT = 'min-h-[115vh]'
const DESKTOP_HEADING_PADDING = 'pb-[36vh]'
const DESKTOP_TICKER_TOP = 'top-[80%]'
const DESKTOP_SMALL_TEXT_BOTTOM = 'bottom-[54%]'
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
        <a href='https://maps.google.com/?q=ITESM+Campus+Gdl+Zapopan+Jalisco' target='_blank' rel='noreferrer' onClick={() => trackEvent('click', 'address')} className={`absolute ${DESKTOP_SMALL_TEXT_BOTTOM} right-16 max-w-[15rem] rounded-md bg-white px-3 py-2 text-right font-[font1] ${DESKTOP_SMALL_TEXT_SIZE} leading-tight text-black transition-colors hover:bg-[#D9A99B]`}>
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
      <SectionVideo mobileSrc='/videos/ZEBRA-Mobile.mp4' desktopSrc='/videos/ZEBRA-Desktop.mp4' />
      <ContactMobile scrollDirection={scrollDirection} />
      <ContactDesktop scrollDirection={scrollDirection} />
      <footer className='flex flex-wrap items-center justify-between gap-8 border-t border-white/30 px-4 py-8 lg:px-8'>
        <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => trackEvent('click', 'email')} className='font-[font1] text-sm hover:text-[#D9A99B] lg:text-lg'>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  )
}

export default Contact