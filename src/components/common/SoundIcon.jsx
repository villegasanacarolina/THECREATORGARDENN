// Bocina simple; cuando está silenciado se le agrega una línea diagonal
// pequeña encima (no una X completa, solo una slash como se pidió).
const SoundIcon = ({ muted, className = 'h-4 w-4' }) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' className={className}>
    <path d='M4 9v6h4l5 5V4L8 9H4z' strokeLinejoin='round' />
    {!muted && <path d='M16.5 8.5a5 5 0 0 1 0 7' strokeLinecap='round' />}
    {muted && <line x1='3' y1='3' x2='21' y2='21' strokeLinecap='round' />}
  </svg>
)

export default SoundIcon
