import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavbarColorContext, NavbarContext } from '../../context/NavContext'
import Logo from '../common/Logo'

const SECRET_CLICKS = 5
const SECRET_WINDOW_MS = 3000

const Navbar = () => {
  const navGreenRef = useRef(null)
  const clickTimestampsRef = useRef([])
  const [, setNavOpen] = useContext(NavbarContext)
  const [navColor] = useContext(NavbarColorContext)
  const navigate = useNavigate()

  const handleLogoClick = () => {
    const now = Date.now()
    clickTimestampsRef.current = [...clickTimestampsRef.current, now].filter((t) => now - t < SECRET_WINDOW_MS)

    if (clickTimestampsRef.current.length >= SECRET_CLICKS) {
      clickTimestampsRef.current = []
      navigate('/admin')
      return
    }

    navigate('/')
  }

  return (
    <div className='fixed top-0 z-40 flex w-full items-start justify-between'>
      <div className='p-2 lg:p-5'>
        <div className='w-[clamp(6rem,9vw,9rem)] cursor-pointer' onClick={handleLogoClick}>
          <Logo fill={navColor} className='w-full h-auto' />
        </div>
      </div>
      <button
        type='button'
        aria-label='Open menu'
        onClick={() => setNavOpen(true)}
        onMouseEnter={() => { navGreenRef.current.style.height = '100%' }}
        onMouseLeave={() => { navGreenRef.current.style.height = '0%' }}
        className='relative h-[clamp(2.5rem,4vw,4rem)] w-[clamp(12rem,30vw,15rem)] border-0 bg-black p-0'
      >
        <div ref={navGreenRef} className='bg-[#D3FD50] transition-all absolute top-0 h-0 w-full'></div>
        <div className='relative h-full flex flex-col justify-center items-end gap-0.5 px-8 lg:gap-1.5 lg:px-12'>
          <div className='h-0.5 w-[clamp(3rem,6vw,4.5rem)] bg-white'></div>
          <div className='h-0.5 w-[clamp(1.5rem,4vw,2.5rem)] bg-white'></div>
        </div>
      </button>
    </div>
  )
}

export default Navbar
