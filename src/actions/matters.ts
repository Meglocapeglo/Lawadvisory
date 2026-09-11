"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, requireMatterAccess } from "@/lib/dal";
import { saveFile } from "@/lib/storage";
import { CreateMatterFormSchema, type CreateMatterFormState } from "@/lib/definitions";

export async function setPortalAccess(
  matterId: number,
  contactId: number,
  portalAccess: boolean
) {
  await requireRole("STAFF", "ADMIN");

  await prisma.matterContact.update({
    where: { matterId_contactId: { matterId, contactId } },
    data: { portalAccess },
  });

  revalidatePath(`/staff/matters/${matterId}`);
}

export async function toggleDocumentVisibility(
  documentId: number,
  matterId: number,
  visibleToClient: boolean
) {
  await requireRole("STAFF", "ADMIN");

  await prisma.document.update({
    where: { id: documentId },
    data: { visibleToClient },
  });

  revalidatePath(`/staff/matters/${matterId}`);
}

export async function uploadDocument(formData: FormData) {
  const user = await requireRole("STAFF", "ADMIN");

  const matterId = Number(formData.get("matterId"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const visibleToClient = formData.get("visibleToClient") === "on";
  const file = formData.get("file") as File | null;

  if (!matterId || !title || !file || file.size === 0) {
    throw new Error("Title and a file are required.");
  }

  const document = await prisma.document.create({
    data: { matterId, title, description: description || null, visibleToClient },
  });

  const key = `matter-${matterId}/doc-${document.id}/${Date.now()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await saveFile(key, bytes);

  const version = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: 1,
      fileName: file.name,
      fileUrl: key,
      fileSize: file.size,
      uploadedById: user.id,
    },
  });

  await prisma.document.update({
    where: { id: document.id },
    data: { currentVersionId: version.id },
  });

  revalidatePath(`/staff/matters/${matterId}`);
}

export async function createMatter(
  _state: CreateMatterFormState,
  formData: FormData
): Promise<CreateMatterFormState> {
  await requireRole("STAFF", "ADMIN");

  const validated = CreateMatterFormSchema.safeParse({
    title: formData.get("title"),
    caseNumber: formData.get("caseNumber") || undefined,
    jurisdiction: formData.get("jurisdiction") || undefined,
    matterType: formData.get("matterType") || undefined,
    billToContactId: formData.get("billToContactId"),
    retainerBalance: formData.get("retainerBalance") || 0,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { title, caseNumber, jurisdiction, matterType, billToContactId, retainerBalance } =
    validated.data;

  const contact = await prisma.contact.findUnique({ where: { id: billToContactId } });
  if (!contact) {
    return { errors: { billToContactId: ["Select a valid client."] } };
  }

  const matter = await prisma.matter.create({
    data: {
      title,
      caseNumber,
      jurisdiction,
      matterType,
      retainerBalance,
      billToContactId,
      contacts: {
        create: [{ contactId: billToContactId, role: "CLIENT", portalAccess: true }],
      },
    },
  });

  redirect(`/staff/matters/${matter.id}`);
}

export async function adjustRetainer(matterId: number, formData: FormData) {
  await requireRole("STAFF", "ADMIN");

  const raw = formData.get("retainerBalance");
  const value = Number(raw);
  if (raw === null || Number.isNaN(value)) {
    throw new Error("Enter a valid amount.");
  }

  await prisma.matter.update({
    where: { id: matterId },
    data: { retainerBalance: value },
  });

  revalidatePath(`/staff/matters/${matterId}`);
  revalidatePath(`/portal/matters/${matterId}`);
  revalidatePath("/portal");
}

export async function uploadEvidence(matterId: number, formData: FormData) {
  const user = await requireMatterAccess(matterId);

  const title = String(formData.get("title") ?? "").trim();
  const file = formData.get("file") as File | null;

  if (!title || !file || file.size === 0) {
    throw new Error("A title and a file are required.");
  }

  const document = await prisma.document.create({
    data: { matterId, title, visibleToClient: true },
  });

  const key = `matter-${matterId}/doc-${document.id}/${Date.now()}-${file.name}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await saveFile(key, bytes);

  const version = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: 1,
      fileName: file.name,
      fileUrl: key,
      fileSize: file.size,
      uploadedById: user.id,
    },
  });

  await prisma.document.update({
    where: { id: document.id },
    data: { currentVersionId: version.id },
  });

  revalidatePath(`/portal/matters/${matterId}/documents`);
  revalidatePath(`/staff/matters/${matterId}`);
}

export async function sendMessage(matterId: number, formData: FormData) {
  const user = await requireMatterAccess(matterId);

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await prisma.message.create({
    data: { matterId, senderId: user.id, body },
  });

  revalidatePath(`/staff/matters/${matterId}`);
  revalidatePath(`/portal/matters/${matterId}/messages`);
}
