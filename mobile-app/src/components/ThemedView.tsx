import React from 'react'
import { useColorScheme, ViewProps, View } from 'react-native'
import { getTheme } from "../constants/Colors"
import { SafeAreaView } from 'react-native-safe-area-context'

interface ThemedViewProps extends ViewProps {
    safe?: boolean
}
const ThemedView = ({ children, style, safe = false, ...props }: ThemedViewProps) => {
    const theme = getTheme(useColorScheme() ?? 'light')

    return safe ? (
        <SafeAreaView style={[{ backgroundColor: theme.background }, style]} {...props}>
            {children}
        </SafeAreaView>
    ) : (
        <View style={[{ backgroundColor: theme.background }, style]} {...props}>
            {children}
        </View>
    )
}

export default ThemedView
