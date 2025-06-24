import { z } from "zod";
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .refine((value) => /^[a-zA-Z0-9_-]+$/.test(value), {
      message:
        "Username must contain only alphanumeric characters, underscores, or hyphens",
    }),
  firstName: z.string().min(1, "Firstname is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(1, "Password Must be required"),
  role: z.string().min(1, "role Must be required"),
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
  managerId: z.string().min(1, "managerId is required"),
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

export const createHolidaySchema = z.object({
  label: z.string().min(1, "Holiday is required"),
});

export const updateHolidaySchema = createHolidaySchema;

export const createDesignationSchema = z.object({
  label: z.string().min(1, "Holiday is required"),
});

export const updateDesignationSchema = createDesignationSchema;

export const createDepartmentSchema = z.object({
  label: z.string().min(1, "Department is required"),
});

export const updateDepartmentSchema = createDepartmentSchema;

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
});

const bankDetailsSchema = z.object({
  accountNumber: z.string().min(1, "account number is required"),
  ifscCode: z.string().min(1, "ifsc code is required"),
  branchName: z.string().min(1, "branch name is required"),
});

export const userDetailsSchema = z.object({
  managerId: z.string().min(1, "Manager ID is required"),

  image: z.string().optional(),
  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  personalNumber: z.string().optional(),

  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),

  permenentAddress: addressSchema.optional(),
  currentAddress: addressSchema.optional(),

  joiningDate: z.coerce.date().optional(),
  probationDate: z.coerce.date().optional(),
  panNo: z.string().optional(),
  aadharNo: z.string().optional(),
  currentSalary: z.string().optional(),
  previousExperience: z.string().optional(),
  pfNo: z.string().optional(),
  uanDetail: z.string().optional(),
  esicNo: z.string().optional(),
  esicStart: z.coerce.date().optional(),
  esicEnd: z.coerce.date().optional(),
  relieivingDate: z.coerce.date().optional(),

  teamId: z.string().optional(),
  designationId: z.string().min(1, "Designstion Id required"),
  department: z.string().optional(),

  primarySkills: z.string().min(1, "Primaryskill required"),
  secondarySkills: z.string().optional(),

  bankDetails: bankDetailsSchema.optional(),

  isDeleted: z.boolean().optional(),
});
export const createUserSchema = z.object({
  firstName: z.string().min(1, "Firstname is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z
    .string()
    .regex(objectIdRegex, "Invalid Role ObjectId")
    .nonempty("Role is required"),
});

export const updateUserSchema = createUserSchema.partial();
