import React, { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, useColorScheme, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedCard, ThemedButton, Spacer } from '../../components'
import { getTheme } from '../../constants/Colors'
import { useMatches } from '../../hooks/useMatches'
import { useCommentary } from '../../hooks/useCommentary'
import { useSocket } from '../../hooks/useSocket'

const Dashboard = () => {
  const router = useRouter()
  const theme = getTheme(useColorScheme() ?? 'light')
  const {
    matches,
    subscribedMatchIds,
    toggleMatchSubscription,
    isMatchSubscribed,
  } = useMatches()
  const { connectionStatus } = useSocket()
  const { commentaryByMatchId } = useCommentary()

  const subscribedMatches = useMemo(
    () => matches.filter((match) => subscribedMatchIds.includes(match.id)),
    [matches, subscribedMatchIds]
  )

  const getLatestCommentary = (matchId: number) => {
    const comments = commentaryByMatchId[matchId] ?? []
    return comments.length > 0
      ? `${comments[0].actor || 'Unknown'}: ${comments[0].message}`
      : 'No commentary yet for this match.'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'live') return 'Live'
    if (status === 'finished') return 'Finished'
    return 'Scheduled'
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
        <Spacer size={8} />
        <ThemedText variant='caption' muted={true}>
          WebSocket: {connectionStatus}
        </ThemedText>

        <Spacer size={16} />
        <ThemedText variant='heading'>Available Matches</ThemedText>
        <Spacer size={10} />

        {matches.map((match) => {
          const isSubscribed = isMatchSubscribed(match.id)
          return (
            <View key={match.id} style={styles.blockGap}>
              <ThemedCard style={[styles.matchCard, { borderColor: theme.border, borderWidth: 1 }]}>
                <View style={styles.rowBetween}>
                  <ThemedText variant='caption' muted={true}>{match.sport}</ThemedText>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: match.status === 'live' ? theme.successSoft : theme.warningSoft,
                      },
                    ]}
                  >
                    <ThemedText
                      variant='caption'
                      style={{ color: match.status === 'live' ? theme.success : theme.warning, fontWeight: '700' }}
                    >
                      {getStatusLabel(match.status)}
                    </ThemedText>
                  </View>
                </View>

                <Spacer size={8} />
                <ThemedText variant='heading'>{match.homeTeam} vs {match.awayTeam}</ThemedText>
                <ThemedText style={{ color: theme.primary, fontWeight: '700' }}>{match.homeScore} - {match.awayScore}</ThemedText>

                <Spacer size={12} />
                <ThemedButton
                  variant={isSubscribed ? 'outline' : 'primary'}
                  onPress={() => toggleMatchSubscription(match.id)}
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

        {matches.length === 0 && (
          <ThemedCard style={{ borderColor: theme.border, borderWidth: 1 }}>
            <ThemedText muted={true}>No matches available yet. New matches will appear in real-time.</ThemedText>
          </ThemedCard>
        )}

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
                <ThemedText variant='heading'>{match.homeTeam} vs {match.awayTeam}</ThemedText>
                <ThemedText variant='caption' muted={true}>{match.sport}</ThemedText>
                <Spacer size={8} />
                <ThemedText style={{ color: theme.info, fontWeight: '700' }}>{match.homeScore} - {match.awayScore}</ThemedText>
                <Spacer size={6} />
                <ThemedText>{getLatestCommentary(match.id)}</ThemedText>
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