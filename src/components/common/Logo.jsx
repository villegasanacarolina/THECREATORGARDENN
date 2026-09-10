// Logo real (ya no el placeholder de texto "TCG"): imagen con fondo
// transparente, siempre en negro para que se vea bien en cualquier fondo.
const Logo = ({ className = '' }) => (
  <img src='/logo/logo.png' alt='The Creator Garden' className={className} />
)

export default Logo
