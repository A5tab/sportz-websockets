import { createContext, ReactNode, useState } from 'react'

type AuthState = {
    isLoggedIn: boolean
    data: any
    loading: boolean
}

type AuthProviderProps = {
    children: ReactNode
}

type AuthContextType = {
    auth: AuthState
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuth] = useState<AuthState>({
        isLoggedIn: false,
        data: {},
        loading: false
    })

return (
    <AuthContext.Provider value={{ auth, setAuth }}>
        {children}
    </AuthContext.Provider>
)
}
