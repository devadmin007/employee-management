import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(1, 'Username is required').refine(
        (value) => /^[a-zA-Z0-9_-]+$/.test(value), {
            message: 'Username must contain only alphanumeric characters, underscores, or hyphens'
        }),
    password: z.string().min(1, 'Password Must be required'),
    role: z.enum(['HR', 'EMPLOYEE', 'ADMIN', 'PROJECT_MANAGER'], {
        errorMap: () => ({ message: 'Role must be one of HR, EMPLOYEE, ADMIN, or PROJECT_MANAGER' }),
    }),
})

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required').refine(
        (value) => /^[a-zA-Z0-9_-]+$/.test(value),{
              message: 'Username must contain only alphanumeric characters, underscores, or hyphens'
        }),
    password: z.string().min(1, 'Password Must be required'),
})

