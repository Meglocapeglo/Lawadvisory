import * as z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export const SignupFormSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }).trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
});

export type SignupFormState =
  | {
      errors?: { name?: string[]; email?: string[] };
      message?: string;
      success?: { email: string; password: string };
    }
  | undefined;

export const ForgotPasswordFormSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
});

export type ForgotPasswordFormState =
  | { errors?: { email?: string[] }; message?: string }
  | undefined;

export const CreateClientFormSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }).trim(),
  email: z.email({ error: "Please enter a valid email." }).trim(),
});

export type CreateClientFormState =
  | {
      errors?: { name?: string[]; email?: string[] };
      message?: string;
      success?: { email: string; password: string };
    }
  | undefined;

export const CreateMatterFormSchema = z.object({
  title: z.string().min(2, { error: "Title is required." }).trim(),
  caseNumber: z.string().trim().optional(),
  jurisdiction: z.string().trim().optional(),
  matterType: z.string().trim().optional(),
  billToContactId: z.coerce.number({ error: "Select a client." }),
  retainerBalance: z.coerce.number().default(0),
});

export type CreateMatterFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export type ResetPasswordState =
  | { success?: { password: string }; message?: string }
  | undefined;
