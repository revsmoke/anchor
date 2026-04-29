import { hash, verify } from "@node-rs/argon2";

export async function hashPassword(password) {
  return hash(password);
}

export async function verifyPassword(passwordHash, password) {
  return verify(passwordHash, password);
}
