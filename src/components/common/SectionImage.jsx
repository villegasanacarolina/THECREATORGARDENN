const SectionImage = ({ src, alt = '' }) => {
  return (
    <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black'>
      <img
        src={src}
        alt={alt}
        className='h-full w-full object-cover'
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      />
      <div className='absolute inset-0 bg-black/0' />
    </div>
  )
}

export default SectionImage
