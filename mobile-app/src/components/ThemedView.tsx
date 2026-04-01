import React from 'react'
import { View, useColorScheme, ViewProps } from 'react-native'
import { getTheme } from "../constants/Colors"

interface ThemedViewProps extends ViewProps {
    children: React.ReactNode
}
const ThemedView = ({ children, style = '', ...props }: ThemedViewProps) => {
    const theme = getTheme(useColorScheme() ?? 'light')

    return (
        <View style={[{ backgroundColor: theme.background }, style]} {...props}>
            {children}
        </View>
    )
}

export default ThemedView
