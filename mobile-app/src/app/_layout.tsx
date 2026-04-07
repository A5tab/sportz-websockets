import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../context/AuthContext'
import { WebSocketProvider } from '../context/WebSocketContext'
import { ScoreProvider } from '../context/ScoreContext'
import { MatchesProvider } from '../context/MatchesContext'
import { CommentaryProvider } from '../context/CommentaryContext'
const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WebSocketProvider>
          <MatchesProvider>
            <ScoreProvider>
              <CommentaryProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)/login" />
                  <Stack.Screen name="(auth)/signup" />
                  <Stack.Screen name="(protected)/Dashboard" />
                </Stack>
              </CommentaryProvider>
            </ScoreProvider>
          </MatchesProvider>
        </WebSocketProvider>
      </AuthProvider>
    </SafeAreaProvider >
  )
}

export default RootLayout