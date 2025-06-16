import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .refine((value) => /^[a-zA-Z0-9_-]+$/.test(value), {
      message:
        "Username must contain only alphanumeric characters, underscores, or hyphens",
    }),
  password: z.string().min(1, "Password Must be required"),
  role: z.enum(["HR", "EMPLOYEE", "ADMIN", "PROJECT_MANAGER"], {
    errorMap: () => ({
      message: "Role must be one of HR, EMPLOYEE, ADMIN, or PROJECT_MANAGER",
    }),
  }),
});

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .refine((value) => /^[a-zA-Z0-9_-]+$/.test(value), {
      message:
        "Username must contain only alphanumeric characters, underscores, or hyphens",
    }),
  password: z.string().min(1, "Password Must be required"),
});

export const managerZodSchema = z.object({
  label: z
    .string()
    .min(1, "Manager name is required")
    .transform((value) => value.trim())
    .refine((value) => /^[^\d]+$/.test(value), {
      message: "Team name must not contain digits",
    }),
});

export const updateManagerSchema = managerZodSchema;

export const teamZodSchema = z.object({
  label: z
    .string()
    .min(1, "Team name is required")
    .transform((value) => value.trim())
    .refine((value) => /^[^\d]+$/.test(value), {
      message: "Team name must not contain digits",
    }),
});

export const updateTeamSchema = teamZodSchema;

export const skillZodSchema = z.object({
  label: z
    .string()
    .min(1, "Team name is required")
    .transform((value) => value.trim())
    .refine((value) => /^[^\d]+$/.test(value), {
      message: "Team name must not contain digits",
    }),
});

export const updateSkillSchema = skillZodSchema;
