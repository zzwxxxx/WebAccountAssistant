import { e as ensureConfig, w as saveConfig, r as readConfig, D as defaultConfig } from "./assets/storage.js";

const ENABLED_KEY = "extensionEnabled";

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
      if (hostMatched && pathMatched) return { project, env };
    }
  }

  return null;
}

async function isEnabled() {
  const storage = chrome.storage?.local;
  if (!storage) return true;
  const data = await storage.get(ENABLED_KEY);
  return data[ENABLED_KEY] !== false;
}

async function setToolbarIcon(tabId, matched) {
  if (!chrome.action?.setIcon || !tabId) return;
  await chrome.action.setIcon({
    tabId,
    path: matched ? ACTIVE_ICON : INACTIVE_ICON
  });
}

async function updateTabIcon(tab) {
  if (!tab?.id) return;
  const enabled = await isEnabled();
  if (!enabled) {
    await setToolbarIcon(tab.id, false);
    return;
  }

  const config = await readConfig();
  const matched = !!matchEnvironment(config, parseUrl(tab.url));
  await setToolbarIcon(tab.id, matched);
}

async function updateActiveTabIcon() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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

chrome.tabs.onActivated?.addListener(({ tabId }) => {
  chrome.tabs.get(tabId).then(updateTabIcon).catch(console.error);
});

chrome.tabs.onUpdated?.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    updateTabIcon({ ...tab, id: tabId }).catch(console.error);
  }
});

chrome.storage?.onChanged?.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.appConfig || changes[ENABLED_KEY])) {
    updateActiveTabIcon().catch(console.error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_APP_CONFIG") {
    readConfig()
      .then((appConfig) => sendResponse({ ok: true, appConfig }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message?.type === "SAVE_APP_CONFIG") {
    if (!message.appConfig) {
      sendResponse({ ok: false, error: "缺少 appConfig" });
      return false;
    }
    saveConfig(message.appConfig)
      .then(() => {
        updateActiveTabIcon().catch(console.error);
        sendResponse({ ok: true });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  return false;
});
