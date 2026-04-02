import React from 'react'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="(protected)/Dashboard" />
      </Stack>
    </SafeAreaProvider >
  )
}

export default RootLayout