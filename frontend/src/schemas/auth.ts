import z from "zod"

export const registerSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required" }),
  email: z.email({ message: "Invalid email" }),
  universityId: z.string().min(4, { message: "University Id must be at least 4 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
})

export type RegisterFormType = z.infer<typeof registerSchema>



export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

export type LoginFormType = z.infer<typeof loginSchema>
