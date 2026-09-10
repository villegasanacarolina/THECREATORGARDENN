import React from 'react'
import HomeHeroText from '../components/home/HomeHeroText'
import HomeBottomText from '../components/home/HomeBottomText'

const Home = () => {
    return (
        <div className='text-black'>
            <div className='relative z-10 h-dvh w-full pb-5 overflow-hidden flex flex-col justify-between'>
                <HomeHeroText />
                <HomeBottomText />
            </div>
        </div>
    )
}

export default Home
