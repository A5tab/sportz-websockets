import React, { useState } from 'react'
import { Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedTextInput, ThemedButton, Spacer, ThemedCard } from '../../components'
import { getTheme } from '../../constants/Colors'

const Login = () => {
    const router = useRouter()
    const theme = getTheme(useColorScheme() ?? 'light')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <ThemedView safe={true} style={styles.container}>
            <View style={[styles.headerBand, { backgroundColor: theme.primarySoft }]} />
            <ThemedCard style={styles.card}>
                <View style={styles.rowBetween}>
                    <Pressable onPress={() => router.push('/')}>
                        <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Back</ThemedText>
                    </Pressable>
                </View>

                <Spacer size={10} />
                <ThemedText variant='heading' style={styles.heading}>Welcome Back</ThemedText>
                <ThemedText muted={true}>Login to continue with your subscribed matches.</ThemedText>

                <Spacer size={14} />

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
                    placeholder='Enter your password'
                    placeholderTextColor={theme.textSoft}
                    secureTextEntry={true}
                />

                <Spacer size={16} />

                <ThemedButton onPress={() => router.push('/(protected)/Dashboard')} style={{ backgroundColor: theme.primary }}>
                    <ThemedText style={{ color: theme.textInverse, fontWeight: '700' }}>Login</ThemedText>
                </ThemedButton>

                <Spacer size={10} />

                <View style={styles.rowCenter}>
                    <ThemedText muted={true}>New to Sportz? </ThemedText>
                    <Pressable onPress={() => router.push('/(auth)/signup')}>
                        <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Create account</ThemedText>
                    </Pressable>
                </View>
            </ThemedCard>
        </ThemedView>
    )
}

export default Login

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
        opacity: 0.6,
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