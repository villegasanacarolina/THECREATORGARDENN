import { serviceGroups, serviceIntro } from '../data/site'
import ContactCta from '../components/common/ContactCta'
import SectionVideo from '../components/common/SectionVideo'

const Services = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-black pb-0 text-white'>
      <SectionVideo mobileSrc='/videos/SERVICES-Mobile.mp4' desktopSrc='/videos/SERVICES-Desktop.mp4' />
      <section className='relative z-10 px-6 pt-[25vh] lg:px-16'>
        <h1 className='font-[font2] text-6xl uppercase leading-none lg:text-[10vw]'>Services</h1>
        {/* Textos de introducción: siempre del lado izquierdo */}
        <div className='mt-24 flex flex-col gap-40 lg:gap-64'>
          {[serviceIntro.left, serviceIntro.right].map((text) => (
            <section key={text} className='relative z-10 isolate overflow-hidden px-6 py-16'>
              <div className='relative w-full max-w-[19rem]'>
                <p className='font-[font1] text-xl leading-relaxed lg:text-2xl'>{text}</p>
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Listas de servicios: siempre del lado derecho */}
      {serviceGroups.map((group, index) => (
        <section key={index} className='relative z-10 isolate flex overflow-hidden px-6 py-24 lg:justify-end lg:px-16'>
          <ul className='relative ml-auto w-full max-w-[19rem] space-y-3 text-right font-[font1] text-2xl lg:text-4xl'>
            {group.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      <ContactCta />
    </div>
  )
}

export default Services
