// mobileSrc se usa siempre por defecto; desktopSrc la reemplaza en pantallas
// de 1024px o más, vía <picture> — a diferencia de <video>, el navegador SÍ
// reevalúa esto correctamente sin necesitar ningún truco de JS.
const SectionImage = ({ mobileSrc, desktopSrc, alt = '' }) => {
  return (
    <div className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black'>
      <picture>
        {desktopSrc && <source srcSet={desktopSrc} media='(min-width: 1024px)' />}
        <img
          src={mobileSrc}
          alt={alt}
          className='h-full w-full object-cover'
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        />
      </picture>
      <div className='absolute inset-0 bg-black/0' />
    </div>
  )
}

export default SectionImage
