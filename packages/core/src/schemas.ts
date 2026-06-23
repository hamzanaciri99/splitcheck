import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(60),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const createConversationSchema = z.object({
  participantUserIds: z.array(z.string().min(1)).min(1),
  title: z.string().min(1).max(80).nullable().optional(),
});
export type CreateConversationInput = z.infer<typeof createConversationSchema>;

export const createMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});
export type CreateMessageInput = z.infer<typeof createMessageSchema>;

export const createCheckItemSchema = z.object({
  name: z.string().min(1).max(120),
  priceCents: z.number().int().nonnegative(),
});

export const createCheckSchema = z.object({
  title: z.string().min(1).max(120),
  currency: z.string().length(3).default('USD'),
  attachmentId: z.string().min(1).nullable().optional(),
  items: z.array(createCheckItemSchema).min(1),
  participants: z
    .array(
      z.object({
        userId: z.string().min(1),
        shareCents: z.number().int().nonnegative(),
      })
    )
    .min(1),
});
export type CreateCheckInput = z.infer<typeof createCheckSchema>;

export const respondCheckSchema = z.object({
  status: z.enum(['PAID', 'DECLINED']),
});
export type RespondCheckInput = z.infer<typeof respondCheckSchema>;
