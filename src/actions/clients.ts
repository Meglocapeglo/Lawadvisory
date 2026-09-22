"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { generatePassword } from "@/lib/password";
import {
  CreateClientFormSchema,
  type CreateClientFormState,
  type ResetPasswordState,
} from "@/lib/definitions";

export async function createClient(
  _state: CreateClientFormState,
  formData: FormData
): Promise<CreateClientFormState> {
  await requireRole("STAFF", "ADMIN");

  const validated = CreateClientFormSchema.safeParse({
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

export async function resetClientPassword(
  userId: number,
  _state: ResetPasswordState,
  _formData: FormData
): Promise<ResetPasswordState> {
  await requireRole("STAFF", "ADMIN");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "CLIENT") {
    return { message: "Client account not found." };
  }

  const password = generatePassword();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath(`/staff/clients/${user.contactId}`);

  return { success: { password } };
}
