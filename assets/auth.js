import { VAULT_KEY, bytesToBase64Url, randomBytes } from "./vault.js";

const CREDENTIAL_KEY = "waaExtensionCredential";
const PRF_SALT_KEY = "waaExtensionPrfSalt";

const statusEl = document.getElementById("status");
let closing = false;

function setStatus(message, variant = "") {
  statusEl.textContent = message;
  statusEl.className = variant;
  if (variant) statusEl.classList.add("status");
}

function closeSoon(delay = 250) {
  if (closing) return;
  closing = true;
  window.setTimeout(() => window.close(), delay);
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function getPrfSalt() {
  const data = await chrome.storage.local.get(PRF_SALT_KEY);
  if (data?.[PRF_SALT_KEY]) return base64UrlToBytes(data[PRF_SALT_KEY]);
  const salt = randomBytes(32);
  await chrome.storage.local.set({ [PRF_SALT_KEY]: bytesToBase64Url(salt) });
  return salt;
}

async function getCredentialRecord() {
  const data = await chrome.storage.local.get(CREDENTIAL_KEY);
  return data?.[CREDENTIAL_KEY] ?? null;
}

async function getVaultRecord() {
  const data = await chrome.storage.local.get(VAULT_KEY);
  return data?.[VAULT_KEY] ?? null;
}

function hasLockedVault(vault) {
  return !!(vault?.wrappedPrivateKey || vault?.wrappedDek);
}

async function saveCredentialRecord(record) {
  await chrome.storage.local.set({ [CREDENTIAL_KEY]: record });
}

async function clearCredentialRecord() {
  await chrome.storage.local.remove(CREDENTIAL_KEY);
}

function isMissingCredentialError(error) {
  const text = `${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  return (
    text.includes("notallowederror") ||
    text.includes("no credentials") ||
    text.includes("no passkey") ||
    text.includes("no available passkey") ||
    text.includes("没有可用通行密钥") ||
    text.includes("没有发现")
  );
}

function explainVerifyError(error) {
  if (!isMissingCredentialError(error)) return error?.message ?? "插件通行密钥验证失败";
  return "此设备没有找到账号管理助手的本机通行密钥。如果你刚开始初始化，请重新创建；如果已经加密过数据，说明系统通行密钥被删除或不在当前 Chrome 资料中，旧敏感数据无法用新的通行密钥解开。";
}

async function ensurePlatformAuthenticatorAvailable() {
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
    throw new Error("当前浏览器不支持本机密码或指纹验证");
  }
  const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  if (!available) {
    throw new Error("当前设备未启用本机密码或指纹验证，请先在系统或 Chrome 中启用本机通行密钥");
  }
}

async function createCredential() {
  if (!navigator.credentials?.create) throw new Error("当前浏览器不支持插件通行密钥");
  await ensurePlatformAuthenticatorAvailable();
  setStatus("正在创建账号管理助手插件通行密钥...");
  const prfSalt = await getPrfSalt();

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: {
        name: "账号管理助手"
      },
      user: {
        id: randomBytes(32),
        name: "web-account-assistant",
        displayName: "账号管理助手"
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required",
        requireResidentKey: true
      },
      hints: ["client-device"],
      extensions: {
        prf: {
          eval: {
            first: prfSalt
          }
        }
      },
      timeout: 60000,
      attestation: "none"
    }
  });
  if (!credential?.rawId) throw new Error("插件通行密钥创建失败");

  const extensionResults = credential.getClientExtensionResults?.();
  if (extensionResults?.prf?.enabled === false) {
    throw new Error("当前设备的插件通行密钥不支持 PRF，无法用于加密解锁");
  }

  const record = {
    type: "webauthn-platform",
    credentialId: bytesToBase64Url(new Uint8Array(credential.rawId)),
    transports: ["internal"],
    createdAt: new Date().toISOString()
  };
  await saveCredentialRecord(record);
  return record;
}

async function verifyCredential(record) {
  if (!navigator.credentials?.get) throw new Error("当前浏览器不支持插件通行密钥验证");
  await ensurePlatformAuthenticatorAvailable();
  setStatus("正在验证插件通行密钥...");
  const prfSalt = await getPrfSalt();

  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [
        {
          type: "public-key",
          id: base64UrlToBytes(record.credentialId),
          transports: ["internal"]
        }
      ],
      hints: ["client-device"],
      extensions: {
        prf: {
          eval: {
            first: prfSalt
          }
        }
      },
      userVerification: "required",
      timeout: 60000
    }
  });
  if (!assertion?.rawId) throw new Error("插件通行密钥验证失败");
  const extensionResults = assertion.getClientExtensionResults?.();
  const prfResult = extensionResults?.prf?.results?.first;
  if (!prfResult) throw new Error("当前插件通行密钥未返回 PRF 结果，无法解锁加密数据");
  return bytesToBase64Url(new Uint8Array(prfResult));
}

async function verify() {
  try {
    let record = await getCredentialRecord();
    let prfResult = "";
    if (!record?.credentialId) {
      record = await createCredential();
      prfResult = await verifyCredential(record);
    } else {
      try {
        prfResult = await verifyCredential(record);
      } catch (error) {
        const vault = await getVaultRecord();
        if (!hasLockedVault(vault) && isMissingCredentialError(error)) {
          setStatus("未找到旧的插件通行密钥记录，正在重新创建...");
          await clearCredentialRecord();
          record = await createCredential();
          prfResult = await verifyCredential(record);
        } else {
          throw new Error(explainVerifyError(error));
        }
      }
    }
    setStatus("验证成功，正在返回...", "success");
    await chrome.runtime.sendMessage({ type: "SENSITIVE_AUTH_SUCCESS", prfResult });
    closeSoon(180);
  } catch (error) {
    const message = error?.name === "NotAllowedError" ? "验证已取消或未通过" : error.message;
    setStatus(message, "error");
    await chrome.runtime.sendMessage({ type: "SENSITIVE_AUTH_FAILURE", error: message }).catch(() => {});
    closeSoon(1500);
  }
}

void verify();
