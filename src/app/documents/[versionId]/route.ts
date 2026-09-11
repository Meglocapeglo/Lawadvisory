import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/dal";
import { readStoredFile } from "@/lib/storage";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/documents/[versionId]">
) {
  const { versionId } = await ctx.params;
  const user = await getCurrentUser();

  const version = await prisma.documentVersion.findUnique({
    where: { id: Number(versionId) },
    include: {
      document: {
        include: { matter: { include: { contacts: true } } },
      },
    },
  });

  if (!version) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { document } = version;
  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  if (!isStaff) {
    const hasAccess =
      document.visibleToClient &&
      user.contactId !== null &&
      document.matter.contacts.some(
        (mc) => mc.contactId === user.contactId && mc.portalAccess
      );
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const data = await readStoredFile(version.fileUrl);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${version.fileName}"`,
      "Content-Length": String(version.fileSize),
    },
  });
}
