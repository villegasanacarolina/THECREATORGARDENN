import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NavbarContext, NavbarColorContext } from './contexts'

export { NavbarContext, NavbarColorContext } from './contexts'

const NavContext = ({ children }) => {
  const [navColor, setNavColor] = useState('white')
  const [navOpen, setNavOpen] = useState(false)

  const locate = useLocation().pathname
  useEffect(() => {
    // Home y Work usan controles negros. Services, Approach y Contact,
    // sobre fondos oscuros, conservan controles blancos.
    const blackTextPages = ['/', '/work', '/projects']
    if (blackTextPages.includes(locate)) setNavColor('black')
    else setNavColor('white')
  }, [locate])

  return (
    <div>
      <NavbarContext.Provider value={[navOpen, setNavOpen]}>
        <NavbarColorContext.Provider value={[navColor, setNavColor]}>
          {children}
        </NavbarColorContext.Provider>
      </NavbarContext.Provider>
    </div>
  )
}

export default NavContext
