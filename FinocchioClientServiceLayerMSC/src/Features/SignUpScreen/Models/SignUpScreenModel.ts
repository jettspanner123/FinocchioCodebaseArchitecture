import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Must match the backend's PasswordPolicyService exactly (8 chars + 1 special
// character) -- see FinocchioOrchestratorServiceLayerMSC AuthenticationConstant.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least 1 special character");

export const SignUpScreenFormSchema = z
  .object({
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpScreenFormDataModel = z.infer<typeof SignUpScreenFormSchema>;

export const signUpScreenFormResolver = zodResolver(SignUpScreenFormSchema);
