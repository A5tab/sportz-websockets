import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getWsUrl } from '../utils/ws'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

type WsIncoming = {
    type: string
    data?: unknown
}

type WsMessageListener = (message: WsIncoming) => void

type WebContextType = {
    wsRef: React.RefObject<WebSocket | null>
    connectionStatus: ConnectionStatus
    send: (payload: Record<string, unknown>) => void
    subscribeToMatch: (matchId: number) => void
    unsubscribeFromMatch: (matchId: number) => void
    addMessageListener: (listener: WsMessageListener) => () => void
}

type ProviderProps = {
    children: ReactNode
}

export const WebSocketContext = createContext<WebContextType | null>(null)

export const WebSocketProvider = ({ children }: ProviderProps) => {
    const { auth } = useAuth()
    const wsRef = useRef<WebSocket | null>(null)
    const listenersRef = useRef<Set<WsMessageListener>>(new Set())
    const activeSubscriptionsRef = useRef<Set<number>>(new Set())
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

    const send = useCallback((payload: Record<string, unknown>) => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify(payload))
    }, [])

    const subscribeToMatch = useCallback(
        (matchId: number) => {
            activeSubscriptionsRef.current.add(matchId)
            send({ type: 'subscribe', matchId })
        },
        [send]
    )

    const unsubscribeFromMatch = useCallback(
        (matchId: number) => {
            activeSubscriptionsRef.current.delete(matchId)
            send({ type: 'unsubscribe', matchId })
        },
        [send]
    )

    const addMessageListener = useCallback((listener: WsMessageListener) => {
        listenersRef.current.add(listener)

        return () => {
            listenersRef.current.delete(listener)
        }
    }, [])

    useEffect(() => {
        if (!auth.accessToken) {
            wsRef.current?.close()
            wsRef.current = null
            activeSubscriptionsRef.current.clear()
            setConnectionStatus('disconnected')
            return
        }

        setConnectionStatus('connecting')
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
            setConnectionStatus('connected')

            activeSubscriptionsRef.current.forEach((matchId) => {
                ws.send(JSON.stringify({ type: 'subscribe', matchId }))
            })
        }

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data as string) as WsIncoming
                listenersRef.current.forEach((listener) => {
                    listener(message)
                })
            } catch (error) {
                console.error('Failed to parse websocket message', error)
            }
        }

        ws.onclose = () => {
            setConnectionStatus('disconnected')
        }

        ws.onerror = () => {
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close()
            wsRef.current = null
            setConnectionStatus('disconnected')
        }
    }, [auth.accessToken])

    const value = useMemo(
        () => ({
            wsRef,
            connectionStatus,
            send,
            subscribeToMatch,
            unsubscribeFromMatch,
            addMessageListener,
        }),
        [addMessageListener, connectionStatus, send, subscribeToMatch, unsubscribeFromMatch]
    )

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}