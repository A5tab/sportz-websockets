import { createContext, useEffect, useRef } from "react";
import { getWsUrl } from "../utils/ws";
import { useSocketEvents } from "../hooks/useSocketEvent";

type WebContextType = {
    wsRef: React.RefObject<WebSocket | null>;
};

export const WebSocketContext = createContext<WebContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        wsRef.current = new WebSocket(getWsUrl())

        wsRef.current.onopen = () => console.log("WS Connected")
        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data)

            useSocketEvents(wsRef)
        }
        wsRef.current.onclose = () => console.log("WS Closed")

        return () => wsRef.current?.close()

    }, [])

    
    return (
        <WebSocketContext.Provider value={{ wsRef }}>
            {children}
        </WebSocketContext.Provider>
    );
};