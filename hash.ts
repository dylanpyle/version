import { crypto } from "https://deno.land/std/crypto/mod.ts";
import { encode } from "https://deno.land/std/encoding/hex.ts";

export async function shortHash(value: string, length = 8) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  const bytes = new Uint8Array(digest);
  const hex = encode(bytes);
  const hash = decoder.decode(hex);
  return hash.substring(0, length);
}
