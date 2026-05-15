const UNLOCK_KEY = "waaSensitiveUnlockUntil";
const LEGACY_CREDENTIAL_KEY = "waaSecurityCredential";
const UNLOCK_WINDOW_MS = 60 * 1000;

function getStorageCandidates() {
  if (typeof chrome === "undefined") return [];
  return [chrome.storage?.session, chrome.storage?.local].filter(Boolean);
}

async function readUnlockUntil() {
  for (const storage of getStorageCandidates()) {
    try {
      const data = await storage.get(UNLOCK_KEY);
      return Number(data?.[UNLOCK_KEY] ?? 0);
    } catch (error) {
      if (!/storage is not allowed/i.test(error?.message ?? "")) throw error;
    }
  }
  return 0;
}

async function writeUnlockUntil(value) {
  let wrote = false;
  for (const storage of getStorageCandidates()) {
    try {
      await storage.set({ [UNLOCK_KEY]: value });
      wrote = true;
      break;
    } catch (error) {
      if (!/storage is not allowed/i.test(error?.message ?? "")) throw error;
    }
  }
  if (!wrote) throw new Error("无法保存敏感操作验证状态");
}

async function removeLegacyCredentialRecord() {
  for (const storage of getStorageCandidates()) {
    try {
      await storage.remove(LEGACY_CREDENTIAL_KEY);
    } catch (error) {
      if (!/storage is not allowed/i.test(error?.message ?? "")) throw error;
    }
  }
}

export async function getSensitiveUnlockStatus() {
  if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
    try {
      const response = await chrome.runtime.sendMessage({ type: "GET_SENSITIVE_UNLOCK_STATUS" });
      if (response?.ok) return response.status;
    } catch {
      // Fall through to local storage probing for older loaded pages.
    }
  }
  const unlockedUntil = await readUnlockUntil();
  const now = Date.now();
  return {
    unlocked: unlockedUntil > now,
    unlockedUntil,
    remainingMs: Math.max(0, unlockedUntil - now)
  };
}

export async function ensureSensitiveAccess() {
  await removeLegacyCredentialRecord();
  const status = await getSensitiveUnlockStatus();
  if (status.unlocked) return true;

  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) throw new Error("当前环境无法请求插件验证");
  const response = await chrome.runtime.sendMessage({ type: "UNLOCK_SENSITIVE" });
  if (response?.ok) return true;
  throw new Error(response?.error ?? "敏感操作验证失败");
}

export async function markSensitiveAccessUnlockedForTests() {
  await writeUnlockUntil(Date.now() + UNLOCK_WINDOW_MS);
  return true;
}

export async function lockSensitiveAccess() {
  await writeUnlockUntil(0);
}
