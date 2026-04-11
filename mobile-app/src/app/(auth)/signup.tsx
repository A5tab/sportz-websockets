import React, { useState } from 'react'
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedTextInput, ThemedButton, Spacer, ThemedCard } from '../../components'
import { getTheme } from '../../constants/Colors'
import { registerRequest } from '../../services/auth.service'
import { saveRefreshToken } from '../../utils/token-storage'
import { useAuth } from '../../hooks/useAuth'

const Signup = () => {
  const router = useRouter()
  const { setAuth } = useAuth()
  const theme = getTheme(useColorScheme() ?? 'light')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [bio, setBio] = useState('Hello, I am new here!')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const signup = async () => {
    try {
      setErrorMessage('')

      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Full name, email, and password are required.')
        return
      }

      setSubmitting(true)

      const formData = new FormData()
      formData.append('username', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('bio', bio)

      const session = await registerRequest(formData)

      await saveRefreshToken(session.refreshToken)

      setAuth({
        isLoggedIn: true,
        data: session.user,
        loading: false,
        accessToken: session.accessToken,
      })

      router.replace('/(protected)/Dashboard')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Signup failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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

        {!!errorMessage && (
          <>
            <Spacer size={10} />
            <ThemedCard style={{ borderColor: theme.danger, borderWidth: 1, backgroundColor: theme.dangerSoft }}>
              <ThemedText style={{ color: theme.danger }}>{errorMessage}</ThemedText>
            </ThemedCard>
          </>
        )}

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
          label='Bio'
          value={bio}
          onChangeText={setBio}
          placeholder='Tell people about you'
          placeholderTextColor={theme.textSoft}
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

        <ThemedButton onPress={signup} disabled={submitting} style={{ backgroundColor: theme.success }}>
          <ThemedText style={{ color: theme.textInverse, fontWeight: '700' }}>
            {submitting ? 'Creating account...' : 'Continue'}
          </ThemedText>
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