import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Local filesystem storage for demo/dev purposes. Swap this module for an
// S3/R2-backed implementation (same key-in/buffer-out shape) before
// deploying with real client documents.
const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

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
  return readFile(safeResolve(key));
}
