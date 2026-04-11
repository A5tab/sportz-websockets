import { useEffect } from 'react'
import { useSocket } from './useSocket'
import type { SocketEventMap, WsIncoming } from '../types/socket'

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
            const handler = handlers[message.type as keyof SocketEventMap]

            if (handler) {
                handler(message as any) // safe internal bridge due to ts implementations
            }
        })

        return unsubscribe
    }, [addMessageListener, handlers])
}