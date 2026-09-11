import { Link } from 'react-router-dom'
import HeartIcon from './HeartIcon'
import { trackEvent } from '../../lib/trackEvent'

const ContactCta = () => {
  return (
    <section className='flex min-h-[12rem] items-center justify-end bg-black px-4 py-10 text-white lg:min-h-[18rem] lg:px-8'>
      <Link
        to='/contact'
        onClick={() => trackEvent('click', 'contact_cta', { to: '/contact' })}
        className='flex items-center rounded-full border-2 border-white px-8 py-3 font-[font2] text-5xl uppercase leading-none transition-colors hover:border-[#D9A99B] hover:text-[#D9A99B] lg:px-16 lg:text-8xl'
      >
        Contact <HeartIcon className='ml-4 inline-block h-[0.7em] w-[0.7em] align-middle' />
      </Link>
    </section>
  )
}

export default ContactCta