import { eq } from "drizzle-orm";
import jsonwebtoken from "jsonwebtoken";
import { ForbiddenError, UnauthorizedError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { db } from "../db/db.js";
import { users } from "../db/schema.js";

const { TokenExpiredError } = jsonwebtoken
export const authenticate = asyncHandler(async (req, _, next) => {
    const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "").trim();

    if (!token) {
        throw new UnauthorizedError("Access token missing");
    }

    let decodedToken;
    try {
        decodedToken = verifyAccessToken(token);
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            throw new UnauthorizedError("Session expired. Please login again.");
        }
        throw new UnauthorizedError("Invalid access token.");
    }

    const [user] = await db
        .select({
            id:       users.id,
            username: users.username,
            email:    users.email,
            role:     users.role,
        })
        .from(users)
        .where(eq(users.id, decodedToken.id));

    if (!user) {
        throw new UnauthorizedError("User no longer exists.");
    }

    req.user      = user;                  
    req.sessionId = decodedToken.sessionId;
    req.familyId  = decodedToken.familyId;

    next();
});


export const authorizeRoles = (...allowedRoles) => {
    return (req, _, next) => {
        if (!req.user) {
            return next(new UnauthorizedError("Unauthorized request"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new ForbiddenError("You do not have permission to perform this action"));
        }
        next();
    };
};