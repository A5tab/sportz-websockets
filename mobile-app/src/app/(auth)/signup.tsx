import React, { useState } from 'react'
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedTextInput, ThemedButton, Spacer, ThemedCard } from '../../components'
import { getTheme } from '../../constants/Colors'

const Signup = () => {
  const router = useRouter()
  const theme = getTheme(useColorScheme() ?? 'light')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <ThemedView safe={true} style={styles.container}>
      <View style={[styles.headerBand, { backgroundColor: theme.successSoft }]} />
      <ThemedCard style={styles.card}>
        <View style={styles.rowBetween}>
          <Pressable onPress={() => router.push('/')}>
            <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Back</ThemedText>
          </Pressable>
        </View>

        <Spacer size={10} />
        <ThemedText variant='heading' style={styles.heading}>Create Account</ThemedText>
        <ThemedText muted={true}>Sign up and subscribe to multiple matches instantly.</ThemedText>

        <Spacer size={14} />

        <ThemedTextInput
          disabled={false}
          label='Full Name'
          value={name}
          onChangeText={setName}
          placeholder='Enter your full name'
          placeholderTextColor={theme.textSoft}
        />

        <Spacer size={8} />

        <ThemedTextInput
          disabled={false}
          label='Email'
          value={email}
          onChangeText={setEmail}
          placeholder='you@example.com'
          placeholderTextColor={theme.textSoft}
          autoCapitalize='none'
          keyboardType='email-address'
        />

        <Spacer size={8} />

        <ThemedTextInput
          disabled={false}
          label='Password'
          value={password}
          onChangeText={setPassword}
          placeholder='Create a strong password'
          placeholderTextColor={theme.textSoft}
          secureTextEntry={true}
        />

        <Spacer size={16} />

        <ThemedButton onPress={() => router.push('/(protected)/Dashboard')} style={{ backgroundColor: theme.success }}>
          <ThemedText style={{ color: theme.textInverse, fontWeight: '700' }}>Continue</ThemedText>
        </ThemedButton>

        <Spacer size={10} />

        <View style={styles.rowCenter}>
          <ThemedText muted={true}>Already have an account? </ThemedText>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Login</ThemedText>
          </Pressable>
        </View>
      </ThemedCard>
    </ThemedView>
  )
}

export default Signup

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    opacity: 0.7,
  },
  card: {
    borderRadius: 18,
    padding: 20,
  },
  heading: {
    marginBottom: 6,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})