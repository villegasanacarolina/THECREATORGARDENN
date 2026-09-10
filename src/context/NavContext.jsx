import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { NavbarContext, NavbarColorContext } from './contexts'

export { NavbarContext, NavbarColorContext } from './contexts'

const NavContext = ({ children }) => {

    const [navColor, setNavColor] = useState('white')
    
    const [navOpen, setNavOpen] = useState(false)

    const locate = useLocation().pathname
    useEffect(function(){
        // Home, Work y Approach ahora son de fondo claro/negro sobre claro.
        // Services y Contact llevan video con texto blanco.
        const blackTextPages = ['/', '/work', '/projects', '/approach']
        if (blackTextPages.includes(locate)) {
            setNavColor('black')
        } else {
            setNavColor('white')
        }
    },[locate])
    

    return (
        <div>
            <NavbarContext.Provider value={[navOpen, setNavOpen]}>
                <NavbarColorContext.Provider value={[navColor,setNavColor]}>
                    {children}
                </NavbarColorContext.Provider>
            </NavbarContext.Provider>
        </div>
    )
}

export default NavContext