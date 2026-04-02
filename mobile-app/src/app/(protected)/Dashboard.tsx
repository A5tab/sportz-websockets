import React, { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedCard, ThemedButton, Spacer } from '../../components'
import { getTheme } from '../../constants/Colors'

type Match = {
  id: string
  league: string
  teams: string
  score: string
  status: string
  commentary: string
}

const MATCHES: Match[] = [
  {
    id: 'm1',
    league: 'Cricket Premier League',
    teams: 'Titans vs Warriors',
    score: '146/4 (16.2)',
    status: 'Live',
    commentary: 'Back-to-back boundaries! Momentum swings to Titans.',
  },
  {
    id: 'm2',
    league: 'International T20',
    teams: 'India vs Australia',
    score: '89/2 (10.0)',
    status: 'Innings Break',
    commentary: 'Strong middle-over control. Spinners dominated this phase.',
  },
  {
    id: 'm3',
    league: 'Women Series',
    teams: 'England W vs NZ W',
    score: '212/7 (40.0)',
    status: 'Live',
    commentary: 'Wicket! Slower ball does the trick at a crucial moment.',
  },
]

const Dashboard = () => {
  const router = useRouter()
  const theme = getTheme(useColorScheme() ?? 'light')
  const [subscribedMatchIds, setSubscribedMatchIds] = useState<string[]>(['m1'])

  const subscribedMatches = useMemo(
    () => MATCHES.filter((match) => subscribedMatchIds.includes(match.id)),
    [subscribedMatchIds]
  )

  const toggleSubscription = (id: string) => {
    setSubscribedMatchIds((prev) =>
      prev.includes(id) ? prev.filter((matchId) => matchId !== id) : [...prev, id]
    )
  }

  return (
    <ThemedView safe={true} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.rowBetween}>
          <Pressable onPress={() => router.push('/')}>
            <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Home</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Logout</ThemedText>
          </Pressable>
        </View>
        <Spacer size={8} />
        <ThemedText variant='title' style={styles.title}>Match Dashboard</ThemedText>
        <ThemedText muted={true}>Subscribe to one or more matches for live commentary updates.</ThemedText>

        <Spacer size={16} />
        <ThemedText variant='heading'>Available Matches</ThemedText>
        <Spacer size={10} />

        {MATCHES.map((match) => {
          const isSubscribed = subscribedMatchIds.includes(match.id)
          return (
            <View key={match.id} style={styles.blockGap}>
              <ThemedCard style={[styles.matchCard, { borderColor: theme.border, borderWidth: 1 }]}>
                <View style={styles.rowBetween}>
                  <ThemedText variant='caption' muted={true}>{match.league}</ThemedText>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: match.status === 'Live' ? theme.successSoft : theme.warningSoft },
                    ]}
                  >
                    <ThemedText
                      variant='caption'
                      style={{ color: match.status === 'Live' ? theme.success : theme.warning, fontWeight: '700' }}
                    >
                      {match.status}
                    </ThemedText>
                  </View>
                </View>

                <Spacer size={8} />
                <ThemedText variant='heading'>{match.teams}</ThemedText>
                <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>{match.score}</ThemedText>

                <Spacer size={12} />
                <ThemedButton
                  variant={isSubscribed ? 'outline' : 'primary'}
                  onPress={() => toggleSubscription(match.id)}
                  style={{
                    borderColor: theme.primary,
                    backgroundColor: isSubscribed ? 'transparent' : theme.primary,
                  }}
                >
                  <ThemedText style={{ color: isSubscribed ? theme.primary : theme.textInverse, fontWeight: '700' }}>
                    {isSubscribed ? 'Subscribed - Tap to Remove' : 'Subscribe'}
                  </ThemedText>
                </ThemedButton>
              </ThemedCard>
            </View>
          )
        })}

        <Spacer size={18} />
        <ThemedText variant='heading'>Live Commentary & Updates</ThemedText>
        <Spacer size={10} />

        {subscribedMatches.length === 0 ? (
          <ThemedCard style={{ borderColor: theme.border, borderWidth: 1 }}>
            <ThemedText muted={true}>No subscriptions yet. Subscribe to a match to see updates here.</ThemedText>
          </ThemedCard>
        ) : (
          subscribedMatches.map((match) => (
            <View key={`sub-${match.id}`} style={styles.blockGap}>
              <ThemedCard style={[styles.updateCard, { backgroundColor: theme.surfaceAlt }]}>
                <ThemedText variant='heading'>{match.teams}</ThemedText>
                <ThemedText variant='caption' muted={true}>{match.league}</ThemedText>
                <Spacer size={8} />
                <ThemedText style={{ color: theme.info, fontWeight: '700' }}>{match.score}</ThemedText>
                <Spacer size={6} />
                <ThemedText>{match.commentary}</ThemedText>
              </ThemedCard>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  title: {
    marginBottom: 4,
  },
  blockGap: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchCard: {
    borderRadius: 14,
  },
  updateCard: {
    borderRadius: 14,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
})