import { useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NavbarColorContext, NavbarContext } from '../../context/NavContext'
import { useSound } from '../../hooks/useSound'
import Logo from '../common/Logo'
import SoundIcon from '../common/SoundIcon'

const Navbar = () => {
  const [navOpen, setNavOpen] = useContext(NavbarContext)
  const [navColor] = useContext(NavbarColorContext)
  const [muted, toggleSound] = useSound()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  const colorClass = navColor === 'black' ? 'text-black/70 hover:text-black' : 'text-white/70 hover:text-white'

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
          botón "Close" del menú, ambos en la misma esquina. La bocina va
          en el MISMO contenedor que "About" para quedar perfectamente
          alineada con ella, pegada justo a su izquierda. */}
      {!navOpen && (
        <div className='flex items-center gap-2 p-3 lg:gap-3 lg:p-6'>
          <button
            type='button'
            aria-label={muted ? 'Activar sonido' : 'Desactivar sonido'}
            data-sound-toggle
            onClick={toggleSound}
            className={`transition-colors ${colorClass}`}
          >
            <SoundIcon muted={muted} />
          </button>
          <button
            type='button'
            aria-label='Open menu'
            onClick={() => setNavOpen(true)}
            className={`font-[font3] text-[clamp(0.9rem,1.4vw,1.1rem)] uppercase tracking-wide transition-colors ${colorClass}`}
          >
            About
          </button>
        </div>
      )}
    </div>
  )
}

export default Navbar
