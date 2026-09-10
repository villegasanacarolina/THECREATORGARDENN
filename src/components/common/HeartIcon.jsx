// SVG con fill='currentColor': siempre toma el color del texto que lo rodea,
// sin importar el dispositivo. El carácter ♥ de texto se pinta en rojo en
// varios celulares (el sistema lo sustituye por su propio emoji a color),
// ignorando cualquier color que le pongas en CSS.
const HeartIcon = ({ className = 'mx-3 inline-block h-[0.55em] w-[0.55em] align-middle' }) => (
  <svg viewBox='0 0 24 24' fill='currentColor' className={className}>
    <path d='M12 21s-6.7-4.33-9.3-8.1C1 10.5 1.3 7 4 5.3c2.2-1.4 4.9-.7 6.3 1.1L12 8l1.7-1.6c1.4-1.8 4.1-2.5 6.3-1.1 2.7 1.7 3 5.2 1.3 7.6C18.7 16.67 12 21 12 21z' />
  </svg>
)

export default HeartIcon
