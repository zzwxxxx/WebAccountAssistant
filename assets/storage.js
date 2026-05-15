const STORAGE_KEY = "appConfig";
const SCHEMA_VERSION = "1.0";
const DEFAULT_GROUP_CODE = "default";

const DEFAULT_CONFIG = {
  schemaVersion: SCHEMA_VERSION,
  global: { showLoginAccountPanel: true },
  projectGroups: [{ code: DEFAULT_GROUP_CODE, name: "默认分组", description: "" }],
  fieldTemplates: [],
  projects: [],
  sync: { minioEnabled: false },
  meta: { localRevision: 1 }
};

const DEFAULT_POPUP_POSITION = "top-right";
const POPUP_POSITIONS = [
  { value: "top-left", label: "左上方" },
  { value: "left", label: "左侧" },
  { value: "bottom-left", label: "左下方" },
  { value: "top", label: "正上方" },
  { value: "center", label: "居中" },
  { value: "bottom", label: "正下方" },
  { value: "top-right", label: "右上方" },
  { value: "right", label: "右侧" },
  { value: "bottom-right", label: "右下方" }
];

const SENSITIVE_WORDS = ["password", "passwd", "pass", "pwd", "密码", "口令"];
const storage = typeof chrome !== "undefined" && chrome.storage?.local ? chrome.storage.local : undefined;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function includesSensitiveWord(value) {
  const text = (value ?? "").toLowerCase();
  return SENSITIVE_WORDS.some((word) => text.includes(word));
}

function isProbablySensitiveField(field) {
  return includesSensitiveWord(field.key) || includesSensitiveWord(field.label);
}

function isPasswordSelector(selector) {
  const text = (selector ?? "").trim().toLowerCase();
  return text ? text.includes('type="password"') || text.includes("type='password'") || includesSensitiveWord(text) : false;
}

function isValidPopupPosition(value) {
  return POPUP_POSITIONS.some((item) => item.value === value);
}

function normalizeFields(fields) {
  const displayFields = fields.filter((field) => field.type === "display");
  for (const field of fields) {
    field.copyable = field.copyable !== false;
    if (field.type !== "input" || field.selector?.trim() || !isProbablySensitiveField(field)) continue;
    const selector = displayFields.find((item) => isPasswordSelector(item.selector))?.selector?.trim();
    if (selector) field.selector = selector;
  }
  for (const field of displayFields) delete field.selector;
  return fields;
}

function normalizeConfig(config) {
  const next = clone(config);
  if (!isObject(next) || !Array.isArray(next.projects)) return next;

  if (isObject(next.global)) {
    next.global.showLoginAccountPanel = next.global.showLoginAccountPanel !== false;
  } else {
    next.global = { showLoginAccountPanel: true };
  }

  if (!Array.isArray(next.projectGroups)) next.projectGroups = [];
  if (!next.projectGroups.some((group) => group.code === DEFAULT_GROUP_CODE)) {
    next.projectGroups.unshift({ code: DEFAULT_GROUP_CODE, name: "默认分组", description: "" });
  }

  if (!Array.isArray(next.fieldTemplates)) next.fieldTemplates = [];
  const groupCodes = new Set(next.projectGroups.map((group) => group.code));

  for (const project of next.projects) {
    if (!isObject(project) || !Array.isArray(project.fields)) continue;
    if (!isValidPopupPosition(project.popupPosition)) project.popupPosition = DEFAULT_POPUP_POSITION;
    if (!project.groupCode || !groupCodes.has(project.groupCode)) project.groupCode = DEFAULT_GROUP_CODE;
    project.fields = normalizeFields(project.fields);
  }

  for (const template of next.fieldTemplates) {
    if (Array.isArray(template.fields)) template.fields = normalizeFields(template.fields);
  }

  return next;
}

function isServiceWorkerContext() {
  return typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope;
}

async function readRawConfig() {
  if (!storage) return clone(DEFAULT_CONFIG);
  const data = await storage.get(STORAGE_KEY);
  return !data || !data[STORAGE_KEY] ? clone(DEFAULT_CONFIG) : normalizeConfig(data[STORAGE_KEY]);
}

async function readConfig() {
  const raw = await readRawConfig();
  if (isServiceWorkerContext() || !chrome.runtime?.sendMessage) return raw;
  try {
    const response = await chrome.runtime.sendMessage({ type: "DECRYPT_APP_CONFIG" });
    if (response?.ok && response.appConfig) return normalizeConfig(response.appConfig);
  } catch {
    // Fall back to encrypted-at-rest config when the service worker is unavailable.
  }
  return raw;
}

async function saveConfig(config) {
  const normalized = normalizeConfig(config);
  if (!storage) return;
  if (!isServiceWorkerContext() && chrome.runtime?.sendMessage) {
    let response = await chrome.runtime.sendMessage({ type: "SAVE_APP_CONFIG", appConfig: normalized });
    if (!response?.ok && /通行密钥验证/.test(response?.error ?? "")) {
      const unlock = await chrome.runtime.sendMessage({ type: "UNLOCK_SENSITIVE" });
      if (!unlock?.ok) throw new Error(unlock?.error ?? "敏感操作验证失败");
      response = await chrome.runtime.sendMessage({ type: "SAVE_APP_CONFIG", appConfig: normalized });
    }
    if (!response?.ok) throw new Error(response?.error ?? "保存配置失败");
    return;
  }
  await storage.set({ [STORAGE_KEY]: normalized });
}

async function ensureConfig() {
  const config = await readConfig();
  return config.projects ? config : (await saveConfig(DEFAULT_CONFIG), clone(DEFAULT_CONFIG));
}

export {
  DEFAULT_CONFIG as D,
  POPUP_POSITIONS as P,
  SCHEMA_VERSION as S,
  DEFAULT_GROUP_CODE as a,
  DEFAULT_POPUP_POSITION as b,
  clone as c,
  ensureConfig as e,
  isValidPopupPosition as i,
  normalizeConfig as n,
  readConfig as r,
  saveConfig as w
};
