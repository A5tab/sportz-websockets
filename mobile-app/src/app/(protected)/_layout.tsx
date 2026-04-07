import React from 'react'
import { Stack } from 'expo-router'
import Protected from '../../components/auth/Protected'
const ProtectedLayout = () => {
  return (<Protected>
    <Stack >
      <Stack.Screen name='Dashboard'/>
      <Stack.Screen name='[matchId]' options={{ title: 'Match Detail' }} />
    </Stack>
  </Protected>
  )
}

export default ProtectedLayout
