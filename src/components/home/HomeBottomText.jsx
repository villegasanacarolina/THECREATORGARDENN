import React from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../../lib/trackEvent'

const HomeBottomText = () => {
  return (
    <div className='font-[font2] flex items-center justify-center gap-2'>
      <div className='lg:border-3 border-2 hover:border-[#D9A99B] hover:text-[#D9A99B] lg:h-44 flex items-center px-3 pt-1 lg:px-14 border-white rounded-full uppercase'>
        <Link className='text-[6vw] lg:mt-6' to='/work' onClick={() => trackEvent('click', 'home_cta', { to: '/work' })}>Work</Link>
      </div>
      <div className='lg:border-3 border-2 hover:border-[#D9A99B] hover:text-[#D9A99B] lg:h-44 flex items-center px-3 pt-1 lg:px-14 border-white rounded-full uppercase'>
        <Link className='text-[6vw] lg:mt-6' to='/contact' onClick={() => trackEvent('click', 'home_cta', { to: '/contact' })}>Contact</Link>
      </div>
    </div>
  )
}

export default HomeBottomText
