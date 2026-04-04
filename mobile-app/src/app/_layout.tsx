import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../context/AuthContext'
import { MatchesProvider } from '../context/MatchesContext'
const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MatchesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/signup" />
            <Stack.Screen name="(protected)/Dashboard" />
          </Stack>
        </MatchesProvider>
      </AuthProvider>
    </SafeAreaProvider >
  )
}

export default RootLayout