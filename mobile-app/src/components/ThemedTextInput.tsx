import { StyleSheet, TextInput, TextInputProps, useColorScheme, View } from 'react-native'
import React from 'react'
import ThemedText from './ThemedText'
import { getTheme } from '../constants/Colors'

interface ThemedTextInputProps extends TextInputProps {
    label?: string
    disabled: boolean
    error?: string
}
const ThemedTextInput = ({
    label,
    error,
    style,
    disabled = false,
    ...props
}: ThemedTextInputProps) => {
    const theme = getTheme(useColorScheme() ?? "light")
    return (
        <View style={styles.wrapper}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}

            <TextInput
                {...props}
                style={[{
                    backgroundColor: disabled ? theme.textMuted : theme.surface,
                    borderColor: error ? theme.danger : theme.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                }, style]}
            />

            {error && <ThemedText style={{ color: theme.danger }}>{error}</ThemedText>}
        </View>
    )
}

export default ThemedTextInput

const styles = StyleSheet.create({
    wrapper: {
        width: '100%'
    },
    label: {
        marginTop: 8,
        fontWeight: 500
    }
})