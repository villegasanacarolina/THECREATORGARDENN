const SectionVideo = ({ src }) => {
  return (
    <div
      className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black'
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      <video
        key={src}
        className='h-full w-full object-cover'
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        aria-hidden='true'
      >
        <source src={src} type='video/mp4' />
      </video>
      <div className='absolute inset-0 bg-black/0' />
    </div>
  )
}

export default SectionVideo
