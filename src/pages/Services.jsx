import { serviceGroups, serviceIntro } from '../data/site'
import ContactCta from '../components/common/ContactCta'
import SectionVideo from '../components/common/SectionVideo'

const Services = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-black pb-0 text-black'>
      <SectionVideo mobileSrc='/videos/ELEFANTES-Mobile.mp4' desktopSrc='/videos/ELEFANTES-Desktop.mp4' />
      <section className='relative z-10 px-6 pt-[25vh] lg:px-16'>
        <h1 className='font-[font2] text-6xl uppercase leading-none lg:text-[10vw]'>Services</h1>
        <div className='mt-24 flex flex-col gap-40 lg:gap-64'>
          {[serviceIntro.left, serviceIntro.right].map((text, index) => (
            <section key={text} className={`relative z-10 isolate overflow-hidden px-6 py-16 ${index % 2 === 1 ? 'ml-auto text-right' : ''}`}>
              <div className='relative w-full max-w-[19rem]'>
                <p className='font-[font1] text-xl leading-relaxed lg:text-2xl'>{text}</p>
              </div>
            </section>
          ))}
        </div>
      </section>

      {serviceGroups.map((group, index) => {
        const right = index % 2 === 1
        return (
          <section
            key={index}
            className={`relative z-10 isolate overflow-hidden px-6 py-24 lg:px-16 ${right ? 'lg:flex lg:justify-end' : ''}`}
          >
            <ul className={`relative w-full max-w-[19rem] space-y-3 font-[font1] text-2xl lg:text-4xl ${right ? 'ml-auto text-right' : ''}`}>
              {group.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )
      })}
      <ContactCta />
    </div>
  )
}

export default Services
