// mobileSrc se usa siempre por defecto; desktopSrc la reemplaza en pantallas
// de 1024px o más. El navegador elige la fuente UNA sola vez al cargar la
// página (no cambia si luego resizeas la ventana) — comportamiento normal
// y esperado de <video><source media="..."></video>.
const SectionVideo = ({ mobileSrc, desktopSrc }) => {
  return (
    <div
      className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black'
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      <video
        key={`${mobileSrc}-${desktopSrc}`}
        className='h-full w-full object-cover'
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        aria-hidden='true'
      >
        {desktopSrc && <source src={desktopSrc} media='(min-width: 1024px)' type='video/mp4' />}
        <source src={mobileSrc} type='video/mp4' />
      </video>
      <div className='absolute inset-0 bg-black/0' />
    </div>
  )
}

export default SectionVideo
