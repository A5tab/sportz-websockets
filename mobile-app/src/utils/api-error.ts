import type { AxiosError } from 'axios'

type ApiErrorBody = {
    message?: string
    details?: unknown
}

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.') => {
    const axiosError = error as AxiosError<ApiErrorBody> | undefined
    const data = axiosError?.response?.data

    if (typeof data?.message === 'string' && data.message.trim()) {
        return data.message
    }

    if (typeof axiosError?.message === 'string' && axiosError.message.trim()) {
        return axiosError.message
    }

    return fallback
}