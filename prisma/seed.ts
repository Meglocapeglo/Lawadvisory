import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { saveFile } from "../src/lib/storage";

const DEMO_PASSWORD = "password123";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Staff ---
  const admin = await prisma.user.upsert({
    where: { email: "admin@lawadvisory.test" },
    update: {},
    create: {
      email: "admin@lawadvisory.test",
      passwordHash,
      name: "Jordan Avery",
      role: "ADMIN",
    },
  });

  const attorney = await prisma.user.upsert({
    where: { email: "attorney@lawadvisory.test" },
    update: {},
    create: {
      email: "attorney@lawadvisory.test",
      passwordHash,
      name: "Priya Shah",
      role: "STAFF",
    },
  });

  const paralegal = await prisma.user.upsert({
    where: { email: "paralegal@lawadvisory.test" },
    update: {},
    create: {
      email: "paralegal@lawadvisory.test",
      passwordHash,
      name: "Sam Ortiz",
      role: "STAFF",
    },
  });

  // --- Clients ---
  const mariaContact = await prisma.contact.upsert({
    where: { id: 1 },
    update: {},
    create: {
      displayName: "Maria Gonzalez",
      givenName: "Maria",
      surname: "Gonzalez",
      email: "client@lawadvisory.test",
      phone: "555-0101",
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: "client@lawadvisory.test" },
    update: {},
    create: {
      email: "client@lawadvisory.test",
      passwordHash,
      name: "Maria Gonzalez",
      role: "CLIENT",
      contactId: mariaContact.id,
    },
  });

  const devonContact = await prisma.contact.upsert({
    where: { id: 2 },
    update: {},
    create: {
      displayName: "Devon Clarke",
      givenName: "Devon",
      surname: "Clarke",
      email: "client2@lawadvisory.test",
      phone: "555-0102",
    },
  });

  const devon = await prisma.user.upsert({
    where: { email: "client2@lawadvisory.test" },
    update: {},
    create: {
      email: "client2@lawadvisory.test",
      passwordHash,
      name: "Devon Clarke",
      role: "CLIENT",
      contactId: devonContact.id,
    },
  });

  const riversideContact = await prisma.contact.upsert({
    where: { id: 3 },
    update: {},
    create: {
      displayName: "Riverside Property Management",
      company: "Riverside Property Management LLC",
    },
  });

  // --- Matter 1: Gonzalez v. Riverside (fully seeded, portal access granted) ---
  const gonzalezMatter = await prisma.matter.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Gonzalez v. Riverside Property Management",
      caseNumber: "2026-LT-00184",
      jurisdiction: "Cook County, IL",
      matterType: "Landlord-Tenant Dispute",
      status: "OPEN",
      billToContactId: mariaContact.id,
      contacts: {
        create: [
          { contactId: mariaContact.id, role: "CLIENT", portalAccess: true },
          { contactId: riversideContact.id, role: "OPPOSING_PARTY" },
        ],
      },
      responsible: {
        create: [
          { userId: attorney.id, title: "Lead Attorney" },
          { userId: paralegal.id, title: "Paralegal" },
        ],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        matterId: gonzalezMatter.id,
        title: "File response to motion to dismiss",
        description: "Draft and file our response with the county clerk.",
        status: "IN_PROGRESS",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        visibleToClient: true,
        assignedToId: attorney.id,
      },
      {
        matterId: gonzalezMatter.id,
        title: "Draft internal case strategy memo",
        status: "OPEN",
        visibleToClient: false,
        assignedToId: attorney.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.event.createMany({
    data: [
      {
        matterId: gonzalezMatter.id,
        title: "Mediation hearing",
        location: "Cook County Courthouse, Room 412",
        start: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        visibleToClient: true,
      },
    ],
    skipDuplicates: true,
  });

  const leaseDoc = await prisma.document.upsert({
    where: { id: 1 },
    update: {},
    create: {
      matterId: gonzalezMatter.id,
      title: "Lease Agreement",
      description: "Original signed lease, provided by client.",
      visibleToClient: true,
    },
  });
  const leaseVersion = await prisma.documentVersion.upsert({
    where: { documentId_versionNumber: { documentId: leaseDoc.id, versionNumber: 1 } },
    update: {},
    create: {
      documentId: leaseDoc.id,
      versionNumber: 1,
      fileName: "lease-agreement-signed.pdf",
      fileUrl: "demo/lease-agreement-signed.pdf",
      fileSize: 482_000,
      uploadedById: paralegal.id,
    },
  });
  await prisma.document.update({
    where: { id: leaseDoc.id },
    data: { currentVersionId: leaseVersion.id },
  });
  await saveFile(
    leaseVersion.fileUrl,
    Buffer.from(
      "Demo placeholder for a signed lease agreement.\nReplace with a real upload in production.\n"
    )
  );

  const strategyDoc = await prisma.document.upsert({
    where: { id: 2 },
    update: {},
    create: {
      matterId: gonzalezMatter.id,
      title: "Internal Strategy Memo",
      description: "Attorney work product — not shared with client.",
      visibleToClient: false,
    },
  });
  const strategyVersion = await prisma.documentVersion.upsert({
    where: { documentId_versionNumber: { documentId: strategyDoc.id, versionNumber: 1 } },
    update: {},
    create: {
      documentId: strategyDoc.id,
      versionNumber: 1,
      fileName: "strategy-memo-v1.docx",
      fileUrl: "demo/strategy-memo-v1.docx",
      fileSize: 51_200,
      uploadedById: attorney.id,
    },
  });
  await prisma.document.update({
    where: { id: strategyDoc.id },
    data: { currentVersionId: strategyVersion.id },
  });
  await saveFile(
    strategyVersion.fileUrl,
    Buffer.from(
      "Demo placeholder for an internal, staff-only strategy memo.\n"
    )
  );

  const timeEntry = await prisma.timeEntry.create({
    data: {
      matterId: gonzalezMatter.id,
      userId: attorney.id,
      description: "Reviewed lease and drafted response outline",
      minutes: 90,
      billable: true,
      rate: 350,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { number: "INV-2026-0042" },
    update: {},
    create: {
      matterId: gonzalezMatter.id,
      contactId: mariaContact.id,
      number: "INV-2026-0042",
      status: "SENT",
      issuedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      subtotal: 525,
      total: 525,
      lines: {
        create: [
          {
            description: "Attorney time — lease review & response outline (1.5 hrs @ $350/hr)",
            quantity: 1.5,
            rate: 350,
            amount: 525,
            timeEntryId: timeEntry.id,
          },
        ],
      },
    },
  });
  void invoice;

  await prisma.message.createMany({
    data: [
      {
        matterId: gonzalezMatter.id,
        senderId: attorney.id,
        body: "Hi Maria — we've filed the initial paperwork and are preparing our response to the motion. I've shared the signed lease in your Documents tab. Let us know if you have any questions.",
      },
      {
        matterId: gonzalezMatter.id,
        senderId: maria.id,
        body: "Thank you! I saw the mediation hearing date on my calendar. Do I need to attend in person?",
      },
    ],
    skipDuplicates: true,
  });

  // --- Matter 2: Clarke Estate Planning (lighter, second client) ---
  const clarkeMatter = await prisma.matter.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Clarke Estate Planning",
      caseNumber: "2026-EP-00097",
      jurisdiction: "Cook County, IL",
      matterType: "Estate Planning",
      status: "OPEN",
      billToContactId: devonContact.id,
      contacts: {
        create: [{ contactId: devonContact.id, role: "CLIENT", portalAccess: true }],
      },
      responsible: {
        create: [{ userId: attorney.id, title: "Lead Attorney" }],
      },
    },
  });

  await prisma.task.create({
    data: {
      matterId: clarkeMatter.id,
      title: "Send draft will for client review",
      status: "OPEN",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      visibleToClient: true,
      assignedToId: attorney.id,
    },
  });

  await prisma.message.create({
    data: {
      matterId: clarkeMatter.id,
      senderId: attorney.id,
      body: "Hi Devon — welcome to the portal. I'll upload the draft will here for your review by the end of the week.",
    },
  });

  console.log("Seed complete.");
  console.log("Demo accounts (password: %s):", DEMO_PASSWORD);
  console.log("  Admin:      admin@lawadvisory.test");
  console.log("  Attorney:   attorney@lawadvisory.test");
  console.log("  Paralegal:  paralegal@lawadvisory.test");
  console.log("  Client 1:   client@lawadvisory.test  (Gonzalez matter)");
  console.log("  Client 2:   client2@lawadvisory.test (Clarke matter)");
  void admin;
  void devon;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
