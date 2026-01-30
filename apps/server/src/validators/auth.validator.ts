import { z } from 'zod';

const emailSchema = z.string().email('Invalid email format').toLowerCase().trim();

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: emailSchema,
    password: passwordSchema,
    timezone: z.string().optional().default('UTC'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
  }),
});

// Helper to validate IANA timezone
const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid IANA timezone' }
);

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100).optional(),
    timezone: timezoneSchema.optional(),
    avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

// Helper to validate IANA timezone (used in updateProfileSchema)
const timezoneOptionalSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid IANA timezone' }
).optional().default('UTC');

export const googleAuthSchema = z.object({
  body: z.object({
    idToken: z
      .string()
      .min(1, 'Google ID token is required')
      .max(10000, 'Invalid Google ID token'), // Google ID tokens are typically ~800-2000 chars
    timezone: timezoneOptionalSchema,
  }),
});

// Validate Token Schema
// Token comes from Authorization header (validated by authenticate middleware)
// No body validation needed, but schema required for consistency
export const validateTokenSchema = z.object({
  body: z.object({}).optional(),
});
