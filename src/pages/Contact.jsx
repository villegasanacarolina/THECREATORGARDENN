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
            className='font-[font2] text-6xl uppercase leading-none [text-shadow:0_3px_14px_rgba(0,0,0,0.55)] lg:text-7xl'
            immediate
          />

          <ScrollSmokeReveal
            as='p'
            text={'Interaction begins\nwith dialogue.'}
            className='font-[font1] text-[1.4rem] leading-snug [text-shadow:0_3px_12px_rgba(0,0,0,0.55)] lg:text-[1.7rem]'
            immediate
            delay={0.08}
          />

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={() => trackEvent('click', 'email', { value: CONTACT_EMAIL })}
            className='block font-[font1] text-[1.4rem] leading-snug [text-shadow:0_3px_12px_rgba(0,0,0,0.55)] transition-colors hover:text-[#D9A99B] lg:text-[1.7rem]'
          >
            <ScrollSmokeReveal text={CONTACT_EMAIL} immediate delay={0.14} />
          </a>

          <a
            href='https://maps.google.com/?q=ITESM+Campus+Guadalajara+Zapopan+Jalisco'
            target='_blank'
            rel='noreferrer'
            onClick={() => trackEvent('click', 'address', { value: 'ITESM Campus Guadalajara, Zapopan, Jalisco' })}
            className='block font-[font1] text-[1.4rem] leading-snug [text-shadow:0_3px_12px_rgba(0,0,0,0.55)] transition-colors hover:text-[#D9A99B] lg:text-[1.7rem]'
          >
            <ScrollSmokeReveal text={'ITESM Campus Guadalajara\nZapopan, Jalisco'} immediate delay={0.2} />
          </a>
        </div>
      </div>
    </main>
  )
}

export default Contact
