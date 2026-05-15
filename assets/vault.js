export const ENCRYPTED_VALUE_MARKER = "__waaEncrypted";
export const VAULT_KEY = "waaVault";
export const VAULT_VERSION = 2;

const SENSITIVE_WORDS = ["password", "passwd", "pass", "pwd", "密码", "口令"];
const RSA_ALGORITHM = {
  name: "RSA-OAEP",
  modulusLength: 2048,
  publicExponent: new Uint8Array([1, 0, 1]),
  hash: "SHA-256"
};

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function isEncryptedValue(value) {
  return !!value && typeof value === "object" && value[ENCRYPTED_VALUE_MARKER] === true;
}

export function isV2EncryptedValue(value) {
  return isEncryptedValue(value) && value.v === 2 && value.alg === "RSA-OAEP+A256GCM";
}

export function isLegacyEncryptedValue(value) {
  return isEncryptedValue(value) && (!value.v || value.v === 1 || value.alg === "AES-GCM");
}

export function isSensitiveField(field) {
  const text = `${field?.key ?? ""} ${field?.label ?? ""}`.toLowerCase();
  return field?.sensitive === true || SENSITIVE_WORDS.some((word) => text.includes(word));
}

export function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export async function importAesKey(rawKey, usages) {
  return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, usages);
}

export async function generateDekBytes() {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  return new Uint8Array(await crypto.subtle.exportKey("raw", key));
}

export async function deriveKekBytes(prfBytes) {
  const material = await crypto.subtle.importKey("raw", prfBytes, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("web-account-assistant-vault-v2"),
      info: new TextEncoder().encode("private-key-wrap")
    },
    material,
    256
  );
  return new Uint8Array(bits);
}

export async function deriveLegacyKekBytes(prfBytes) {
  const material = await crypto.subtle.importKey("raw", prfBytes, "HKDF", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("web-account-assistant-vault-v1"),
      info: new TextEncoder().encode("dek-wrap")
    },
    material,
    256
  );
  return new Uint8Array(bits);
}

export async function importPublicKey(publicKeyJwk) {
  return crypto.subtle.importKey("jwk", publicKeyJwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["encrypt"]);
}

export async function importPrivateKey(privateKeyJwk) {
  return crypto.subtle.importKey("jwk", privateKeyJwk, { name: "RSA-OAEP", hash: "SHA-256" }, true, ["decrypt"]);
}

export async function wrapDek(kekBytes, dekBytes) {
  const iv = randomBytes(12);
  const key = await importAesKey(kekBytes, ["encrypt"]);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, dekBytes);
  return {
    v: 1,
    alg: "AES-GCM",
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(new Uint8Array(data))
  };
}

export async function unwrapDek(kekBytes, wrappedDek) {
  const key = await importAesKey(kekBytes, ["decrypt"]);
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(wrappedDek.iv) },
    key,
    base64UrlToBytes(wrappedDek.data)
  );
  return new Uint8Array(raw);
}

export async function wrapPrivateKey(kekBytes, privateKeyJwk) {
  const iv = randomBytes(12);
  const key = await importAesKey(kekBytes, ["encrypt"]);
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(privateKeyJwk))
  );
  return {
    v: VAULT_VERSION,
    alg: "AES-GCM",
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(new Uint8Array(data))
  };
}

export async function unwrapPrivateKey(kekBytes, wrappedPrivateKey) {
  const key = await importAesKey(kekBytes, ["decrypt"]);
  const raw = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(wrappedPrivateKey.iv) },
    key,
    base64UrlToBytes(wrappedPrivateKey.data)
  );
  return JSON.parse(new TextDecoder().decode(raw));
}

export async function createV2VaultRecord(kekBytes) {
  const keyPair = await crypto.subtle.generateKey(RSA_ALGORITHM, true, ["encrypt", "decrypt"]);
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const keyId = `vault-key-${Date.now()}-${bytesToBase64Url(randomBytes(8))}`;
  const now = new Date().toISOString();
  return {
    vault: {
      version: VAULT_VERSION,
      keyWrap: "webauthn-prf+rsa-oaep",
      keyId,
      publicKeyJwk,
      wrappedPrivateKey: await wrapPrivateKey(kekBytes, privateKeyJwk),
      createdAt: now,
      updatedAt: now
    },
    privateKey: keyPair.privateKey
  };
}

export async function encryptStringWithPublicKey(publicKeyJwk, plaintext, keyId = "") {
  const publicKey = await importPublicKey(publicKeyJwk);
  const fieldKeyBytes = randomBytes(32);
  const fieldKey = await importAesKey(fieldKeyBytes, ["encrypt"]);
  const iv = randomBytes(12);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, fieldKey, new TextEncoder().encode(String(plaintext ?? "")));
  const wrappedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, fieldKeyBytes);
  return {
    [ENCRYPTED_VALUE_MARKER]: true,
    v: VAULT_VERSION,
    alg: "RSA-OAEP+A256GCM",
    keyId,
    wrappedKey: bytesToBase64Url(new Uint8Array(wrappedKey)),
    iv: bytesToBase64Url(iv),
    data: bytesToBase64Url(new Uint8Array(data))
  };
}

export async function decryptStringWithPrivateKey(privateKey, encryptedValue) {
  if (!isEncryptedValue(encryptedValue)) return encryptedValue ?? "";
  const fieldKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    base64UrlToBytes(encryptedValue.wrappedKey)
  );
  const fieldKey = await importAesKey(new Uint8Array(fieldKeyRaw), ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(encryptedValue.iv) },
    fieldKey,
    base64UrlToBytes(encryptedValue.data)
  );
  return new TextDecoder().decode(plaintext);
}

export async function decryptLegacyString(dekBytes, encryptedValue) {
  if (!isEncryptedValue(encryptedValue)) return encryptedValue ?? "";
  const key = await importAesKey(dekBytes, ["decrypt"]);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64UrlToBytes(encryptedValue.iv) },
    key,
    base64UrlToBytes(encryptedValue.data)
  );
  return new TextDecoder().decode(plaintext);
}

export async function encryptConfigSensitiveValues(config, publicKeyJwk, keyId = "") {
  const next = clone(config);
  for (const project of next.projects ?? []) {
    const sensitiveKeys = new Set((project.fields ?? []).filter(isSensitiveField).map((field) => field.key));
    for (const env of project.envs ?? []) {
      for (const account of env.accounts ?? []) {
        for (const key of sensitiveKeys) {
          const value = account.values?.[key];
          if (value === undefined || value === null || value === "" || isEncryptedValue(value)) continue;
          account.values[key] = await encryptStringWithPublicKey(publicKeyJwk, String(value), keyId);
        }
      }
    }
  }
  return next;
}

export async function decryptConfigSensitiveValues(config, keyMaterial) {
  const next = clone(config);
  const privateKey = keyMaterial?.privateKey ?? null;
  const legacyDekBytes = keyMaterial instanceof Uint8Array ? keyMaterial : keyMaterial?.legacyDekBytes ?? null;
  for (const project of next.projects ?? []) {
    const sensitiveKeys = new Set((project.fields ?? []).filter(isSensitiveField).map((field) => field.key));
    for (const env of project.envs ?? []) {
      for (const account of env.accounts ?? []) {
        for (const key of sensitiveKeys) {
          const value = account.values?.[key];
          if (isV2EncryptedValue(value) && privateKey) account.values[key] = await decryptStringWithPrivateKey(privateKey, value);
          if (isLegacyEncryptedValue(value) && legacyDekBytes) account.values[key] = await decryptLegacyString(legacyDekBytes, value);
        }
      }
    }
  }
  return next;
}
