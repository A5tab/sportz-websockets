import {Match} from "../context/MatchesContext"
import {CommentaryItem} from "../context/CommentaryContext"

export type SocketEventType = 'match.created' | "commentary.created"

export type SocketEventMap = {
    'match.created': Match
    'match.commentary': CommentaryItem
}

export type SocketMessage<K extends keyof SocketEventMap> = {
  type: K
  data: SocketEventMap[K]
}