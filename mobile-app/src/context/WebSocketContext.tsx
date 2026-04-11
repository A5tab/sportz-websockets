import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getWsUrl } from "../utils/ws";
import { useAuth } from "../hooks/useAuth";
import { WsIncoming } from "../types/socket";

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

type WebSocketContextType = {
    wsRef: React.RefObject<WebSocket | null>
    connectionStatus: ConnectionStatus
    addMessageListener: (listener: WebSocketListener) => () => void
    sendWs: (message: WsIncoming) => void
}
type ProviderProps = {
    children: React.ReactNode
}

type WebSocketListener = (message: WsIncoming) => void

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketContextProvider = ({ children }: ProviderProps) => {
    const wsRef = useRef<WebSocket | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
    const listenersRef = useRef<WebSocketListener[]>([])
    const { auth } = useAuth()

    const addMessageListener = useCallback((cb: WebSocketListener) => {
        if (listenersRef.current.includes(cb)) return () => {}
        listenersRef.current.push(cb)

        return () => {
            listenersRef.current = listenersRef.current.filter(l => l !== cb)
        }
    }, [])

    const sendWs = useCallback((payload: WsIncoming) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState != WebSocket.OPEN) return;
        ws.send(JSON.stringify(payload))
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
            try {
                const parsed: WsIncoming = JSON.parse(event.data);
                listenersRef.current.forEach((listener) => listener(parsed))
            } catch (error) {
                console.error('Failed to parse websocket message', error)
            }

        }

        ws.onclose = () => {
            setConnectionStatus('disconnected')
        }
        ws.onerror = (error) => {
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close();
            wsRef.current = null;
            setConnectionStatus('disconnected')
        }
    }, [auth.accessToken])

    const value = useMemo(() =>
    (
        {
            wsRef,
            connectionStatus,
            sendWs,
            addMessageListener
        }
    )
        , [
            connectionStatus,
            sendWs,
            addMessageListener
        ])
    return <WebSocketContext.Provider value={value}>
        {children}
    </WebSocketContext.Provider>
}
