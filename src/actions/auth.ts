"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { generatePassword } from "@/lib/password";
import { sendMail } from "@/lib/mail";
import {
  LoginFormSchema,
  type LoginFormState,
  SignupFormSchema,
  type SignupFormState,
  ForgotPasswordFormSchema,
  type ForgotPasswordFormState,
} from "@/lib/definitions";

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id, user.role);

  redirect(user.role === "CLIENT" ? "/portal" : "/staff");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function signup(
  _state: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const validated = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email } = validated.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { message: "An account with that email already exists." };
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    const contact = await tx.contact.create({
      data: { displayName: name, email },
    });
    await tx.user.create({
      data: { name, email, passwordHash, role: "CLIENT", contactId: contact.id },
    });
  });

  return { success: { email, password } };
}

export async function requestPasswordReset(
  _state: ForgotPasswordFormState,
  formData: FormData
): Promise<ForgotPasswordFormState> {
  const validated = ForgotPasswordFormSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email } = validated.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return the same message whether or not the account exists, so
  // this can't be used to enumerate client emails.
  if (user) {
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    await sendMail({
      to: email,
      subject: "Your Lawadvisory portal password has been reset",
      text: `Hi ${user.name},\n\nYour new temporary password is: ${password}\n\nSign in at /login and consider requesting another reset if you'd like to set a different password.\n`,
    });
  }

  return {
    message: "If that email has an account, we've sent a new password to it.",
  };
}
