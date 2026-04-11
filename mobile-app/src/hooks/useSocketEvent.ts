import type { SocketEventMap, WsIncoming } from '../types/socket'
import { useSocket } from './useSocket'
import { useEffect } from 'react'

type Handlers = {
    [K in keyof SocketEventMap]?: (message: {
        type: K
        data: SocketEventMap[K]
    }) => void
}

export const useSocketEvent = (handlers: Handlers) => {
    const { addMessageListener } = useSocket()

    useEffect(() => {
        const unsubscribe = addMessageListener((message: WsIncoming) => {
            handlers[message.type]?.(message as any)
        })

        return unsubscribe
    }, [addMessageListener, handlers])
}