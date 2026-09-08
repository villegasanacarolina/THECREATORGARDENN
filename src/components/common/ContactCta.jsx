import { Link } from 'react-router-dom'

const ContactCta = () => {
  return (
    <section className='flex min-h-[12rem] items-center justify-end bg-black px-4 py-10 text-white lg:min-h-[18rem] lg:px-8'>
      <Link
        to='/contact'
        className='flex items-center rounded-full border-2 border-white px-8 py-3 font-[font2] text-5xl uppercase leading-none transition-colors hover:border-[#D3FD50] hover:text-[#D3FD50] lg:px-16 lg:text-8xl'
      >
        Contact <span className='ml-4 text-4xl lg:text-7xl'>♥</span>
      </Link>
    </section>
  )
}

export default ContactCta