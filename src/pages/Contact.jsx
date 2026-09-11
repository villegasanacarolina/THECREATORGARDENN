import { CONTACT_EMAIL } from '../data/site'
import { trackEvent } from '../lib/trackEvent'
import SectionVideo from '../components/common/SectionVideo'

const Contact = () => {
  return (
    <main className='relative min-h-dvh bg-black text-white'>
      <SectionVideo mobileSrc='/videos/CONTACT-Mobile.mp4' desktopSrc='/videos/CONTACT-Desktop.mp4' />

      <div className='relative z-10 flex min-h-dvh items-center justify-center px-6'>
        <div className='w-full max-w-md space-y-8'>
          <h1 className='font-[font2] text-5xl uppercase leading-none lg:text-6xl'>Contact us</h1>

          <p className='font-[font1] text-xl leading-snug lg:text-2xl'>
            Interaction begins<br />with dialogue.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={() => trackEvent('click', 'email')}
            className='block font-[font1] text-xl leading-snug transition-colors hover:text-[#D9A99B] lg:text-2xl'
          >
            {CONTACT_EMAIL}
          </a>

          <a
            href='https://maps.google.com/?q=ITESM+Campus+Guadalajara+Zapopan+Jalisco'
            target='_blank'
            rel='noreferrer'
            onClick={() => trackEvent('click', 'address')}
            className='block font-[font1] text-xl leading-snug transition-colors hover:text-[#D9A99B] lg:text-2xl'
          >
            ITESM Campus Guadalajara<br />Zapopan, Jalisco
          </a>
        </div>
      </div>
    </main>
  )
}

export default Contact
