import { useContext } from 'react'
import { MatchesContext } from '../context/MatchesContext'

export const useMatches = () => {
    const matchesContext = useContext(MatchesContext)

    if (!matchesContext) {
        throw new Error('useMatches must be used within MatchesContext provider')
    }

    return matchesContext
}
