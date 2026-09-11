import { approachBlocks } from '../data/site'
import ContactCta from '../components/common/ContactCta'
import SectionVideo from '../components/common/SectionVideo'

const Approach = () => {
  return (
    <div className='relative min-h-screen overflow-hidden bg-black pb-0 text-white'>
      <SectionVideo mobileSrc='/videos/APPROACH-Mobile.mp4' desktopSrc='/videos/APPROACH-Desktop.mp4' />
      <div className='relative z-10 px-6 pt-[25vh] lg:px-16'>
        <h1 className='font-[font2] text-6xl uppercase leading-none lg:text-[10vw]'>Our approach</h1>
      </div>
      <div className='mt-24 flex flex-col gap-40 lg:gap-64'>
        {approachBlocks.map((block, index) => {
          const right = index % 2 === 1
          return (
            <section
              key={index}
              className={`relative z-10 isolate overflow-hidden px-6 py-16 lg:px-16 ${right ? 'lg:flex lg:justify-end' : ''}`}
            >
              <div className={`relative w-full max-w-[19rem] ${right ? 'ml-auto text-right' : ''}`}>
                <p className='font-[font1] font-medium text-[2.5rem] leading-tight lg:text-[3rem]'>{block.text}</p>
              </div>
            </section>
          )
        })}
      </div>
      <ContactCta />
    </div>
  )
}

export default Approach
