import { z } from 'zod'

export const ROLE = {
    ADMIN: 'admin',
    USER: 'user'
}
export const createUserSchema = z.object({
    id: z.string(),
    username: z.string().length(50),
    email: z.email(),
    password: z.string().min(6),
    role: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
})