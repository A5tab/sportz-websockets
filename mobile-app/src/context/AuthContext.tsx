import { createContext, ReactNode, useEffect, useState } from 'react'
import { deleteRefreshToken, getRefreshToken, saveRefreshToken } from '../utils/token-storage'
import { refreshRequest } from '../services/auth.service'
import type { AuthUser } from '../services/auth.service'

type AuthState = {
    isLoggedIn: boolean
    data: AuthUser | null
    loading: boolean
    accessToken: string
}

type AuthProviderProps = {
    children: ReactNode
}

type AuthContextType = {
    auth: AuthState
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>
}

export const AuthContext = createContext<AuthContextType | null>(null)


export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState<AuthState>({
        isLoggedIn: false,
        data: null,
        loading: true,
        accessToken: ""
    })

    useEffect(() => {
        let isMounted = true

        const bootstrapAuth = async () => {
            const refreshToken = await getRefreshToken()

            if (!refreshToken) {
                if (isMounted) {
                    setAuth({
                        isLoggedIn: false,
                        data: null,
                        loading: false,
                        accessToken: '',
                    })
                }
                return
            }

            try {
                const session = await refreshRequest(refreshToken)

                await saveRefreshToken(session.refreshToken)

                if (isMounted) {
                    setAuth({
                        isLoggedIn: true,
                        data: session.user,
                        loading: false,
                        accessToken: session.accessToken,
                    })
                }
            } catch {
                await deleteRefreshToken()

                if (isMounted) {
                    setAuth({
                        isLoggedIn: false,
                        data: null,
                        loading: false,
                        accessToken: '',
                    })
                }
            }
        }

        void bootstrapAuth()

        return () => {
            isMounted = false
        }
    }, [])



    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}
