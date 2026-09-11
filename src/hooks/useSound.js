import { useContext } from 'react'
import { SoundContext } from '../context/soundContextValue'

export const useSound = () => useContext(SoundContext)
