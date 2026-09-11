import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NavbarColorContext, NavbarContext } from '../../context/NavContext'
import Logo from '../common/Logo'

const Navbar = () => {
  const [navOpen, setNavOpen] = useContext(NavbarContext)
  const [navColor] = useContext(NavbarColorContext)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className='fixed top-0 z-40 flex w-full items-start justify-between p-1 lg:p-2'>
      {/* En Home el logo ya vive dentro del propio hero — mostrar también
          este de aquí duplicaba el logo en pantalla. En las demás páginas
          sigue siendo el único, pegado bien a la esquina. */}
      {!isHome && (
        <div className='w-[clamp(5rem,7vw,7rem)] cursor-pointer' onClick={() => navigate('/')}>
          <Logo className='h-auto w-full' />
        </div>
      )}
      {isHome && <div />}

      {/* Oculto mientras el menú está abierto: si no, se traslapaba con el
          botón "Close" del menú, ambos en la misma esquina. */}
      {!navOpen && (
        <button
          type='button'
          aria-label='Open menu'
          onClick={() => setNavOpen(true)}
          className={`p-3 font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] uppercase tracking-wide transition-colors lg:p-6 ${navColor === 'black' ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'}`}
        >
          About
        </button>
      )}
    </div>
  )
}

export default Navbar
