import React, { ReactNode, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import ThemedText from '../ThemedText'
import { useRouter } from 'expo-router'

type ProtectedProps = {
  children: ReactNode
}

const Protected = ({ children }: ProtectedProps) => {
  const { auth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.isLoggedIn) {
      router.replace('/')
    }
  }, [auth.isLoggedIn, auth.loading, router])

  if (auth.loading) {
    return <ThemedText>Loading...</ThemedText>
  }

  if (!auth.isLoggedIn) {
    return null
  }

  return <>{children}</>
}

export default Protected