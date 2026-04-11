import { useEffect } from "react"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { apiPrivate } from "../api/axios"
import { useAuth } from "./useAuth"
import { deleteRefreshToken, getRefreshToken, saveRefreshToken } from "../utils/token-storage"
import { refreshRequest } from "../services/auth.service"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean
}

export const useApi = () => {
    const { auth, setAuth } = useAuth()

    useEffect(() => {
        const requestInterceptor = apiPrivate.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                if (auth.accessToken) {
                    config.headers.Authorization = `Bearer ${auth.accessToken}`
                }

                return config
            },
            (error: AxiosError) => Promise.reject(error)
        )

        const responseInterceptor = apiPrivate.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as RetryableRequestConfig | undefined

                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true

                    const refreshToken = await getRefreshToken()

                    if (!refreshToken) {
                        await deleteRefreshToken()
                        setAuth((prev) => ({
                            ...prev,
                            isLoggedIn: false,
                            accessToken: '',
                            data: null,
                            loading: false,
                        }))
                        return Promise.reject(error)
                    }

                    try {
                        const session = await refreshRequest(refreshToken)
                        await saveRefreshToken(session.refreshToken)

                        setAuth((prev) => ({
                            ...prev,
                            isLoggedIn: true,
                            accessToken: session.accessToken,
                            data: session.user,
                            loading: false,
                        }))

                        originalRequest.headers = originalRequest.headers ?? {}
                        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`
                        return apiPrivate(originalRequest)
                    } catch {
                        await deleteRefreshToken()
                        setAuth((prev) => ({
                            ...prev,
                            isLoggedIn: false,
                            accessToken: '',
                            data: null,
                            loading: false,
                        }))
                    }
                }

                return Promise.reject(error)
            }
        )

        return () => {
            apiPrivate.interceptors.request.eject(requestInterceptor)
            apiPrivate.interceptors.response.eject(responseInterceptor)
        }
    }, [auth.accessToken, setAuth])

    return apiPrivate
}