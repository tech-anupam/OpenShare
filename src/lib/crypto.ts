const ALGO = "AES-GCM";
const KEY_LENGTH = 256;
const ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function toBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(str: string): ArrayBuffer {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(
  data: string,
  password: string
): Promise<{ encrypted: string; salt: string; iv: string }> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGO, iv: iv as BufferSource },
    key,
    encoder.encode(data)
  );

  return {
    encrypted: toBase64(encrypted),
    salt: toBase64(salt.buffer),
    iv: toBase64(iv.buffer),
  };
}

export async function decrypt(
  encryptedData: string,
  password: string,
  salt: string,
  iv: string
): Promise<string> {
  const decoder = new TextDecoder();
  const saltBuffer = new Uint8Array(fromBase64(salt));
  const ivBuffer = new Uint8Array(fromBase64(iv));
  const key = await deriveKey(password, saltBuffer);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGO, iv: ivBuffer as BufferSource },
    key,
    fromBase64(encryptedData)
  );

  return decoder.decode(decrypted);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH
  );

  return `${toBase64(salt.buffer)}:${toBase64(bits)}`;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const [saltB64, hashB64] = hash.split(":");
  const encoder = new TextEncoder();
  const salt = new Uint8Array(fromBase64(saltB64));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH
  );

  const derived = toBase64(bits);
  return derived === hashB64;
}
