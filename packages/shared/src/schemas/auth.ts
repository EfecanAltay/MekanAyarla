import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['BUSINESS_ADMIN', 'CUSTOMER']).default('CUSTOMER'),
  organizationName: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
