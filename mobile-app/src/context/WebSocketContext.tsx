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
    sendWs: (payload: Record<string, unknown>) => void
    addMessageListener: (listener: WsMessageListener) => () => void
}

type ProviderProps = {
    children: ReactNode
}

export const WebSocketContext = createContext<WebContextType | null>(null)

export const WebSocketProvider = ({ children }: ProviderProps) => {
    const { auth } = useAuth()
    const wsRef = useRef<WebSocket | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
    const listeners = useRef<((msg: WsIncoming) => void)[]>([])

    const sendWs = useCallback((payload: Record<string, unknown>) => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify(payload))
    }, [])

    const addMessageListener = useCallback((cb: WsMessageListener) => {
        listeners.current.push(cb)

        return () => {
            listeners.current = listeners.current.filter(l => l !== cb)
        }
    }, [])

    useEffect(() => {
        if (!auth.accessToken) {
            wsRef.current?.close()
            wsRef.current = null
            setConnectionStatus('disconnected')
            return
        }

        setConnectionStatus('connecting')
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
            setConnectionStatus('connected')
        }

        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data)
            listeners.current.forEach((cb) => cb(parsed))
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
            sendWs,
            addMessageListener,
        }),
        [connectionStatus, sendWs, addMessageListener]
    )

    return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>
}