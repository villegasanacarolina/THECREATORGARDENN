import UgcCard from '../components/projects/UgcCard'
import ContactCta from '../components/common/ContactCta'
import TouchSmokeText from '../components/garden/TouchSmokeText'
import { projects } from '../data/site'

const Projects = () => {
  return (
    <div className='relative z-10 min-h-screen bg-transparent text-black'>
      <div className='bg-transparent p-2 pb-12 lg:p-4'>
        <div className='pt-[28vh] pb-0'>
          <h1 className='font-[font2] text-8xl leading-none lg:text-[11vw]'>
            <TouchSmokeText text='Our work' /> <sup className='align-super text-[0.22em]'>{projects.length}</sup>
          </h1>
        </div>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((project) => (
            <UgcCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      <ContactCta />
    </div>
  )
}

export default Projects
