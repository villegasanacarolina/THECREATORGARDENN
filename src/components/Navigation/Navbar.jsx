import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarColorContext, NavbarContext } from '../../context/NavContext'
import Logo from '../common/Logo'

const Navbar = () => {
  const [, setNavOpen] = useContext(NavbarContext)
  const [navColor] = useContext(NavbarColorContext)
  const navigate = useNavigate()

  return (
    <div className='fixed top-0 z-40 flex w-full items-start justify-between p-5 lg:p-10'>
      <div className='w-[clamp(6rem,9vw,9rem)] cursor-pointer' onClick={() => navigate('/')}>
        <Logo className='w-full h-auto' />
      </div>
      <button
        type='button'
        aria-label='Open menu'
        onClick={() => setNavOpen(true)}
        className={`font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] uppercase tracking-wide transition-colors ${navColor === 'black' ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'}`}
      >
        About
      </button>
    </div>
  )
}

export default Navbar
