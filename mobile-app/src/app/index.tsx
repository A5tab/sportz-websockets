import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedView, ThemedText } from '../components'

const Index = () => {
  return (
    // <ThemedView safe={true} style={styles.container}>
    //   <View style={styles.heroWrap}>
    //     <ThemedText variant="title" style={styles.title}>Sportz</ThemedText>
    //     <Spacer size={8} />
    //     <ThemedText muted={true} style={styles.subtitle}>
    //       Live scores, quick commentary, and instant match updates.
    //     </ThemedText>
    //   </View>

    //   <View style={styles.ctaWrap}>
    //     <ThemedButton
    //       variant="primary"
    //       onPress={() => router.push('/(auth)/login')}
    //       style={styles.button}
    //     >
    //       <ThemedText style={[styles.buttonText, { color: theme.textInverse }]}>Login</ThemedText>
    //     </ThemedButton>

    //     <Spacer size={12} />

    //     <ThemedButton
    //       variant="outline"
    //       onPress={() => router.push('/(auth)/signup')}
    //       style={styles.button}
    //     >
    //       <ThemedText style={{ color: theme.primary }}>Signup</ThemedText>
    //     </ThemedButton>
    //   </View>
    // </ThemedView>
    <ThemedView safe={true} style={styles.container}>
      <ThemedText style={styles.title} variant='title'>Sportz</ThemedText>
    </ThemedView>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
  },
})

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     justifyContent: 'space-between',
//     paddingVertical: 28,
//   },
//   heroWrap: {
//     marginTop: 44,
//   },
//   title: {
//     fontSize: 48,
//     lineHeight: 54,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//   },
//   subtitle: {
//     maxWidth: 320,
//   },
//   ctaWrap: {
//     width: '100%',
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 14,
//   },
//   buttonText: {
//     fontWeight: '700',
//   },
// })