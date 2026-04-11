import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useSocketEvent } from '../hooks/useSocketEvent'

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

type CommentaryContextType = {
    commentaryByMatchId: Record<number, CommentaryItem[]>
    addCommentary: (commentary: CommentaryItem) => void
    fetchCommentaryForMatch: (matchId: number, limit?: number) => Promise<void>
}

type ProviderProps = {
    children: ReactNode
}

export const CommentaryContext = createContext<CommentaryContextType | null>(null)

export const CommentaryProvider = ({ children }: ProviderProps) => {
    const api = useApi()
    const { auth } = useAuth()
    const [commentaryByMatchId, setCommentaryByMatchId] = useState<Record<number, CommentaryItem[]>>({})

    const addCommentary = useCallback((commentary: CommentaryItem) => {
        setCommentaryByMatchId((prev) => {
            const current = prev[commentary.matchId] ?? []
            if (current.some((item) => item.id === commentary.id)) return prev

            return {
                ...prev,
                [commentary.matchId]: [commentary, ...current],
            }
        })
    }, [])

    const fetchCommentaryForMatch = useCallback(
        async (matchId: number, limit = 50) => {
            if (!auth.accessToken) return

            try {
                const response = await api.get<{ data?: CommentaryItem[] }>(`/matches/${matchId}/commentary`, {
                    params: { limit },
                })

                const list = Array.isArray(response.data?.data) ? response.data.data : []
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

    const handleCommentaryCreated = useCallback(
        (message: { type: 'match.commentary'; data: CommentaryItem }) => {
            if (!auth.accessToken || !message.data) return
            addCommentary(message.data)
        },
        [addCommentary, auth.accessToken]
    )

    useSocketEvent({
        'match.commentary': handleCommentaryCreated,
    })

    useEffect(() => {
        if (!auth.accessToken) {
            setCommentaryByMatchId({})
        }
    }, [auth.accessToken])

    const value = useMemo(
        () => ({
            commentaryByMatchId,
            addCommentary,
            fetchCommentaryForMatch,
        }),
        [commentaryByMatchId, addCommentary, fetchCommentaryForMatch]
    )

    return <CommentaryContext.Provider value={value}>{children}</CommentaryContext.Provider>
}
