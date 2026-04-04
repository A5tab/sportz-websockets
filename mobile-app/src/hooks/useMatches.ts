import { useContext } from 'react'
import { MatchesContext } from '../context/MatchesContext'

export const useMatches = () => {
    const matchesContext = useContext(MatchesContext)

    if (!matchesContext) {
        throw new Error('Component must be wrapped inside MatchesContext provider')
    }

    return matchesContext
}
