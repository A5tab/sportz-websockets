import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'

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
}

type ProviderProps = {
    children: ReactNode
}

export const CommentaryContext = createContext<CommentaryContextType | null>(null)

export const CommentaryProvider = ({ children }: ProviderProps) => {
    const { auth } = useAuth()
    const { addMessageListener } = useSocket()
    const [commentaryByMatchId, setCommentaryByMatchId] = useState<Record<number, CommentaryItem[]>>({})

    const addCommentary = useCallback((commentary: CommentaryItem) => {
        setCommentaryByMatchId((prev) => {
            const current = prev[commentary.matchId] ?? []

            return {
                ...prev,
                [commentary.matchId]: [commentary, ...current],
            }
        })
    }, [])

    useEffect(() => {
        if (!auth.accessToken) {
            setCommentaryByMatchId({})
            return
        }

        const unsubscribe = addMessageListener((message) => {
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
        })

        return unsubscribe
    }, [addMessageListener, auth.accessToken])

    const value = useMemo(
        () => ({
            commentaryByMatchId,
            addCommentary,
        }),
        [commentaryByMatchId, addCommentary]
    )

    return <CommentaryContext.Provider value={value}>{children}</CommentaryContext.Provider>
}
