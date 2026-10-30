import z from "zod";

export const registerSchema = z
  .object({
    username: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().pipe(z.email()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "min 8, must have uppercase, lowercase, digit, special char",
      ),
    password_confirmation: z
      .string()
      .min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "must match password",
    path: ["password_confirmation"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
