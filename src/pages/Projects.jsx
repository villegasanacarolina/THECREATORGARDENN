import UgcCard from '../components/projects/UgcCard'
import ContactCta from '../components/common/ContactCta'
import TouchSmokeText from '../components/garden/TouchSmokeText'
import { projects } from '../data/site'

const Projects = () => {
  return (
    <div className='min-h-screen bg-black text-black'>
      {/* Encabezado transparente: aquí se ve la animación 3D de fondo,
          igual que en Home. */}
      <div className='relative z-10 pb-0 pt-[28vh]'>
        <h1 className='px-2 font-[font2] text-8xl uppercase leading-none lg:px-4 lg:text-[11vw]'>
          <TouchSmokeText text='Work' /> <sup className='align-super text-[0.22em]'>{projects.length}</sup>
        </h1>
      </div>
      {/* La cuadrícula sí lleva fondo blanco sólido: con tantas tarjetas de
          video, se lee mucho mejor con buen contraste. */}
      <div className='relative z-10 bg-white p-2 pb-12 pt-10 lg:p-4 lg:pt-14'>
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
