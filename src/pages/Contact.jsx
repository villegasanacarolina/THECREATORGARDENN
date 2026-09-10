import { CONTACT_EMAIL } from '../data/site'
import { trackEvent } from '../lib/trackEvent'
import SectionVideo from '../components/common/SectionVideo'
import HeartIcon from '../components/common/HeartIcon'

const contactScenes = [
  { subject: 'project' },
  { subject: 'brand' },
  { subject: 'next idea' },
]

// Completamente horizontal ahora — sin rotación ni compensación diagonal.
const ContactTicker = ({ topClass }) => (
  <button
    type='button'
    aria-label='Email The Creator Garden'
    onClick={() => trackEvent('click', 'email_ticker')}
    className={`contact-ticker absolute ${topClass} left-1/2 z-30 w-[102vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-white py-3 text-left font-[font2] text-[9vw] uppercase leading-none text-black lg:text-[6vw]`}
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

/* ============================================================================
   VERSIÓN MOBILE — toca SOLO estos 4 valores para ajustar mobile.
   No usan prefijo lg:, así que nada de lo que cambies aquí toca desktop.
   ============================================================================ */

// 1) QUÉ TAN CERCA ESTÁN LOS SLOGANS GRANDES ENTRE SÍ:
//    baja este número (ej. 50vh) para acercarlos más, súbelo para separarlos.
const MOBILE_SECTION_HEIGHT = 'min-h-[46vh]'

// Aire entre el slogan grande y el resto del contenido de su sección.
const MOBILE_HEADING_PADDING = 'pb-[8vh]'

// 2) POSICIÓN VERTICAL DE LA TIRA AMARILLA:
//    top-[X%] respecto a SU sección. Súbelo (ej. 85%) para bajar la tira,
//    bájalo (ej. 70%) para subirla. Debe quedar debajo del slogan grande.
const MOBILE_TICKER_TOP = 'top-[78%]'

// 3) POSICIÓN VERTICAL DEL TEXTO PEQUEÑO + LA DIRECCIÓN:
//    bottom-[X%]: entre más chico el número, más abajo se ve.
const MOBILE_SMALL_TEXT_BOTTOM = 'bottom-[60%]'

// 4) TAMAÑO DEL TEXTO PEQUEÑO + LA DIRECCIÓN
const MOBILE_SMALL_TEXT_SIZE = 'text-[8.4px]'

const ContactMobile = () => (
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
        <ContactTicker topClass={MOBILE_TICKER_TOP} />
      </section>
    ))}
  </div>
)

/* ============================================================================
   VERSIÓN DESKTOP — toca SOLO estos 4 valores para ajustar desktop.
   Estos son básicamente los que ya confirmaste que se ven bien.
   ============================================================================ */

// 1) QUÉ TAN CERCA ESTÁN LOS SLOGANS GRANDES ENTRE SÍ
const DESKTOP_SECTION_HEIGHT = 'min-h-[95vh]'

const DESKTOP_HEADING_PADDING = 'pb-[36vh]'

// 2) POSICIÓN VERTICAL DE LA TIRA AMARILLA
const DESKTOP_TICKER_TOP = 'top-[80%]'

// 3) POSICIÓN VERTICAL DEL TEXTO PEQUEÑO + LA DIRECCIÓN
const DESKTOP_SMALL_TEXT_BOTTOM = 'bottom-[54%]'

// 4) TAMAÑO DEL TEXTO PEQUEÑO + LA DIRECCIÓN
const DESKTOP_SMALL_TEXT_SIZE = 'text-lg'

const ContactDesktop = () => (
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
        <ContactTicker topClass={DESKTOP_TICKER_TOP} />
      </section>
    ))}
  </div>
)

const Contact = () => {
  return (
    <main className='bg-black text-white'>
      <SectionVideo mobileSrc='/videos/CONTACT-Mobile.mp4' desktopSrc='/videos/CONTACT-Desktop.mp4' />
      <ContactMobile />
      <ContactDesktop />
      <footer className='flex flex-wrap items-center justify-between gap-8 border-t border-white/30 px-4 py-8 lg:px-8'>
        <a href={`mailto:${CONTACT_EMAIL}`} onClick={() => trackEvent('click', 'email')} className='font-[font1] text-sm hover:text-[#D9A99B] lg:text-lg'>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  )
}

export default Contact
