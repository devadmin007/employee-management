import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .refine((value) => /^[a-zA-Z0-9_-]+$/.test(value), {
      message:
        "Username must contain only alphanumeric characters, underscores, or hyphens",
    }),
    firstName : z.string().min(1,"Firstname is required"),
    lastName : z.string().min(1,"Last name is required"),
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
  label: z.string().min(1, "Holiday is required")
})

export const updateHolidaySchema = createHolidaySchema

export const createDesignationSchema = z.object({
  label: z.string().min(1, "Holiday is required")
})

export const updateDesignationSchema = createDesignationSchema






// Reusable address and bank schema
const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zip: z.string().min(1, "Zip is required"),
});

const bankDetailsSchema = z.object({
  accountNumber: z.string().min(1, "Account Number is required"),
  ifscCode: z.string().min(1, "IFSC Code is required"),
  branchName: z.string().min(1, "Branch Name is required"),
});

export const userDetailsSchema = z.object({

  managerId: z.string().min(1, "Manager ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),

  countryCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  personalNumber: z.string().optional(),

  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),


  permenentAddress: addressSchema,
  currentAddress: addressSchema,

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
  designationId: z.string().min(1,"Designstion Id required"),
  department: z.string().optional(),

  primarySkills: z.string().min(1,"Primaryskill required"),
  secondarySkills: z.string().optional(),

  bankDetails: bankDetailsSchema.optional(),

  isDeleted: z.boolean().optional(),
});
export const createUserSchema = z.object({
    firstName : z.string().min(1,"Firstname is required"),
    lastName : z.string().min(1,"Last name is required"),
  role: z.enum(["HR", "EMPLOYEE", "ADMIN", "PROJECT_MANAGER"], {
    errorMap: () => ({
      message: "Role must be one of HR, EMPLOYEE, ADMIN, or PROJECT_MANAGER",
    }),
  }),
});

export const updateUserSchema = createUserSchema.partial()
