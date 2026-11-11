import { randomBytes, scrypt as deriveKey } from "node:crypto";
import { sameSecret } from "../_lib.js";

export async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const key = await new Promise<Buffer>((resolve, reject) => {
    deriveKey(password, salt, 32, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
  return `${salt}:${key.toString("hex")}`;
}

export async function matchesCodyPassword(password: string, hash?: string) {
  if (hash) return sameSecret(await hashPassword(password, hash.split(":")[0]), hash);
  return Boolean(process.env.ADMIN_PASSWORD && sameSecret(password, process.env.ADMIN_PASSWORD));
}
