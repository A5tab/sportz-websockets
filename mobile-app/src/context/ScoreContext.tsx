import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getWsUrl } from '../utils/ws'
import { useAuth } from '../hooks/useAuth'

type ScoreContextType = {
    subscribedMatchIds: number[]
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
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

    const wsRef = useRef<WebSocket | null>(null)
    const [subscribedMatchIds, setSubscribedMatchIds] = useState<number[]>([])
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
        'disconnected'
    )

    const sendWs = useCallback((payload: Record<string, unknown>) => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify(payload))
    }, [])

    const subscribeToMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => {
                if (prev.includes(matchId)) return prev
                return [...prev, matchId]
            })

            sendWs({ type: 'subscribe', matchId })
        },
        [sendWs]
    )

    const unsubscribeFromMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => prev.filter((id) => id !== matchId))
            sendWs({ type: 'unsubscribe', matchId })
        },
        [sendWs]
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

    useEffect(() => {
        if (!auth.accessToken) {
            setSubscribedMatchIds([])
            setConnectionStatus('disconnected')
            wsRef.current?.close()
            wsRef.current = null
            return
        }

        setConnectionStatus('connecting')
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
            setConnectionStatus('connected')
            subscribedMatchIds.forEach((matchId) => {
                ws.send(JSON.stringify({ type: 'subscribe', matchId }))
            })
        }

        ws.onerror = () => {
            setConnectionStatus('disconnected')
        }

        ws.onclose = () => {
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close()
            wsRef.current = null
        }
    }, [auth.accessToken, subscribedMatchIds])

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


