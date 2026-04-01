import { ActivityIndicator, useColorScheme } from 'react-native'
import React from 'react'
import { getTheme } from '../constants/Colors'

const ThemedLoader = () => {
    const theme = getTheme(useColorScheme() ?? "light" )
  return (
    <ActivityIndicator size={'large'} color={theme.text}></ActivityIndicator>
  )
}

export default ThemedLoader