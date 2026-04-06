import { AxiosInstance } from 'axios'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getWsUrl } from '../utils/ws'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { ScoreContext } from './ScoreContext'

export type CommentaryItem = {
    id: number
    matchId: number
    minute: number | null
    sequence: number | null
    period: string | null
    eventType: string | null
    actor: string | null
    team: string | null
    message: string | null
    metadata: Record<string, unknown> | null
    tags: string[] | null
    createdAt: string
    updatedAt?: string
}

type ApiListResponse<T> = {
    data?: T
}

type WsIncoming = {
    type: string
    data?: unknown
}

type CommentaryContextType = {
    commentaryByMatchId: Record<number, CommentaryItem[]>
    getLatestCommentary: (matchId: number) => string
    refreshCommentaryForMatch: (matchId: number) => Promise<void>
}

type ProviderProps = {
    children: ReactNode
}

export const CommentaryContext = createContext<CommentaryContextType | null>(null)


const fetchCommentaryForMatch = async (api: AxiosInstance, matchId: number) => {
    const response = await api.get<ApiListResponse<CommentaryItem[]>>(`/matches/${matchId}/commentary`, {
        params: { limit: 20 },
    })

    return Array.isArray(response.data?.data) ? response.data.data : []
}

export const CommentaryProvider = ({ children }: ProviderProps) => {
    const api = useApi()
    const { auth } = useAuth()
    const scoreContext = useContext(ScoreContext)

    if (!scoreContext) {
        throw new Error('CommentaryProvider must be used inside ScoreProvider')
    }

    const { subscribedMatchIds } = scoreContext

    const wsRef = useRef<WebSocket | null>(null)
    const prevSubscribedRef = useRef<number[]>([])
    const [commentaryByMatchId, setCommentaryByMatchId] = useState<Record<number, CommentaryItem[]>>({})

    const refreshCommentaryForMatch = useCallback(
        async (matchId: number) => {
            if (!auth.accessToken) return

            try {
                const list = await fetchCommentaryForMatch(api, matchId)
                setCommentaryByMatchId((prev) => ({
                    ...prev,
                    [matchId]: list,
                }))
            } catch (error) {
                console.error('Failed to fetch commentary for match', matchId, error)
            }
        },
        [api, auth.accessToken]
    )

    const getLatestCommentary = useCallback(
        (matchId: number) => {
            const comments = commentaryByMatchId[matchId] ?? []
            return comments[0]?.message ?? 'No commentary yet for this match.'
        },
        [commentaryByMatchId]
    )

    useEffect(() => {
        if (!auth.accessToken) {
            wsRef.current?.close()
            wsRef.current = null
            prevSubscribedRef.current = []
            setCommentaryByMatchId({})
            return
        }

        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
            subscribedMatchIds.forEach((matchId) => {
                ws.send(JSON.stringify({ type: 'subscribe', matchId }))
            })
        }

        ws.onmessage = (event) => {
            try {
                const message: WsIncoming = JSON.parse(event.data as string)
                if (message.type === 'match.commentary' && message.data) {
                    const item = message.data as CommentaryItem
                    setCommentaryByMatchId((prev) => {
                        const current = prev[item.matchId] ?? []
                        if (current.some((existing) => existing.id === item.id)) return prev

                        return {
                            ...prev,
                            [item.matchId]: [item, ...current],
                        }
                    })
                }
            } catch (error) {
                console.error('Failed to parse websocket message', error)
            }
        }

        return () => {
            ws.close()
            wsRef.current = null
        }
    }, [auth.accessToken, subscribedMatchIds])

    useEffect(() => {
        if (!auth.accessToken) return

        const ws = wsRef.current
        const previous = prevSubscribedRef.current
        const added = subscribedMatchIds.filter((id) => !previous.includes(id))
        const removed = previous.filter((id) => !subscribedMatchIds.includes(id))

        added.forEach((matchId) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'subscribe', matchId }))
            }
            void refreshCommentaryForMatch(matchId)
        })

        removed.forEach((matchId) => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'unsubscribe', matchId }))
            }
        })

        prevSubscribedRef.current = subscribedMatchIds
    }, [auth.accessToken, refreshCommentaryForMatch, subscribedMatchIds])

    const value = useMemo(
        () => ({
            commentaryByMatchId,
            getLatestCommentary,
            refreshCommentaryForMatch,
        }),
        [commentaryByMatchId, getLatestCommentary, refreshCommentaryForMatch]
    )

    return <CommentaryContext.Provider value={value}>{children}</CommentaryContext.Provider>
}
