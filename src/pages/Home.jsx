import React from 'react'
import Video from '../components/home/Video'
import HomeHeroText from '../components/home/HomeHeroText'
import HomeBottomText from '../components/home/HomeBottomText'

const Home = () => {
    return (
        <div className='text-white'>
            <div className='fixed inset-0'>
                <Video />
            </div>
            <div className='h-dvh w-full relative pb-5 overflow-hidden flex flex-col justify-between'>
                {/* Arriba a la derecha, pegado justo debajo del botón del menú */}
                <p className='absolute right-2 top-[clamp(4.5rem,10vw,6rem)] z-10 max-w-[9rem] text-right font-[font1] text-[10px] leading-snug text-white/90 lg:right-6 lg:top-20 lg:max-w-[15vw] lg:text-base lg:leading-relaxed'>
                    The Creator Garden is a UGC agency that grows brands with viral creator content. We cast talent, produce campaigns, and turn attention into conversions — today, tomorrow, and years from now.
                </p>
                <HomeHeroText />
                <HomeBottomText />
            </div>
        </div>
    )
}

export default Home
