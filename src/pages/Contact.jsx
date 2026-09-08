import { useEffect, useState } from 'react'
import { CONTACT_EMAIL } from '../data/site'

const contactScenes = [
  { subject: 'project' },
  { subject: 'brand' },
  { subject: 'next idea' },
]

// Ángulo más sutil (como la referencia) en vez de 15deg, que se veía muy inclinado
const TICKER_ROTATION_DEG = 8
// Ancho apenas mayor a 100vw: con un ángulo tan sutil no hace falta 200-260vw,
// eso era lo que dejaba franjas negras al no cubrir bien las esquinas.
// Offset fijo (no cambia con la dirección) para que el punto de giro sea siempre el mismo,
// recorrido levemente a la derecha como pediste.
const TICKER_OFFSET_X = '-48%'

const ContactTicker = ({ scrollDirection }) => {
  const [inverted, setInverted] = useState(false)
  const tickerText = `${CONTACT_EMAIL}  ♥  `
  // Nunca 0deg: siempre rota con la misma magnitud, solo cambia el signo
  // según la dirección del scroll. Mismo pivote = mismo punto más alto en ambos sentidos.
  const rotation = scrollDirection === 'up' ? -TICKER_ROTATION_DEG : TICKER_ROTATION_DEG

  return (
    <button
      type='button'
      aria-label='Email The Creator Garden'
      onClick={() => setInverted((current) => !current)}
      onMouseEnter={() => setInverted(true)}
      onMouseLeave={() => setInverted(false)}
      className={`contact-ticker absolute top-[80%] left-1/2 z-30 w-[120vw] overflow-hidden py-3 text-left font-[font2] text-[9vw] uppercase leading-none transition-[background-color,transform] duration-700 lg:text-[6vw] ${inverted ? 'bg-white text-black' : 'bg-[#D3FD50] text-black'}`}
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

const Contact = () => {
  // Arranca en 'down' en lugar de null, para que la tira nunca renderice
  // en el estado plano (0deg) antes del primer scroll.
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
      {contactScenes.map((scene, index) => (
        <section
          key={scene.subject}
          className={`relative z-0 isolate flex min-h-[110vh] flex-col justify-center overflow-hidden px-6 py-24 lg:min-h-[115vh] lg:px-16 ${index > 0 ? '-mt-[24vh] lg:mt-0' : ''}`}
        >
          <h1 className='mx-auto max-w-[12ch] pb-[36vh] text-center font-[font2] text-[14vw] uppercase leading-[0.82] lg:text-[9vw]'>
            To talk<br />about<br />your<br />{scene.subject}
          </h1>
          <p className='absolute bottom-[32%] left-8 max-w-[12rem] text-center font-[font1] text-sm leading-tight lg:bottom-[54%] lg:left-16 lg:text-lg'>
            Onscreen or in an office.<br />Here. There.<br />Anywhere.
          </p>
          <a href='https://maps.google.com/?q=ITESM+Campus+Gdl+Zapopan+Jalisco' target='_blank' rel='noreferrer' className='absolute bottom-[32%] right-8 max-w-[15rem] text-right font-[font1] text-sm leading-tight hover:text-[#D3FD50] lg:bottom-[54%] lg:right-16 lg:text-lg'>
            ITESM Campus Gdl<br />Zapopan, Jalisco →
          </a>
          <ContactTicker scrollDirection={scrollDirection} />
        </section>
      ))}
      <footer className='flex flex-wrap items-center justify-between gap-8 border-t border-white/30 px-4 py-8 lg:px-8'>
        <a href={`mailto:${CONTACT_EMAIL}`} className='font-[font1] text-sm hover:text-[#D3FD50] lg:text-lg'>{CONTACT_EMAIL}</a>
      </footer>
    </main>
  )
}

export default Contact