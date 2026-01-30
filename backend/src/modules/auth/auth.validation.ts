import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const firebaseAuthSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    bio: z.string().optional(),
    profileImage: z.string().optional(),
  }),
});

export const followUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1),
  }),
});
