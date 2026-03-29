import { Router } from 'express'
import { db } from '../db/db.js'
import { commentary } from '../db/schema.js'
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js'
import { matchIdParamSchema } from '../validation/matches.js'
import { MAX_LIMIT } from '../constants/index.js'
import { desc, eq } from 'drizzle-orm'
import { authenticate, authorizeRoles } from '../middleware/auth.js'

export const commentaryRouter = Router({ mergeParams: true })

commentaryRouter.use(authenticate)

commentaryRouter.get('/', async (req, res) => {
    const parsedParams = matchIdParamSchema.safeParse(req.params)
    if (!parsedParams.success) {
        return res.status(400).json({
            message: 'Invalid route parameters',
            details: parsedParams.error.issues,
        })
    }

    const reqParsed = listCommentaryQuerySchema.safeParse(req.query)
    if (!reqParsed.success) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            details: reqParsed.error.issues,
        })
    }

    const limit = Math.min(reqParsed.data.limit ?? 100, MAX_LIMIT)
    try {
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, parsedParams.data.id))
            .orderBy(desc(commentary.createdAt))
            .limit(limit)

        return res.status(200).json({
            message: 'Commentary list retrieved successfully',
            count: data.length,
            data,
        })
    } catch (error) {
        console.error('Error retrieving commentary list:', error)
        return res.status(500).json({
            message: 'Failed to retrieve commentary list',
        })
    }
})

commentaryRouter.post('/', authorizeRoles('admin'), async (req, res) => {
    const paramsParsed = matchIdParamSchema.safeParse(req.params)
    if (!paramsParsed.success) {
        return res.status(400).json({
            message: 'Invalid route parameters',
            details: paramsParsed.error.issues,
        })
    }

    const bodyParsed = createCommentarySchema.safeParse(req.body)
    if (!bodyParsed.success) {
        return res.status(400).json({
            message: 'Invalid request body',
            details: bodyParsed.error.issues,
        })
    }

    try {
        const [created] = await db
            .insert(commentary)
            .values({
                matchId: paramsParsed.data.id,
                ...bodyParsed.data,
            })
            .returning()

        if (res.app.locals.broadcastCommentary) {
            try {
                res.app.locals.broadcastCommentary(created.matchId, created)
            } catch (error) {
                console.error('Error broadcasting commentary:', error)
            }
        }

        res.status(201).json({
            message: 'Commentary created successfully',
            data: created,
        })
    } catch (error) {
        console.error('Error creating commentary:', error)
        res.status(500).json({
            message: 'Failed to create commentary',
        })
    }
})