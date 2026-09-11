import { useEffect, useState } from 'react'
import Logo from '../common/Logo'

const LoadingScreen = ({ progress, ready }) => {
  const [hidden, setHidden] = useState(ready)

  useEffect(() => {
    if (!ready) return undefined
    const timeout = setTimeout(() => setHidden(true), 600)
    return () => clearTimeout(timeout)
  }, [ready])

  if (hidden) return null

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-[#e5e5e5] px-6 transition-opacity duration-700 ${ready ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className='flex items-center gap-3'>
        <Logo className='h-6 w-6 lg:h-8 lg:w-8' />
        <span className='font-[font3] text-xs uppercase tracking-[0.2em] text-black lg:text-sm'>
          The Creator Garden
        </span>
      </div>
      <div className='h-px w-[min(28rem,70vw)] bg-black/20'>
        <div
          className='h-px bg-black/60 transition-all duration-300 ease-out'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default LoadingScreen
