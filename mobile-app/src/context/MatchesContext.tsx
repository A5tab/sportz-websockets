import { createContext, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getWsUrl } from '../utils/ws'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'

export type Match = {
    id: number
    sport: string
    homeTeam: string
    awayTeam: string
    status: 'scheduled' | 'live' | 'finished'
    startTime: string
    endTime: string | null
    homeScore: number
    awayScore: number
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

type MatchesContextType = {
    matches: Match[]
    refreshMatches: () => Promise<void>
}

type ProviderProps = {
    children: ReactNode
}

export const MatchesContext = createContext<MatchesContextType | null>(null)


export const MatchesProvider = ({ children }: ProviderProps) => {
    const api = useApi()
    const { auth } = useAuth()
    const wsRef = useRef<WebSocket | null>(null)
    const [matches, setMatches] = useState<Match[]>([])

    const refreshMatches = useCallback(async () => {
        if (!auth.accessToken) return

        const response = await api.get<ApiListResponse<Match[]>>('/matches')
        const newMatches = Array.isArray(response.data?.data) ? response.data.data : []
        setMatches(newMatches)
    }, [api, auth.accessToken])

    useEffect(() => {
        if (!auth.accessToken) {
            setMatches([])
            wsRef.current?.close()
            wsRef.current = null
            return
        }

        void refreshMatches().catch((error) => {
            console.error('Failed to fetch matches', error)
        })

        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onmessage = (event) => {
            try {
                const message: WsIncoming = JSON.parse(event.data as string)
                if (message.type === 'match.created' && message.data) {
                    const created = message.data as Match
                    setMatches((prev) => {
                        if (prev.some((item) => item.id === created.id)) return prev
                        return [created, ...prev]
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
    }, [auth.accessToken, refreshMatches])

    const value = useMemo(
        () => ({
            matches,
            refreshMatches,
        }),
        [matches, refreshMatches]
    )

    return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>
}
