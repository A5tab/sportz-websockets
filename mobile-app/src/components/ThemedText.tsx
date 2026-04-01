import { StyleSheet, Text, useColorScheme, TextProps } from 'react-native'
import { getTheme } from '../constants/Colors'

interface ThemedTextProps extends TextProps {
    children: React.ReactNode
    variant?: 'body' | 'base' | 'title' | 'heading' | 'caption'
    muted?: boolean
}
const ThemedText = ({ children, style, variant = 'body', muted = false }: ThemedTextProps) => {
  const theme = getTheme(useColorScheme() ?? 'light')
  const color = muted ? theme.textMuted : theme.text

  return <Text style={[styles.base, styles[variant], { color }, style]}>{children}</Text>
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
})

export default ThemedText
