import React from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../../lib/trackEvent'

const HomeBottomText = () => {
  return (
    <div className='font-[font2] flex items-center justify-center gap-8'>
      <Link
        className='text-[6vw] uppercase text-black transition-colors hover:text-[#D9A99B] lg:text-[2vw]'
        to='/work'
        onClick={() => trackEvent('click', 'home_cta', { to: '/work' })}
      >
        Work
      </Link>
      <Link
        className='text-[6vw] uppercase text-black transition-colors hover:text-[#D9A99B] lg:text-[2vw]'
        to='/contact'
        onClick={() => trackEvent('click', 'home_cta', { to: '/contact' })}
      >
        Contact
      </Link>
    </div>
  )
}

export default HomeBottomText
