import { db } from "../db/db.js";
import { session } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getRefreshSessionExpiresAt } from "../config/cookie.config.js";
import { generateRefreshToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";

export const createSession = async ({ userId, familyId = null, userAgent, ipAddress }) => {
    const expiresAt = getRefreshSessionExpiresAt();

    const [placeholder] = await db.insert(session).values({
        userId,
        // familyId auto generated using defaultRandom() in schema
        ...(familyId && { familyId }),
        isUsed: false,
        userAgent,
        refreshToken: 'pending',
        ipAddress,
        expiresAt,
    }).returning();

    if (!placeholder) {
        throw new ApiError('Failed to create session');
    }
    const rawRefreshToken = generateRefreshToken({ userId, sessionId: placeholder.id, familyId: placeholder.familyId, });
    // Hash the refresh token before storing
    // If DB is breached, raw tokens are not exposed
    const hashedToken = await bcrypt.hash(rawRefreshToken, 10);

    await db
        .update(session)
        .set({ refreshToken: hashedToken })
        .where(eq(session.id, placeholder.id));

    return { rawRefreshToken, sessionId: placeholder.id, familyId: placeholder.familyId };
};

export const revokeCurrentSession = async (sessionId) => {
    await db
        .delete(session)
        .where(eq(session.id, sessionId));
};

export const revokeDeviceFamily = async (familyId) => {
    await db
        .delete(session)
        .where(eq(session.familyId, familyId));
};

export const revokeAllUserSessions = async (userId) => {
    await db
        .delete(session)
        .where(eq(session.userId, userId));
};