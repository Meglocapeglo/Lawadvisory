import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Local filesystem storage. Set STORAGE_DIR to a mounted Railway Volume
// path in production — container disk is ephemeral and wiped on every
// redeploy otherwise. Swap this module for an S3/R2-backed implementation
// (same key-in/buffer-out shape) if you'd rather not manage a volume.
const STORAGE_ROOT =
  process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage", "uploads");

function safeResolve(key: string) {
  const resolved = path.resolve(STORAGE_ROOT, key);
  if (!resolved.startsWith(STORAGE_ROOT)) {
    throw new Error("Invalid storage key");
  }
  return resolved;
}

export async function saveFile(
  key: string,
  data: Buffer
): Promise<void> {
  const filePath = safeResolve(key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

export async function readStoredFile(key: string): Promise<Buffer> {
  // turbopackIgnore: STORAGE_DIR is a runtime env var, not a build-time
  // path — without this, Turbopack traces (and bundles) the whole project.
  return readFile(/* turbopackIgnore: true */ safeResolve(key));
}
