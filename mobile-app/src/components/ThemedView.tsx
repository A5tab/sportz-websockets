import React, { ReactNode } from 'react'
import { StyleSheet, useColorScheme, View } from 'react-native'
import {getTheme} from "../constants/Colors"

type ThemedViewProp = {
    children: ReactNode
    style: StyleSheet
}
const ThemedView = ({ children, style, ...props }: ThemedViewProp) => {
    const theme = getTheme(useColorScheme() ?? 'light')

    return (
        <View style={[{backgroundColor: theme.background}, style]} {...props}>
            {children}
        </View>
    )
}

export default ThemedView
