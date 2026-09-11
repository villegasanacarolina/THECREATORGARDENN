import { serviceGroups, serviceIntro } from '../data/site'
import ContactCta from '../components/common/ContactCta'
import ScrollSmokeReveal from '../components/common/ScrollSmokeReveal'
import SectionVideo from '../components/common/SectionVideo'

const Services = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-black pb-0 text-white'>
      <SectionVideo mobileSrc='/videos/SERVICES-Mobile.mp4' desktopSrc='/videos/SERVICES-Desktop.mp4' />
      <section className='relative z-10 px-6 pt-[25vh] lg:px-16'>
        <ScrollSmokeReveal
          as='h1'
          text='Services'
          className='font-[font2] text-6xl uppercase leading-none lg:text-[10vw]'
        />
        <div className='mt-24 flex flex-col gap-40 lg:gap-64'>
          {[serviceIntro.left, serviceIntro.right].map((text) => (
            <section key={text} className='relative z-10 isolate overflow-hidden px-6 py-16'>
              <div className='relative w-full max-w-[19rem]'>
                <ScrollSmokeReveal
                  as='p'
                  text={text}
                  className='font-[font1] font-medium text-[2.5rem] leading-tight lg:text-[3rem]'
                />
              </div>
            </section>
          ))}
        </div>
      </section>

      {serviceGroups.map((group, index) => (
        <section key={index} className='relative z-10 isolate flex overflow-hidden px-6 py-24 lg:justify-end lg:px-16'>
          <ul className='relative ml-auto w-full max-w-[19rem] space-y-3 text-right font-[font1] text-2xl lg:text-4xl'>
            {group.map((item) => (
              <ScrollSmokeReveal as='li' key={item} text={item} />
            ))}
          </ul>
        </section>
      ))}
      <ContactCta />
    </div>
  )
}

export default Services
