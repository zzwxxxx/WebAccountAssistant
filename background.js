import {e as ensureConfig, w as saveConfig, r as readConfig, D as defaultConfig} from "./assets/storage.js";
import {
    VAULT_KEY,
    base64UrlToBytes,
    createV2VaultRecord,
    decryptConfigSensitiveValues,
    decryptLegacyString,
    decryptStringWithPrivateKey,
    deriveLegacyKekBytes,
    deriveKekBytes,
    encryptConfigSensitiveValues,
    isEncryptedValue,
    isLegacyEncryptedValue,
    isSensitiveField,
    isV2EncryptedValue,
    unwrapDek,
    unwrapPrivateKey
} from "./assets/vault.js";

const SENSITIVE_UNLOCK_KEY = "waaSensitiveUnlockUntil";
const SENSITIVE_UNLOCK_WINDOW_MS = 60 * 1000;
const AUTOFILL_KEY_DB = "waaAutofillKeys";
const AUTOFILL_KEY_STORE = "keys";
const AUTOFILL_PRIVATE_KEY_ID = "autofillPrivateKey";

let authWindowId = null;
const pendingSensitiveUnlocks = new Set();
let sessionPrivateKey = null;
let sessionLegacyDekBytes = null;
let sessionKeyExpiresAt = 0;

const ACTIVE_ICON = {
    16: "icons/icon-16.png",
    32: "icons/icon-32.png",
    48: "icons/icon-48.png",
    128: "icons/icon-128.png"
};

const INACTIVE_ICON = {
    16: "icons/icon-gray-16.png",
    32: "icons/icon-gray-32.png",
    48: "icons/icon-gray-48.png",
    128: "icons/icon-gray-128.png"
};

function normalizeHost(value = "") {
    return value.replace(/^www\./, "").toLowerCase();
}

function parseUrl(url) {
    try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) return null;
        return {
            host: parsed.host,
            hostname: parsed.hostname,
            pathname: parsed.pathname,
            search: parsed.search,
            hash: parsed.hash
        };
    } catch {
        return null;
    }
}

function matchEnvironment(config, urlInfo) {
    if (!config || !urlInfo) return null;
    const host = normalizeHost(urlInfo.host || urlInfo.hostname);
    const route = `${urlInfo.pathname}${urlInfo.search ?? ""}${urlInfo.hash ?? ""}`;

    for (const project of config.projects ?? []) {
        for (const env of project.envs ?? []) {
            const hostMatched = (env.hosts ?? []).some((item) => {
                const target = normalizeHost(item);
                return target === host || host.endsWith(`.${target}`) || host === target;
            });
            const pathMatched = (env.pathKeywords ?? []).some((keyword) => route.includes(keyword));
            if (hostMatched && pathMatched) return {project, env};
        }
    }

    return null;
}

function getSessionStorage() {
    return chrome.storage?.session ?? chrome.storage?.local;
}

async function getSensitiveUnlockStatus() {
    const storage = getSessionStorage();
    if (!storage) return {unlocked: false, unlockedUntil: 0, remainingMs: 0};
    const data = await storage.get(SENSITIVE_UNLOCK_KEY);
    const unlockedUntil = Number(data?.[SENSITIVE_UNLOCK_KEY] ?? 0);
    const now = Date.now();
    const unlocked = unlockedUntil > now && hasSessionKey();
    return {
        unlocked,
        unlockedUntil,
        remainingMs: unlocked ? Math.max(0, unlockedUntil - now) : 0
    };
}

function hasSessionKey() {
    if ((sessionPrivateKey || sessionLegacyDekBytes) && sessionKeyExpiresAt > Date.now()) return true;
    if (sessionPrivateKey || sessionLegacyDekBytes) {
        sessionPrivateKey = null;
        sessionLegacyDekBytes = null;
    }
    return false;
}

async function setSensitiveUnlocked() {
    const unlockedUntil = Date.now() + SENSITIVE_UNLOCK_WINDOW_MS;
    const storage = getSessionStorage();
    if (storage) await storage.set({[SENSITIVE_UNLOCK_KEY]: unlockedUntil});
    sessionKeyExpiresAt = unlockedUntil;
    return unlockedUntil;
}

