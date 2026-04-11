import type { Match } from '../context/MatchesContext'
import type { CommentaryItem } from '../context/CommentaryContext'

export type SocketEventMap = {
    'match.created': Match
    'match.commentary': CommentaryItem
}

export type WsIncoming = {
    [K in keyof SocketEventMap]: {
        type: K
        data: SocketEventMap[K]
    }
}[keyof SocketEventMap]