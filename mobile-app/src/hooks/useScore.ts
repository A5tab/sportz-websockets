import { useContext } from 'react'
import { ScoreContext } from '../context/ScoreContext'

export const useScore = () => {
    const scoreContext = useContext(ScoreContext)

    const handleScoreUpdate = () => {
        
    }
    if (!scoreContext) {
        throw new Error('Component must be wrapped inside ScoreContext provider')
    }

    return scoreContext
}
