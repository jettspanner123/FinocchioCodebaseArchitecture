import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const LoginScreenFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginScreenFormDataModel = z.infer<typeof LoginScreenFormSchema>;

export const loginScreenFormResolver = zodResolver(LoginScreenFormSchema);
