import { CONTACT_EMAIL } from '../data/site'
import { trackEvent } from '../lib/trackEvent'
import ScrollSmokeReveal from '../components/common/ScrollSmokeReveal'
import SectionVideo from '../components/common/SectionVideo'

const Contact = () => {
  return (
    <main className='relative min-h-dvh bg-black text-white'>
      <SectionVideo mobileSrc='/videos/CONTACT-Mobile.mp4' desktopSrc='/videos/CONTACT-Desktop.mp4' />

      <div className='relative z-10 flex min-h-dvh items-center justify-center px-6'>
        <div className='w-full max-w-md space-y-8'>
          <ScrollSmokeReveal
            as='h1'
            text='Contact us'
            className='font-[font2] text-5xl uppercase leading-none lg:text-6xl'
          />

          <ScrollSmokeReveal
            as='p'
            text={'Interaction begins\nwith dialogue.'}
            className='font-[font1] text-xl leading-snug lg:text-2xl'
          />

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={() => trackEvent('click', 'email')}
            className='block font-[font1] text-xl leading-snug transition-colors hover:text-[#D9A99B] lg:text-2xl'
          >
            <ScrollSmokeReveal text={CONTACT_EMAIL} />
          </a>

          <a
            href='https://maps.google.com/?q=ITESM+Campus+Guadalajara+Zapopan+Jalisco'
            target='_blank'
            rel='noreferrer'
            onClick={() => trackEvent('click', 'address')}
            className='block font-[font1] text-xl leading-snug transition-colors hover:text-[#D9A99B] lg:text-2xl'
          >
            <ScrollSmokeReveal text={'ITESM Campus Guadalajara\nZapopan, Jalisco'} />
          </a>
        </div>
      </div>
    </main>
  )
}

export default Contact
