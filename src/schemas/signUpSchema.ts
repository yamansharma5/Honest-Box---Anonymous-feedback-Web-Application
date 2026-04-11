import {z} from 'zod';

export const userNameSchema = z.string()
.min(2)
.max(100)
.regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" });



export const signUpSchema = z.object({
    username: userNameSchema,
    email: z.string()
    .email({ message: "Invalid email address" }),

    password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(50)
    
});