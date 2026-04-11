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
            switch (message.type) {
                case 'match.created':
                    handlers['match.created']?.(message)
                    break
                case 'match.commentary':
                    handlers['match.commentary']?.(message)
                    break
            }
        })

        return unsubscribe
    }, [addMessageListener, handlers])
}