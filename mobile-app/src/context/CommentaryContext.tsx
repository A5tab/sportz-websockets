import { AxiosInstance } from 'axios'
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
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
    const { addMessageListener } = useSocket()
    const scoreContext = useContext(ScoreContext)

    if (!scoreContext) {
        throw new Error('CommentaryProvider must be used inside ScoreProvider')
    }

    const { subscribedMatchIds } = scoreContext

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
            prevSubscribedRef.current = []
            setCommentaryByMatchId({})
        }
    }, [auth.accessToken])

    useEffect(() => {
        if (!auth.accessToken) return

        const unsubscribe = addMessageListener((message: WsIncoming) => {
            if (message.type !== 'match.commentary' || !message.data) return

            const item = message.data as CommentaryItem
            setCommentaryByMatchId((prev) => {
                const current = prev[item.matchId] ?? []
                if (current.some((existing) => existing.id === item.id)) return prev

                return {
                    ...prev,
                    [item.matchId]: [item, ...current],
                }
            })
        })

        return unsubscribe
    }, [addMessageListener, auth.accessToken])

    useEffect(() => {
        if (!auth.accessToken) return

        const previous = prevSubscribedRef.current
        const added = subscribedMatchIds.filter((id) => !previous.includes(id))

        added.forEach((matchId) => {
            void refreshCommentaryForMatch(matchId)
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
