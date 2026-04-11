import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useSocketEvent } from '../hooks/useSocketEvent'
import { useCommentary } from '../hooks/useCommentary'
import { CommentaryItem } from './CommentaryContext'

export type Match = {
    id: number
    sport: string
    homeTeam: string
    awayTeam: string
    status: 'scheduled' | 'live' | 'finished'
    startTime: string
    endTime: string | null
    homeScore: number
    awayScore: number
    createdAt: string
    updatedAt?: string
}

type ApiListResponse<T> = {
    data?: T
}

type MatchesContextType = {
    matches: Match[]
    addMatch: (match: Match) => void
    subscribedMatchIds: number[]
    subscribeToMatch: (matchId: number) => void
    unsubscribeFromMatch: (matchId: number) => void
    toggleMatchSubscription: (matchId: number) => void
    isMatchSubscribed: (matchId: number) => boolean
    refreshMatches: () => Promise<void>
}

type ProviderProps = {
    children: ReactNode
}

export const MatchesContext = createContext<MatchesContextType | null>(null)


export const MatchesProvider = ({ children }: ProviderProps) => {
    const api = useApi()
    const { auth } = useAuth()
    const { sendWs } = useSocket()
    const [matches, setMatches] = useState<Match[]>([])
    const [subscribedMatchIds, setSubscribedMatchIds] = useState<number[]>([])
    const { addCommentary } = useCommentary()

    const addMatch = useCallback((match: Match) => {
        setMatches((prev) => {
            if (prev.some((item) => item.id === match.id)) return prev
            return [match, ...prev]
        })
    }, [])

    const refreshMatches = useCallback(async () => {
        if (!auth.accessToken) return

        const response = await api.get<ApiListResponse<Match[]>>('/matches')
        const newMatches = Array.isArray(response.data?.data) ? response.data.data : []
        setMatches(newMatches)
    }, [api, auth.accessToken])

    const handleCommentaryCreated = useCallback(
        (message: { type: 'match.commentary'; data: CommentaryItem }) => {
            if (!auth.accessToken || !message.data) return
            addCommentary(message.data)
        },
        [addCommentary, auth.accessToken]
    )

    useSocketEvent({
        'match.commentary': handleCommentaryCreated,
    })

    useEffect(() => {
        if (!auth.accessToken) {
            setMatches([])
            setSubscribedMatchIds([])
            return
        }

        void refreshMatches().catch((error) => {
            console.error('Failed to fetch matches', error)
        })
    }, [auth.accessToken, refreshMatches])

    const subscribeToMatch = useCallback((matchId: number) => {
        setSubscribedMatchIds((prev) => {
            if (prev.includes(matchId)) return prev
            return [...prev, matchId]
        })

        sendWs({ type: 'subscribe', matchId })
    }, [sendWs])

    const unsubscribeFromMatch = useCallback((matchId: number) => {
        setSubscribedMatchIds((prev) => prev.filter((id) => id !== matchId))
        sendWs({ type: 'unsubscribe', matchId })
    }, [sendWs])

    const toggleMatchSubscription = useCallback(
        (matchId: number) => {
            if (subscribedMatchIds.includes(matchId)) {
                unsubscribeFromMatch(matchId)
                return
            }

            subscribeToMatch(matchId)
        },
        [subscribedMatchIds, subscribeToMatch, unsubscribeFromMatch]
    )

    const isMatchSubscribed = useCallback(
        (matchId: number) => subscribedMatchIds.includes(matchId),
        [subscribedMatchIds]
    )

    const value = useMemo(
        () => ({
            matches,
            subscribedMatchIds,
            subscribeToMatch,
            unsubscribeFromMatch,
            toggleMatchSubscription,
            isMatchSubscribed,
            refreshMatches,
            addMatch,
        }),
        [
            isMatchSubscribed,
            matches,
            addMatch,
            refreshMatches,
            subscribeToMatch,
            subscribedMatchIds,
            toggleMatchSubscription,
            unsubscribeFromMatch,
        ]
    )

    return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>
}
