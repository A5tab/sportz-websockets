import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

type ScoreContextType = {
    subscribedMatchIds: number[]
    connectionStatus: ConnectionStatus
    subscribeToMatch: (matchId: number) => void
    unsubscribeFromMatch: (matchId: number) => void
    toggleMatchSubscription: (matchId: number) => void
}

type ProviderProps = {
    children: ReactNode
}

export const ScoreContext = createContext<ScoreContextType | null>(null)


export const ScoreProvider = ({ children }: ProviderProps) => {
    const { auth } = useAuth()
    const {
        connectionStatus,
        subscribeToMatch: subscribeMatchWs,
        unsubscribeFromMatch: unsubscribeMatchWs,
    } = useSocket()
    const previousSubscribedRef = useRef<number[]>([])
    const [subscribedMatchIds, setSubscribedMatchIds] = useState<number[]>([])

    useEffect(() => {
        if (!auth.accessToken) {
            previousSubscribedRef.current = []
            setSubscribedMatchIds([])
        }
    }, [auth.accessToken])

    useEffect(() => {
        const previous = previousSubscribedRef.current
        const added = subscribedMatchIds.filter((id) => !previous.includes(id))
        const removed = previous.filter((id) => !subscribedMatchIds.includes(id))

        added.forEach((matchId) => {
            subscribeMatchWs(matchId)
        })

        removed.forEach((matchId) => {
            unsubscribeMatchWs(matchId)
        })

        previousSubscribedRef.current = subscribedMatchIds
    }, [subscribeMatchWs, subscribedMatchIds, unsubscribeMatchWs])

    const subscribeToMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => {
                if (prev.includes(matchId)) return prev
                return [...prev, matchId]
            })
        },
        []
    )

    const unsubscribeFromMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => prev.filter((id) => id !== matchId))
        },
        []
    )

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

    const value = useMemo(
        () => ({
            subscribedMatchIds,
            connectionStatus,
            subscribeToMatch,
            unsubscribeFromMatch,
            toggleMatchSubscription,
        }),
        [
            connectionStatus,
            subscribeToMatch,
            subscribedMatchIds,
            toggleMatchSubscription,
            unsubscribeFromMatch,
        ]
    )

    return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>
}


