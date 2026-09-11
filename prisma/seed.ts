// Production-safe seed: bootstraps exactly one admin account from env vars.
// Wired to `prisma db seed`, so this is what runs on every deploy/init —
// it must never create demo/fake client data. For local dev sample data
// (a demo firm, clients, matters, documents, invoices) run
// `npx tsx prisma/seed-demo.ts` separately instead.
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { generatePassword } from "../src/lib/password";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME ?? "Admin";
  let password = process.env.ADMIN_PASSWORD;

  if (!email) {
    console.log(
      "No ADMIN_EMAIL set — skipping admin bootstrap. Set ADMIN_EMAIL " +
        "(and optionally ADMIN_PASSWORD / ADMIN_NAME) and re-run " +
        "`npx prisma db seed` to create your admin account."
    );
    return;
  }

  const generated = !password;
  if (!password) password = generatePassword();

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN" },
    create: { email, passwordHash, name, role: "ADMIN" },
  });

  console.log(`Admin account ready: ${email}`);
  if (generated) {
    console.log(`Generated password (save this now, it won't be shown again): ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
