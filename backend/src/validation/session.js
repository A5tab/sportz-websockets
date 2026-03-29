import { z } from "zod";

export const createSessionSchema = z.object({
    id: z.uuid(),
    userId: z.string(),
    familyId: z.uuid(),
    refreshToken: z.jwt({ alg: 'HS256', error: "Invalid Refresh Token" }),
    accessToken: z.jwt({ alg: 'HS256', error: "Invalid Access Token" },),
    isUsed: z.boolean(),
    userAgent: z.string(),
    ipAddress: z.ipv4({ error: "IP Address not following ipv4 standards" }),
    expiresAt: z.iso.datetime()
})
