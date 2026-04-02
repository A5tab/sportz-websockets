import React from 'react'
import { StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedButton, Spacer, ThemedCard } from '../components'
import { getTheme } from '../constants/Colors'

const Index = () => {
  const router = useRouter()
  const theme = getTheme(useColorScheme() ?? 'light')

  return (
    <ThemedView safe={true} style={styles.container}>
      <View style={styles.heroBackground} />
      <ThemedCard style={[styles.card, { borderColor: theme.border, borderWidth: 1 }]}> 
        <ThemedText variant='title' style={styles.title}>SPORTZ</ThemedText>
        <ThemedText variant='body' muted={true}>
          Live match scores, commentary and instant sports updates in one place.
        </ThemedText>
        <Spacer />
        <ThemedButton
          onPress={() => router.push('/(auth)/signup')}
          style={[styles.button, { backgroundColor: theme.primary }]}
        >
          <ThemedText style={{ color: theme.textInverse, fontWeight: '700' }}>Create Account</ThemedText>
        </ThemedButton>
        <Spacer />
        <ThemedButton
          variant='outline'
          onPress={() => router.push('/(auth)/login')}
          style={[styles.button, { borderColor: theme.primary }]}
        >
          <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>Login</ThemedText>
        </ThemedButton>
      </ThemedCard>
    </ThemedView>
  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 260,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    opacity: 0.08,
    backgroundColor: '#2563EB',
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  title: {
    letterSpacing: 1,
    marginBottom: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
  },
})
