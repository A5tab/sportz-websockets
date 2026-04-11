import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { useSocketEvent } from '../hooks/useSocketEvent'

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
    const { sendWs, connectionStatus } = useSocket()
    const [matches, setMatches] = useState<Match[]>([])
    const [subscribedMatchIds, setSubscribedMatchIds] = useState<number[]>([])

    const addMatch = useCallback((match: Match) => {
        setMatches((prev) => {
            if (prev.some((item) => item.id === match.id)) return prev
            return [match, ...prev]
        })
    }, [])

    const handleMatchCreated = useCallback(
        (message: { type: 'match.created'; data: Match }) => {
            if (!message.data) return
            addMatch(message.data)
        },
        [addMatch]
    )

    useSocketEvent(
        useMemo(
            () => ({
                'match.created': handleMatchCreated,
            }),
            [handleMatchCreated]
        )
    )

    const refreshMatches = useCallback(async () => {
        if (!auth.accessToken) return

        const response = await api.get<ApiListResponse<Match[]>>('/matches')
        const newMatches = Array.isArray(response.data?.data) ? response.data.data : []
        setMatches(newMatches)
    }, [api, auth.accessToken])

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

    useEffect(() => {
        if (!auth.accessToken || connectionStatus !== 'connected') return

        subscribedMatchIds.forEach((matchId) => {
            sendWs({ type: 'match.subscribe', matchId })
        })
    }, [auth.accessToken, connectionStatus, sendWs, subscribedMatchIds])

    const subscribeToMatch = useCallback((matchId: number) => {
        setSubscribedMatchIds((prev) => {
            if (prev.includes(matchId)) return prev
            return [...prev, matchId]
        })

        sendWs({
            type: 'match.subscribe',
            matchId
        })
    }, [sendWs])

    const unsubscribeFromMatch = useCallback((matchId: number) => {
        setSubscribedMatchIds((prev) => prev.filter((id) => id !== matchId))
        sendWs({
            type: 'match.unsubscribe',
            matchId
        })
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