async function getVaultRecord() {
    const data = await chrome.storage.local.get(VAULT_KEY);
    return data?.[VAULT_KEY] ?? null;
}

async function saveVaultRecord(record) {
    await chrome.storage.local.set({[VAULT_KEY]: record});
}

function openAutofillKeyDb() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === "undefined") {
            reject(new Error("当前浏览器不支持自动填充解密密钥存储"));
            return;
        }
        const request = indexedDB.open(AUTOFILL_KEY_DB, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(AUTOFILL_KEY_STORE)) db.createObjectStore(AUTOFILL_KEY_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("打开自动填充解密密钥存储失败"));
    });
}

async function withAutofillKeyStore(mode, callback) {
    const db = await openAutofillKeyDb();
    try {
        return await new Promise((resolve, reject) => {
            const transaction = db.transaction(AUTOFILL_KEY_STORE, mode);
            const store = transaction.objectStore(AUTOFILL_KEY_STORE);
            let settled = false;
            Promise.resolve(callback(store))
                .then((value) => {
                    settled = true;
                    resolve(value);
                })
                .catch(reject);
            transaction.onerror = () => reject(transaction.error ?? new Error("自动填充解密密钥存储操作失败"));
            transaction.onabort = () => reject(transaction.error ?? new Error("自动填充解密密钥存储操作已取消"));
            transaction.oncomplete = () => {
                if (!settled) resolve(undefined);
            };
        });
    } finally {
        db.close();
    }
}

function idbRequest(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error("自动填充解密密钥读写失败"));
    });
}

async function cacheAutofillPrivateKey(privateKeyJwk) {
    const privateKey = await crypto.subtle.importKey("jwk", privateKeyJwk, {name: "RSA-OAEP", hash: "SHA-256"}, false, [
        "decrypt"
    ]);
    await withAutofillKeyStore("readwrite", (store) => idbRequest(store.put(privateKey, AUTOFILL_PRIVATE_KEY_ID)));
}

async function readAutofillPrivateKey() {
    try {
        return await withAutofillKeyStore("readonly", (store) => idbRequest(store.get(AUTOFILL_PRIVATE_KEY_ID)));
    } catch {
        return null;
    }
}

async function unlockVaultWithPrf(prfResult) {
    const prfBytes = base64UrlToBytes(prfResult);
    const kekBytes = await deriveKekBytes(prfBytes);
    let vault = await getVaultRecord();

    if (vault?.version === 2 && vault?.wrappedPrivateKey && vault?.publicKeyJwk) {
        const privateKeyJwk = await unwrapPrivateKey(kekBytes, vault.wrappedPrivateKey);
        sessionPrivateKey = await crypto.subtle.importKey("jwk", privateKeyJwk, {
            name: "RSA-OAEP",
            hash: "SHA-256"
        }, true, [
            "decrypt"
        ]);
        await cacheAutofillPrivateKey(privateKeyJwk);
        sessionLegacyDekBytes = null;
        return vault;
    }

    let legacyPlainConfig = null;
    if (vault?.wrappedDek) {
        const legacyKekBytes = await deriveLegacyKekBytes(prfBytes);
        sessionLegacyDekBytes = await unwrapDek(legacyKekBytes, vault.wrappedDek);
        legacyPlainConfig = await decryptConfigSensitiveValues(await readRawConfig(), {legacyDekBytes: sessionLegacyDekBytes});
    }

    const created = await createV2VaultRecord(kekBytes);
    await saveVaultRecord(created.vault);
    sessionPrivateKey = created.privateKey;
    await cacheAutofillPrivateKey(await crypto.subtle.exportKey("jwk", created.privateKey));
    const configToEncrypt = legacyPlainConfig ?? (await readRawConfig());
    if (hasPlaintextSensitiveValues(configToEncrypt) || legacyPlainConfig) {
        await saveRawConfig(await encryptConfigSensitiveValues(configToEncrypt, created.vault.publicKeyJwk, created.vault.keyId));
    }
    sessionLegacyDekBytes = null;
    return created.vault;
}

async function getUnlockedKeyMaterial() {
    if (hasSessionKey()) return {privateKey: sessionPrivateKey, legacyDekBytes: sessionLegacyDekBytes};
    throw new Error("请先通过插件通行密钥验证");
}

