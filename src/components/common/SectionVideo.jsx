import { useEffect, useRef } from 'react'

// mobileSrc se usa siempre por defecto; desktopSrc la reemplaza en pantallas
// de 1024px o más. El navegador elige la fuente UNA sola vez al cargar la
// página (no cambia si luego resizeas la ventana) — comportamiento normal
// y esperado de <video><source media="..."></video>.
const SectionVideo = ({ mobileSrc, desktopSrc }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    // Con React, las <source> se insertan de forma dinámica (no vienen ya
    // en el HTML que el navegador parsea de entrada) — varios navegadores
    // no vuelven a evaluar cuál fuente usar a menos que se les pida
    // explícitamente. Sin este .load(), el video puede quedarse sin ninguna
    // fuente seleccionada y mostrarse en negro.
    if (videoRef.current) {
      videoRef.current.load()
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
