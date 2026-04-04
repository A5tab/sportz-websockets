import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { AxiosInstance } from 'axios'
import { BASE_URL } from '../api/axios'
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

type MatchesContextType = {
    matches: Match[]
    subscribedMatchIds: number[]
    commentaryByMatchId: Record<number, CommentaryItem[]>
    connectionStatus: 'connecting' | 'connected' | 'disconnected'
    subscribeToMatch: (matchId: number) => void
    unsubscribeFromMatch: (matchId: number) => void
    toggleMatchSubscription: (matchId: number) => void
    refreshMatches: () => Promise<void>
}

type ProviderProps = {
    children: ReactNode
}

type ApiListResponse<T> = {
    data?: T
}

type WsIncoming = {
    type: string
    matchId?: number
    data?: unknown
}

export const MatchesContext = createContext<MatchesContextType | null>(null)

const getWsUrl = () => {
    const configured = process.env.EXPO_PUBLIC_WS_BASE_URL
    if (configured) {
        return configured.endsWith('/ws') ? configured : `${configured.replace(/\/$/, '')}/ws`
    }

    const fromApi = BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
    return `${fromApi.replace(/\/$/, '')}/ws`
}

const fetchCommentaryForMatch = async (api: AxiosInstance, matchId: number) => {
    const response = await api.get<ApiListResponse<CommentaryItem[]>>(`/matches/${matchId}/commentary`, {
        params: { limit: 20 },
    })

    return Array.isArray(response.data?.data) ? response.data.data : []
}

export const MatchesProvider = ({ children }: ProviderProps) => {
    const api = useApi()
    const { auth } = useAuth()

    const wsRef = useRef<WebSocket | null>(null)
    const [matches, setMatches] = useState<Match[]>([])
    const [subscribedMatchIds, setSubscribedMatchIds] = useState<number[]>([])
    const [commentaryByMatchId, setCommentaryByMatchId] = useState<Record<number, CommentaryItem[]>>({})
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
        'disconnected'
    )

    const sendWs = useCallback((payload: Record<string, unknown>) => {
        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify(payload))
    }, [])

    const refreshMatches = useCallback(async () => {
        if (!auth.accessToken) return

        const response = await api.get<ApiListResponse<Match[]>>('/matches')
        const nextMatches = Array.isArray(response.data?.data) ? response.data.data : []
        setMatches(nextMatches)
    }, [api, auth.accessToken])

    const hydrateCommentary = useCallback(
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

    const subscribeToMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => {
                if (prev.includes(matchId)) return prev
                return [...prev, matchId]
            })

            sendWs({ type: 'subscribe', matchId })
            void hydrateCommentary(matchId)
        },
        [hydrateCommentary, sendWs]
    )

    const unsubscribeFromMatch = useCallback(
        (matchId: number) => {
            setSubscribedMatchIds((prev) => prev.filter((id) => id !== matchId))
            sendWs({ type: 'unsubscribe', matchId })
        },
        [sendWs]
    )

    const toggleMatchSubscription = useCallback(
        (matchId: number) => {
            if (subscribedMatchIds.includes(matchId)) {
                unsubscribeFromMatch(matchId)
                return
            }

            subscribeToMatch(matchId)
        },
        [subscribedMatchIds, subscribeToMatch, unsubscribeFromMatch]
    )

    useEffect(() => {
        if (!auth.accessToken) {
            setMatches([])
            setSubscribedMatchIds([])
            setCommentaryByMatchId({})
            setConnectionStatus('disconnected')
            wsRef.current?.close()
            wsRef.current = null
            return
        }

        void refreshMatches().catch((error) => {
            console.error('Failed to fetch matches', error)
        })

        setConnectionStatus('connecting')
        const ws = new WebSocket(getWsUrl())
        wsRef.current = ws

        ws.onopen = () => {
            setConnectionStatus('connected')
            subscribedMatchIds.forEach((matchId) => {
                ws.send(JSON.stringify({ type: 'subscribe', matchId }))
            })
        }

        ws.onmessage = (event) => {
            try {
                const message: WsIncoming = JSON.parse(event.data as string)
                if (message.type === 'match.created' && message.data) {
                    const created = message.data as Match
                    setMatches((prev) => {
                        if (prev.some((item) => item.id === created.id)) return prev
                        return [created, ...prev]
                    })
                    return
                }

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

        ws.onerror = () => {
            setConnectionStatus('disconnected')
        }

        ws.onclose = () => {
            setConnectionStatus('disconnected')
        }

        return () => {
            ws.close()
            wsRef.current = null
        }
    }, [auth.accessToken, refreshMatches, subscribedMatchIds])

    const value = useMemo(
        () => ({
            matches,
            subscribedMatchIds,
            commentaryByMatchId,
            connectionStatus,
            subscribeToMatch,
            unsubscribeFromMatch,
            toggleMatchSubscription,
            refreshMatches,
        }),
        [
            commentaryByMatchId,
            connectionStatus,
            matches,
            refreshMatches,
            subscribeToMatch,
            subscribedMatchIds,
            toggleMatchSubscription,
            unsubscribeFromMatch,
        ]
    )

    return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>
}