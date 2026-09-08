import UgcCard from '../components/projects/UgcCard'
import ContactCta from '../components/common/ContactCta'
import { projects } from '../data/site'

const Projects = () => {
  return (
    <div className='min-h-screen bg-black text-black'>
      <div className='bg-white p-2 pb-12 lg:p-4'>
        <div className='pt-[28vh] pb-0'>
          <h1 className='font-[font2] text-8xl uppercase leading-none lg:text-[11vw]'>
            Work <sup className='align-super text-[0.22em]'>14</sup>
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
