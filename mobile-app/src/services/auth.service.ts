import api from '../api/axios'
import { getApiErrorMessage } from '../utils/api-error'

export type AuthUser = {
    id: number
    username: string
    email: string
    role?: string
    avatar?: string | null
    bio?: string | null
}

export type AuthPayload = {
    user: AuthUser
    accessToken: string
    refreshToken: string
}

type ApiEnvelope<T> = {
    data?: T
}

const unwrapAuthPayload = <T,>(response: ApiEnvelope<T>) => response.data as T

export const loginRequest = async (payload: { email?: string; username?: string; password: string }) => {
    try {
        const response = await api.post<ApiEnvelope<AuthPayload>>('/auth/login', payload)
        return unwrapAuthPayload(response.data)
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Login failed. Please try again.'))
    }
}

export const registerRequest = async (formData: FormData) => {
    try {
        const response = await api.post<ApiEnvelope<AuthPayload>>('/auth/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        return unwrapAuthPayload(response.data)
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Signup failed. Please try again.'))
    }
}

export const refreshRequest = async (refreshToken: string) => {
    try {
        const response = await api.post<ApiEnvelope<AuthPayload>>('/auth/refresh', { refreshToken })
        return unwrapAuthPayload(response.data)
    } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Session refresh failed.'))
    }
}