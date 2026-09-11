import { useEffect, useRef, useState } from 'react'

// mobileSrc se usa siempre por defecto; desktopSrc la reemplaza en pantallas
// de 1024px o más. El navegador elige la fuente UNA sola vez al cargar la
// página (no cambia si luego resizeas la ventana) — comportamiento normal
// y esperado de <video><source media="...">.
//
// poster (opcional): una imagen estática que se muestra INSTANTÁNEO mientras
// el video pesado sigue cargando, en vez de ver la pantalla en negro/vacía
// todo ese tiempo. Recomendado si tus videos son grandes.
const SectionVideo = ({ mobileSrc, desktopSrc, poster }) => {
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Ya NO llamamos .load() aquí: como las <source> ya vienen presentes
    // desde el primer render (no se agregan después), el navegador arranca
    // la descarga correctamente solo. Forzar .load() reiniciaba esa
    // descarga desde cero, lo cual es justo lo que causaba la demora extra
    // en videos pesados. Solo dejamos play() como red de seguridad para
    // el autoplay.
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [mobileSrc, desktopSrc])

  return (
    <div
      className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black'
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      <video
        ref={videoRef}
        // Fundido de entrada una vez que ya hay un frame real listo para
        // pintar — así se evita cualquier parpadeo del primer cuadro.
        className={`h-full w-full object-cover transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
        autoPlay
        muted
        loop
        playsInline
        preload='auto'
        poster={poster}
        aria-hidden='true'
        onCanPlay={() => setReady(true)}
      >
        {desktopSrc && <source src={desktopSrc} media='(min-width: 1024px)' type='video/mp4' />}
        <source src={mobileSrc} type='video/mp4' />
      </video>
      <div className='absolute inset-0 bg-black/0' />
    </div>
  )
}

export default SectionVideo
