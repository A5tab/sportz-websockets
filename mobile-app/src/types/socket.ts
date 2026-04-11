import type { Match } from '../context/MatchesContext'
import type { CommentaryItem } from '../context/CommentaryContext'

export type SocketEventMap = {
    'match.created': Match
    'match.commentary': CommentaryItem
}

export type SocketOutgoingMap = {
    'match.subscribe': { matchId: number }
    'match.unsubscribe': { matchId: number }
}

export type WsIncoming = {
    [K in keyof SocketEventMap]: {
        type: K
        data: SocketEventMap[K]
    }
}[keyof SocketEventMap]

export type WsOutgoing = {
    [K in keyof SocketOutgoingMap]: {
        type: K
    } & SocketOutgoingMap[K]
}[keyof SocketOutgoingMap]