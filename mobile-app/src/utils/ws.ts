// Utility to get the WebSocket URL for the backend
import { BASE_URL } from '../api/axios'

export function getWsUrl(): string {
    const configured = process.env.EXPO_PUBLIC_WS_BASE_URL
    if (configured) {
        return configured.endsWith('/ws') ? configured : `${configured.replace(/\/$/, '')}/ws`
    }
    const fromApi = BASE_URL.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
    return `${fromApi.replace(/\/$/, '')}/ws`
}

