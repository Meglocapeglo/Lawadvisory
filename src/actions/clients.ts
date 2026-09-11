"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/dal";
import { generatePassword } from "@/lib/password";
import { CreateClientFormSchema, type CreateClientFormState } from "@/lib/definitions";

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
