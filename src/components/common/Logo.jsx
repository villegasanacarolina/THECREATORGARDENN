const Logo = ({ className = '', tone = 'black' }) => (
  <img
    src='/logo/logo.png'
    alt='The Creator Garden'
    className={`${tone === 'white' ? 'brightness-0 invert' : 'brightness-0'} ${className}`}
  />
)

export default Logo
