import { useEffect } from "react"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { apiPrivate } from "../api/axios"
import { useAuth } from "./useAuth"

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

                    setAuth((prev) => ({
                        ...prev,
                        isLoggedIn: false,
                        accessToken: "",
                        data: {}
                    }))
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