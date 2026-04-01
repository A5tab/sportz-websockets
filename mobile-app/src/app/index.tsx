import { StyleSheet, } from 'react-native'
import { ThemedView, ThemedText } from '../components'
const index = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText variant={'title'}>Welcome to Sportz App!!!</ThemedText>
    </ThemedView>
  )
}

export default index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
})