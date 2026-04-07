import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, useColorScheme, View, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ThemedView, ThemedText, ThemedCard, ThemedButton, Spacer } from '../../components'
import { getTheme } from '../../constants/Colors'
import { useMatches } from '../../hooks/useMatches'
import { useCommentary } from '../../hooks/useCommentary'
import { useApi } from '../../hooks/useApi'
import type { CommentaryItem } from '../../context/CommentaryContext'

type CommentaryApiResponse = {
    data?: CommentaryItem[]
}

const MatchDetail = () => {
    const router = useRouter()
    const { matchId } = useLocalSearchParams<{ matchId: string }>()
    const theme = getTheme(useColorScheme() ?? 'light')
    const { matches } = useMatches()
    const { commentaryByMatchId } = useCommentary()
    const api = useApi()

    const [loading, setLoading] = useState(true)

    const matchIdNum = matchId ? parseInt(matchId, 10) : null
    const match = matchIdNum ? matches.find((m) => m.id === matchIdNum) : null
    const commentary = matchIdNum ? (commentaryByMatchId[matchIdNum] ?? []) : []

    useEffect(() => {
        const fetchInitialCommentary = async () => {
            if (!matchIdNum) return

            try {
                const response = await api.get<CommentaryApiResponse>(
                    `/matches/${matchIdNum}/commentary`,
                    { params: { limit: 50 } }
                )
                // Commentary context will be populated by websocket listener,
                // this fetch is for initial load only
                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch commentary:', error)
                setLoading(false)
            }
        }

        void fetchInitialCommentary()
    }, [matchIdNum, api])

    if (!match) {
        return (
            <ThemedView safe={true} style={styles.container}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Back</ThemedText>
                    </Pressable>
                </View>
                <View style={styles.centerContent}>
                    <ThemedText>Match not found</ThemedText>
                </View>
            </ThemedView>
        )
    }

    const getStatusLabel = (status: string) => {
        if (status === 'live') return 'Live'
        if (status === 'finished') return 'Finished'
        return 'Scheduled'
    }

    return (
        <ThemedView safe={true} style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <ThemedText style={{ color: theme.link, fontWeight: '700' }}>Back</ThemedText>
                    </Pressable>
                    <ThemedText variant='title' style={styles.title}>Match Details</ThemedText>
                    <View style={{ width: 50 }} />
                </View>

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

                    <Spacer size={16} />
                    <View style={styles.scoreContainer}>
                        <View style={styles.teamColumn}>
                            <ThemedText variant='heading' style={styles.teamName}>{match.homeTeam}</ThemedText>
                            <ThemedText style={[styles.score, { color: theme.primary }]}>{match.homeScore}</ThemedText>
                        </View>

                        <ThemedText style={styles.vs}>vs</ThemedText>

                        <View style={styles.teamColumn}>
                            <ThemedText variant='heading' style={styles.teamName}>{match.awayTeam}</ThemedText>
                            <ThemedText style={[styles.score, { color: theme.primary }]}>{match.awayScore}</ThemedText>
                        </View>
                    </View>

                    <Spacer size={12} />
                    <ThemedText variant='caption' muted={true}>
                        {new Date(match.startTime).toLocaleString()}
                    </ThemedText>
                </ThemedCard>

                <Spacer size={24} />
                <ThemedText variant='heading'>Live Commentary</ThemedText>
                <Spacer size={12} />

                {loading && (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                )}

                {!loading && commentary.length === 0 && (
                    <ThemedCard style={{ borderColor: theme.border, borderWidth: 1 }}>
                        <ThemedText muted={true}>No commentary yet for this match.</ThemedText>
                    </ThemedCard>
                )}

                {commentary.map((item) => (
                    <View key={item.id} style={styles.commentaryGap}>
                        <ThemedCard style={[styles.commentaryCard, { backgroundColor: theme.surfaceAlt }]}>
                            <View style={styles.commentaryHeader}>
                                <ThemedText style={{ fontWeight: '700' }}>{item.actor || 'Unknown'}</ThemedText>
                                <ThemedText variant='caption' muted={true}>
                                    {item.minute ? `${item.minute}\'` : item.period || 'Event'}
                                </ThemedText>
                            </View>
                            <Spacer size={6} />
                            <ThemedText>{item.message || 'No message'}</ThemedText>
                            {item.team && (
                                <>
                                    <Spacer size={4} />
                                    <ThemedText variant='caption' muted={true}>{item.team}</ThemedText>
                                </>
                            )}
                        </ThemedCard>
                    </View>
                ))}

                <Spacer size={24} />
            </ScrollView>
        </ThemedView>
    )
}

export default MatchDetail

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
    matchCard: {
        borderRadius: 14,
        padding: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusPill: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    scoreContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    teamColumn: {
        alignItems: 'center',
    },
    teamName: {
        marginBottom: 8,
        textAlign: 'center',
    },
    score: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    vs: {
        fontSize: 16,
        fontWeight: '700',
        marginHorizontal: 16,
    },
    commentaryGap: {
        marginBottom: 12,
    },
    commentaryCard: {
        borderRadius: 10,
    },
    commentaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
})
