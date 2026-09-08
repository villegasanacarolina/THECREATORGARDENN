import { CONTACT_EMAIL } from '../../data/site'

const Logo = ({ fill = 'white', className = '' }) => (
  <svg className={className} viewBox="0 0 160 44" xmlns="http://www.w3.org/2000/svg" aria-label="The Creator Garden">
    <text x="0" y="34" fill={fill} fontFamily="Arial Black, Helvetica, sans-serif" fontSize="32" letterSpacing="-1">
      TCG
    </text>
  </svg>
)

export const EmailMark = ({ className = '' }) => (
  <span className={className}>{CONTACT_EMAIL}</span>
)

export default Logo
