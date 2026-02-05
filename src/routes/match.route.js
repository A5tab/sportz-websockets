import { Router } from 'express'
import { db } from '../db/db.js'
import { matches } from '../db/schema.js'
import { createMatchSchema, listMatchesQuerySchema } from '../validation/matches.js'
import { getMatchStatus } from '../utils/match-status.js'
import { desc } from 'drizzle-orm'

export const matchRouter = Router()

const MAX_LIMIT = 100;
matchRouter.get('/', async (req, res) => {
    const parsed = listMatchesQuerySchema.safeParse(req.query)

    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            details: parsed.error.issues,
        })
    }

    const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)
    try {
        const data = await db.select().from(matches).orderBy(desc(matches.createdAt)).limit(limit)

        res.status(200).json({
            message: 'Match list retrieved successfully',
            count: data.length,
            data,
        })
    } catch (error) {
        console.error('Error fetching matches:', error)
        res.status(500).json({
            message: 'Failed to fetch matches',
        })
    }
})

matchRouter.post('/', async (req, res) => {
    const parsed = createMatchSchema.safeParse(req.body)

    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid request body',
            details: JSON.stringify(parsed.error),
        })
    }

    const { data: { startTime, endTime, homeScore, awayScore } } = parsed

    try {
        const status = getMatchStatus(startTime, endTime)

        const [event] = await db.insert(matches).values({
            ...parsed.data,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            status,
            homeScore: homeScore ?? 0,
            awayScore: awayScore ?? 0,
        }).returning();

        if (req.app.locals.broadcastMatchCreated) {
            try {
                req.app.locals.broadcastMatchCreated(event);
            } catch (broadcastError) {
                console.error('Error broadcasting match:', broadcastError)
            }
        }
        res.status(201).json({
            message: 'Match created successfully',
            data: event,
        })
    } catch (error) {
        console.error('Error creating match:', error)
        res.status(500).json({
            message: 'Failed to create match',
        })
    }
})