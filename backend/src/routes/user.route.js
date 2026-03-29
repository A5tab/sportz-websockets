import Router from 'express'
import fs from 'node:fs'
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError, BadRequestError, ConflictError, UnauthorizedError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js"
import { db } from '../db/db.js';
import { eq, or } from "drizzle-orm";
import { session, users } from '../db/schema.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs'
import { generateAccessToken, verifyRefreshToken } from "../utils/jwt.js"
import {
    CLEAR_COOKIE_OPTIONS,
    COOKIE_NAMES,
    getRefreshTokenCookieOptions,
} from '../config/cookie.config.js';
import { createSession, revokeCurrentSession } from '../services/session.service.js';
import { authenticate } from '../middleware/auth.js'
import { upload } from "../middleware/multer.js"
import { cleanupTempFile } from '../utils/cleanupTempFile.js';
export const userRouter = Router();

userRouter.post('/register', upload.single("avatar"), asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    try {
        const { username, email, password, bio } = req.body
        if ([username, email, password, bio].some((val) => val.trim() === "" || val.length === 0)) {
            throw new BadRequestError('All fields are required')
        }

        const [userExists] = await db.select().from(users).where(eq(users.username, username))
        if (userExists) {
            throw new ConflictError('User with this username already exists.')
        }


        let avatarUrl = null;
        if (avatarLocalPath) {
            uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

            if (!uploadedAvatar?.secure_url) {
                throw new ApiError("Avatar upload failed", { statusCode: 500 });
            }
            avatarUrl = uploadedAvatar?.secure_url;
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const [user] = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
                avatar: avatarUrl,
                bio,
            })
            .returning()

        if (!user) {
            throw new ApiError('Failed to Register user.')
        }


        const { rawRefreshToken, sessionId, familyId } = await createSession({
            userId: user.id,
            userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
        });
        const accessToken = generateAccessToken({ id: user.id, username: user.username, email: user.email, role: user.role, sessionId, familyId });

        const { password: _, ...safeUser } = user

        return res
            .status(201)
            .cookie(COOKIE_NAMES.REFRESH_TOKEN, rawRefreshToken, getRefreshTokenCookieOptions())
            .json(new ApiResponse(201, { user: safeUser, accessToken }, "User created successfully."))
    } finally {
        cleanupTempFile(avatarLocalPath)
    }
}))

userRouter.post('/login', asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!email && !username) {
        throw new BadRequestError("Email or Username must be provided", { fields: [email, username], values: "Username or Email is required" })
    }
    if (!password) {
        throw new BadRequestError("Password is not provided", { field: password, values: "Please enter your password." })
    }

    const [user] = await
        db.select().from(users).where(or(eq(users.username, username), eq(users.email, email)))

    if (!user) throw new UnauthorizedError("Invalid Credentals.")


    const { rawRefreshToken, sessionId, familyId } = await createSession({ userId: user.id, userAgent: req.headers['user_agent'], ipAddress: req.ip })

    const accessToken = generateAccessToken({ id: user.id, username: user.username, email: user.email, role: user.role, sessionId, familyId });

    const { password: _, ...safeUser } = user

    return res
        .status(200)
        .cookie(COOKIE_NAMES.REFRESH_TOKEN, rawRefreshToken, getRefreshTokenCookieOptions())
        .json(new ApiResponse(200, { user: safeUser, accessToken }, "User logged in successfully."))

}))

userRouter.delete('/logout', authenticate, asyncHandler(async (req, res) => {
    await revokeCurrentSession(req.sessionId);

    return res
        .status(200)
        .clearCookie(COOKIE_NAMES.REFRESH_TOKEN, CLEAR_COOKIE_OPTIONS)
        .clearCookie(COOKIE_NAMES.ACCESS_TOKEN, CLEAR_COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Logged out successfully"));
}));

userRouter.delete('/logout/all', authenticate, asyncHandler(async (req, res) => {
    await revokeAllUserSessions(req.user.id);

    return res
        .status(200)
        .clearCookie(COOKIE_NAMES.REFRESH_TOKEN, CLEAR_COOKIE_OPTIONS)
        .clearCookie(COOKIE_NAMES.ACCESS_TOKEN, CLEAR_COOKIE_OPTIONS)
        .json(new ApiResponse(200, null, "Logged out from all devices"));
}));

userRouter.post('/refresh', asyncHandler(async (req, res) => {

    const rawTokenFromCookie = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
    if (!rawTokenFromCookie) {
        throw new UnauthorizedError("Refresh token missing");
    }

    let decoded;
    try {
        decoded = verifyRefreshToken(rawTokenFromCookie);
        // decoded = { userId, sessionId, familyId }
    } catch {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const [existingSession] = await db
        .select()
        .from(session)
        .where(eq(session.id, decoded.sessionId));

    if (!existingSession) {
        throw new UnauthorizedError("Session not found. Please login again.");
    }

    if (existingSession.expiresAt < new Date()) {
        await revokeCurrentSession(existingSession.id);
        throw new UnauthorizedError("Session expired. Please login again.");
    }

    if (existingSession.isUsed) {
        await revokeDeviceFamily(existingSession.familyId);
        throw new UnauthorizedError("Token reuse detected. Please login again.");
    }

    const isTokenValid = await bcrypt.compare(rawTokenFromCookie, existingSession.refreshToken);
    if (!isTokenValid) {
        throw new UnauthorizedError("Invalid refresh token");
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId));

    if (!user) throw new UnauthorizedError("User not found");

    await db
        .update(session)
        .set({ isUsed: true })
        .where(eq(session.id, existingSession.id));

    const { rawRefreshToken, sessionId, familyId } = await createSession({
        userId: user.id,
        familyId: existingSession.familyId,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
    });

    const accessToken = generateAccessToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        sessionId,
        familyId,
    });

    return res
        .status(200)
        .cookie(COOKIE_NAMES.REFRESH_TOKEN, rawRefreshToken, getRefreshTokenCookieOptions())
        .json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
}));