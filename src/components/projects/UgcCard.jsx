import { trackEvent } from '../../lib/trackEvent'

const UgcCard = ({ project }) => {
  return (
    <article className="flex h-full flex-col">
      <a
        href={project.href}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent('click', 'project', { project: project.id, creator: project.creator, brand: project.brand })}
        className="group relative block aspect-[9/16] overflow-hidden rounded-none bg-black transition-all hover:rounded-[40px]"
      >
        <iframe
          className="pointer-events-none h-full w-full"
          src={`https://www.tiktok.com/player/v1/${project.tiktokId}?description=1&music_info=0`}
          title={`${project.title} by ${project.creator}`}
          allow="fullscreen"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
        <p className="absolute bottom-4 left-4 font-[font2] text-sm uppercase tracking-wide text-white">
          {project.creator}
        </p>
      </a>
      <div className="mt-4 space-y-2 text-black">
        <h3 className="font-[font2] text-2xl uppercase leading-none">{project.title}</h3>
        <p className="font-[font1] text-sm uppercase tracking-widest text-black/60">{project.brand}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-[font1] text-sm uppercase lg:grid-cols-4">
          <span>{project.views} views</span>
          <span>{project.likes} likes</span>
          <span>{project.comments} comments</span>
        </div>
      </div>
    </article>
  )
}

export default UgcCard
