import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionCookie } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect("/login");
  }

  return { userId: session.userId, role: session.role };
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      contactId: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
});

export async function requireRole(...roles: Role[]) {
  const user = await getCurrentUser();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

/**
 * Confirms the logged-in client contact has been explicitly granted portal
 * access to this matter (MatterContact.portalAccess), and that staff/admin
 * users may view any matter. Redirects to the caller's dashboard otherwise.
 */
export async function requireMatterAccess(matterId: number) {
  const user = await getCurrentUser();

  if (user.role === "STAFF" || user.role === "ADMIN") {
    return user;
  }

  if (user.role === "CLIENT" && user.contactId) {
    const link = await prisma.matterContact.findUnique({
      where: {
        matterId_contactId: { matterId, contactId: user.contactId },
      },
      select: { portalAccess: true },
    });

    if (link?.portalAccess) {
      return user;
    }
  }

  redirect("/portal");
}
