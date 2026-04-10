import { SocketEventMap } from '../types/socket'
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
        const unsubscribe = addMessageListener((message) => {
            const handler = handlers[message.type as keyof SocketEventMap]

            if (handler) {
                handler(message as any)
            }
        })

        return unsubscribe
    }, [addMessageListener, handlers])
}