async function getAutofillKeyMaterial() {
    if (hasSessionKey()) return {privateKey: sessionPrivateKey, legacyDekBytes: sessionLegacyDekBytes};
    const privateKey = await readAutofillPrivateKey();
    if (privateKey) return {privateKey, legacyDekBytes: null};
    throw new Error("自动填充解密密钥尚未初始化，请先完成一次敏感操作验证");
}

async function readRawConfig() {
    const data = await chrome.storage.local.get("appConfig");
    return data?.appConfig ?? defaultConfig;
}

async function saveRawConfig(appConfig) {
    await chrome.storage.local.set({appConfig});
}

function hasPlaintextSensitiveValues(appConfig) {
    for (const project of appConfig.projects ?? []) {
        const sensitiveKeys = new Set((project.fields ?? []).filter(isSensitiveField).map((field) => field.key));
        for (const env of project.envs ?? []) {
            for (const account of env.accounts ?? []) {
                for (const key of sensitiveKeys) {
                    const value = account.values?.[key];
                    if (value !== undefined && value !== null && value !== "" && !isEncryptedValue(value)) return true;
                }
            }
        }
    }
    return false;
}

async function readConfigForUi() {
    const rawConfig = await readRawConfig();
    if (!hasSessionKey()) return rawConfig;
    return decryptConfigSensitiveValues(rawConfig, {
        privateKey: sessionPrivateKey,
        legacyDekBytes: sessionLegacyDekBytes
    });
}

async function encryptAndSaveConfig(appConfig) {
    const vault = await getVaultRecord();
    if (!vault?.publicKeyJwk) {
        if (!hasPlaintextSensitiveValues(appConfig)) {
            await saveRawConfig(appConfig);
            return appConfig;
        }
        throw new Error("首次保存敏感数据前需要完成插件通行密钥验证初始化");
    }
    const encryptedConfig = await encryptConfigSensitiveValues(appConfig, vault.publicKeyJwk, vault.keyId);
    await saveRawConfig(encryptedConfig);
    return encryptedConfig;
}

async function openSensitiveAuthWindow() {
    const popupWidth = 420;
    const popupHeight = 260;
    if (authWindowId !== null) {
        try {
            await chrome.windows.update(authWindowId, {focused: true});
            return;
        } catch {
            authWindowId = null;
        }
    }

    const authUrl = chrome.runtime.getURL("auth.html");
    let windowOptions = {
        url: authUrl,
        type: "popup",
        width: popupWidth,
        height: popupHeight,
        focused: true
    };

    try {
        const currentWindow = await chrome.windows.getLastFocused({windowTypes: ["normal"]});
        if (
            Number.isFinite(currentWindow?.left) &&
            Number.isFinite(currentWindow?.top) &&
            Number.isFinite(currentWindow?.width) &&
            Number.isFinite(currentWindow?.height)
        ) {
            windowOptions.left = Math.round(currentWindow.left + Math.max(0, currentWindow.width - popupWidth) / 2);
            windowOptions.top = Math.round(currentWindow.top + Math.max(0, currentWindow.height - popupHeight) / 2);
        }
    } catch {
        // Chrome will choose a default position if the focused window cannot be read.
    }

    const created = await chrome.windows.create({
        ...windowOptions
    });
    authWindowId = created?.id ?? null;
}

function resolveSensitiveUnlocks(response) {
    for (const sendResponse of pendingSensitiveUnlocks) {
        try {
            sendResponse(response);
        } catch {
            // The requester may have gone away. Ignore stale responses.
        }
    }
    pendingSensitiveUnlocks.clear();
}

chrome.windows?.onRemoved?.addListener((windowId) => {
    if (windowId === authWindowId) {
        authWindowId = null;
        if (pendingSensitiveUnlocks.size > 0) {
            resolveSensitiveUnlocks({ok: false, error: "验证窗口已关闭"});
        }
    }
});

async function setToolbarIcon(tabId, matched) {
    if (!chrome.action?.setIcon || !tabId) return;
    await chrome.action.setIcon({
        tabId,
        path: matched ? ACTIVE_ICON : INACTIVE_ICON
    });
}

