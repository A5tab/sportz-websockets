import { StyleSheet, View, ViewProps, useColorScheme } from 'react-native'
import { getTheme } from '../constants/Colors'

interface ThemedCardProps extends ViewProps {

}
const ThemedCard = ({ style, children }: ThemedCardProps) => {
  const theme = getTheme(useColorScheme() ?? 'light')

  return <View style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.surfaceAlt }, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
})

export default ThemedCard