async function updateTabIcon(tab) {
    if (!tab?.id) return;
    const config = await readConfig();
    const matched = !!matchEnvironment(config, parseUrl(tab.url));
    await setToolbarIcon(tab.id, matched);
}

async function updateActiveTabIcon() {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    await updateTabIcon(tab);
}

chrome.runtime.onInstalled.addListener(async () => {
    const config = await ensureConfig();
    if (!config.projects?.length) await saveConfig(defaultConfig);
    await updateActiveTabIcon();
});

chrome.runtime.onStartup?.addListener(() => {
    updateActiveTabIcon().catch(console.error);
});

chrome.tabs.onActivated?.addListener(({tabId}) => {
    chrome.tabs.get(tabId).then(updateTabIcon).catch(console.error);
});

chrome.tabs.onUpdated?.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === "complete") {
        updateTabIcon({...tab, id: tabId}).catch(console.error);
    }
});

chrome.storage?.onChanged?.addListener((changes, areaName) => {
    if (areaName === "local" && changes.appConfig) {
        updateActiveTabIcon().catch(console.error);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "GET_SENSITIVE_UNLOCK_STATUS") {
        getSensitiveUnlockStatus()
            .then((status) => sendResponse({ok: true, status}))
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "UNLOCK_SENSITIVE") {
        getSensitiveUnlockStatus()
            .then(async (status) => {
                if (status.unlocked) {
                    sendResponse({ok: true, status});
                    return;
                }
                pendingSensitiveUnlocks.add(sendResponse);
                try {
                    await openSensitiveAuthWindow();
                } catch (error) {
                    pendingSensitiveUnlocks.delete(sendResponse);
                    sendResponse({ok: false, error: error.message});
                }
            })
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "SENSITIVE_AUTH_SUCCESS") {
        Promise.resolve()
            .then(async () => {
                if (!message.prfResult) throw new Error("缺少插件通行密钥 PRF 结果");
                await unlockVaultWithPrf(message.prfResult);
                return setSensitiveUnlocked();
            })
            .then((unlockedUntil) => {
                resolveSensitiveUnlocks({
                    ok: true,
                    status: {
                        unlocked: true,
                        unlockedUntil,
                        remainingMs: Math.max(0, unlockedUntil - Date.now())
                    }
                });
                sendResponse({ok: true});
            })
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "SENSITIVE_AUTH_FAILURE") {
        const error = message.error || "敏感操作验证失败";
        resolveSensitiveUnlocks({ok: false, error});
        sendResponse({ok: true});
        return false;
    }

    if (message?.type === "GET_APP_CONFIG") {
        readConfigForUi()
            .then((appConfig) => sendResponse({ok: true, appConfig}))
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "DECRYPT_APP_CONFIG") {
        readConfigForUi()
            .then((appConfig) => sendResponse({ok: true, appConfig}))
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "DECRYPT_VALUE") {
        getUnlockedKeyMaterial()
            .then(({privateKey, legacyDekBytes}) => {
                if (isV2EncryptedValue(message.value)) return decryptStringWithPrivateKey(privateKey, message.value);
                if (isLegacyEncryptedValue(message.value)) return decryptLegacyString(legacyDekBytes, message.value);
                return message.value ?? "";
            })
            .then((value) => sendResponse({ok: true, value}))
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "DECRYPT_VALUE_FOR_FILL") {
        getAutofillKeyMaterial()
            .then(({privateKey, legacyDekBytes}) => {
                if (isV2EncryptedValue(message.value)) return decryptStringWithPrivateKey(privateKey, message.value);
                if (isLegacyEncryptedValue(message.value)) return decryptLegacyString(legacyDekBytes, message.value);
                return message.value ?? "";
            })
            .then((value) => sendResponse({ok: true, value}))
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    if (message?.type === "SAVE_APP_CONFIG") {
        if (!message.appConfig) {
            sendResponse({ok: false, error: "缺少 appConfig"});
            return false;
        }
        encryptAndSaveConfig(message.appConfig)
            .then(() => {
                updateActiveTabIcon().catch(console.error);
                sendResponse({ok: true});
            })
            .catch((error) => sendResponse({ok: false, error: error.message}));
        return true;
    }

    return false;
});
