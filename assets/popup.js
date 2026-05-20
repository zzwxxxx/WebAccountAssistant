import {c as U, j as e, r as f} from "./client.js";
import {r as $, w as k, c as D} from "./storage.js";
import {ensureSensitiveAccess as WAAensureSensitiveAccess} from "./security-gate.js";

function WAAshowInlineError(n) {
    let t = document.getElementById("waa-inline-error-toast");
    t || (t = document.createElement("div"), t.id = "waa-inline-error-toast", Object.assign(t.style, {
        position: "fixed",
        left: "50%",
        top: "20px",
        transform: "translateX(-50%)",
        zIndex: "2147483647",
        maxWidth: "min(420px, calc(100vw - 32px))",
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#fff1f2",
        border: "1px solid #fecdd3",
        color: "#9f1239",
        boxShadow: "0 12px 28px rgba(15,23,42,.16)",
        font: "13px/1.5 Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif",
        textAlign: "center"
    }), document.body.appendChild(t)), t.textContent = n || "操作失败", t.style.display = "block", clearTimeout(window.__waaInlineErrorTimer), window.__waaInlineErrorTimer = setTimeout(() => {
        t.style.display = "none"
    }, 2600)
}

const N = "extensionEnabled";
var C;
const _ = typeof chrome < "u" && ((C = chrome.storage) != null && C.local) ? chrome.storage.local : void 0;

async function R() {
    return _ ? (await _.get(N))[N] !== !1 : !0
}

async function O(s) {
    _ && await _.set({[N]: s})
}

function A(s) {
    return s.replace(/^www\./, "").toLowerCase()
}

function b(s, t) {
    const a = A(t.host || t.hostname), r = `${t.pathname}${t.search ?? ""}${t.hash ?? ""}`;
    for (const o of s.projects) for (const c of o.envs) {
        const n = c.hosts.some(p => {
            const u = A(p);
            return u === a || a.endsWith(`.${u}`) || a === u
        }), d = c.pathKeywords.some(p => r.includes(p));
        if (n && d) return {
            project: o,
            env: c,
            fields: o.fields.slice().sort((p, u) => (p.order ?? 0) - (u.order ?? 0))
        }
    }
    return null
}

function P() {
    var r, o, c;
    const s = ((c = (o = (r = chrome.runtime) == null ? void 0 : r.getManifest) == null ? void 0 : o.call(r)) == null ? void 0 : c.version) ?? "0.1";
    return "v" + s
}

function g(s) {
    const t = new URL(s);
    return {host: t.host, hostname: t.hostname, pathname: t.pathname, search: t.search, hash: t.hash}
}

function q(s, t) {
    const a = s.fields.filter(r => !r.sensitive && !/password|passwd|pass|pwd|密码|口令/i.test(`${r.key ?? ""} ${r.label ?? ""}`)).map(r => t.values[r.key] ?? "").filter(Boolean).map(r => String(r));
    return a.length ? a : ["未填写非敏感字段"]
}

function H(s) {
    return s.join("｜")
}

function J(s) {
    const t = s?.message ?? String(s ?? "");
    return /No tab with id|Receiving end does not exist|Could not establish connection/i.test(t)
}

async function X(s) {
    try {
        return await chrome.tabs.get(s)
    } catch (t) {
        if (J(t)) return null;
        throw t
    }
}

async function Y(s, t) {
    try {
        return await chrome.tabs.sendMessage(s, t)
    } catch (a) {
        if (J(a)) return {ok: !1, error: "当前标签页已刷新或关闭，请重新打开插件后再试"};
        throw a
    }
}

function B(s, t) {
    var o;
    const a = {};
    for (const c of s.fields) a[c.key] = ((o = t == null ? void 0 : t.values) == null ? void 0 : o[c.key]) ?? "";
    const r = typeof crypto < "u" && typeof crypto.randomUUID == "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return {
        id: (t == null ? void 0 : t.id) ?? `account-${r}`,
        values: a,
        isDefault: (t == null ? void 0 : t.isDefault) ?? !1,
        updatedAt: (t == null ? void 0 : t.updatedAt) ?? new Date().toISOString()
    }
}

function L(s, t, a, r) {
    var c;
    const o = D(s);
    return o.projects = o.projects.map(n => n.id !== t ? n : {
        ...n, envs: n.envs.map(d => {
            if (d.id !== a) return d;
            const p = d.accounts.some(u => u.id === r.id) ? d.accounts.map(u => u.id === r.id ? r : u) : [...d.accounts, r];
            return {...d, accounts: r.isDefault ? p.map(u => ({...u, isDefault: u.id === r.id})) : p}
        })
    }), o.meta = {
        ...o.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((c = o.meta) == null ? void 0 : c.localRevision) ?? 0) + 1
    }, o
}

function W(s, t, a, r) {
    var c;
    const o = D(s);
    return o.projects = o.projects.map(n => n.id !== t ? n : {
        ...n,
        envs: n.envs.map(d => d.id !== a ? d : {...d, accounts: d.accounts.filter(p => p.id !== r)})
    }), o.meta = {
        ...o.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((c = o.meta) == null ? void 0 : c.localRevision) ?? 0) + 1
    }, o
}

function z({state: s, project: t, onClose: a, onSave: r, onDelete: o}) {
    const [c, n] = f.useState(null), [d, p] = f.useState({}), [S, T] = f.useState({});
    if (f.useEffect(() => {
        !s.open || !t || (n(B(t, s.account ?? void 0)), p({}), T({}))
    }, [t, s.account, s.open]), !s.open || !t || !c) return null;
    const u = t, w = c;

    function x() {
        const m = Object.fromEntries(u.fields.filter(h => h.required && !String(w.values[h.key] ?? "").trim()).map(h => [h.key, !0]));
        p(m), !(Object.keys(m).length > 0) && r({...w, updatedAt: new Date().toISOString()})
    }

    return e.jsx("div", {
        className: "wm-overlay", role: "presentation", children: e.jsxs("div", {
            className: "wm-modal wm-account-editor-modal",
            children: [e.jsxs("div", {
                className: "wm-modal__header",
                children: [e.jsx("strong", {children: s.account ? "编辑账号" : "新增账号"}), e.jsx("button", {
                    className: "wm-icon-btn",
                    type: "button",
                    onClick: a,
                    children: "×"
                })]
            }), e.jsxs("div", {
                className: "wm-modal__body", children: [u.fields.map(m => e.jsxs("label", {
                    className: "wm-field wm-field--aligned",
                    children: [e.jsxs("span", {
                        children: [m.label, m.required ? e.jsx("b", {
                            className: "wm-required",
                            children: "*"
                        }) : null]
                    }), e.jsxs("div", {
                        className: "wm-field__control",
                        children: [e.jsx("input", {
                            className: d[m.key] ? "wm-input--error" : void 0,
                            type: m.sensitive && !S[m.key] ? "password" : "text",
                            placeholder: m.sensitive && w.values[m.key] && typeof w.values[m.key] == "object" && w.values[m.key].__waaEncrypted ? "已加密，点击眼睛查看或重新输入" : void 0,
                            value: w.values[m.key] && typeof w.values[m.key] == "object" && w.values[m.key].__waaEncrypted ? "******" : w.values[m.key] ?? "",
                            onFocus: h => {
                                w.values[m.key] && typeof w.values[m.key] == "object" && w.values[m.key].__waaEncrypted && h.currentTarget.select()
                            },
                            onChange: h => {
                                const j = h.target.value;
                                if (j === "******" && w.values[m.key] && typeof w.values[m.key] == "object" && w.values[m.key].__waaEncrypted) return;
                                n({...w, values: {...w.values, [m.key]: j}}), j.trim() && p(y => {
                                    const v = {...y};
                                    return delete v[m.key], v
                                })
                            }
                        }), m.sensitive ? e.jsx("button", {
                            className: "wm-icon-btn wm-secret-toggle",
                            type: "button",
                            title: S[m.key] ? "隐藏明文" : "查看明文",
                            "aria-label": S[m.key] ? "隐藏明文" : "查看明文",
                            onClick: async () => {
                                if (S[m.key]) {
                                    T(h => ({...h, [m.key]: !1}));
                                    return
                                }
                                try {
                                    if (await WAAensureSensitiveAccess()) {
                                        let V = w.values[m.key];
                                        if (V && typeof V === "object" && V.__waaEncrypted) {
                                            let R = await chrome.runtime.sendMessage({type: "DECRYPT_VALUE", value: V});
                                            if (!R?.ok) throw new Error(R?.error ?? "解密失败");
                                            n({...w, values: {...w.values, [m.key]: R.value ?? ""}})
                                        }
                                        T(h => ({...h, [m.key]: !0}))
                                    }
                                } catch (_err) {
                                    WAAshowInlineError(_err.message)
                                }
                            },
                            children: S[m.key] ? "🔒" : "👁"
                        }) : null, d[m.key] ? e.jsx("small", {className: "wm-field__error", children: "必填"}) : null]
                    })]
                }, m.key)), e.jsxs("label", {
                    className: "wm-field wm-field--aligned wm-field--check",
                    children: [e.jsx("span", {children: "默认账号"}), e.jsx("div", {
                        className: "wm-field__control",
                        children: e.jsx("button", {
                            className: w.isDefault ? "wm-switch wm-switch--on" : "wm-switch",
                            type: "button",
                            role: "switch",
                            "aria-checked": w.isDefault,
                            onClick: () => n({...w, isDefault: !w.isDefault}),
                            children: e.jsx("span", {className: "wm-switch__knob"})
                        })
                    })]
                })]
            }), e.jsxs("div", {
                className: "wm-modal__footer",
                children: [e.jsx("div", {
                    children: s.account ? e.jsx("button", {
                        type: "button",
                        className: "wm-btn wm-btn--danger",
                        onClick: () => o(s.account),
                        children: "删除"
                    }) : null
                }), e.jsxs("div", {
                    className: "wm-inline",
                    children: [e.jsx("button", {
                        type: "button",
                        className: "wm-btn",
                        onClick: a,
                        children: "取消"
                    }), e.jsx("button", {
                        type: "button",
                        className: "wm-btn wm-btn--primary",
                        onClick: x,
                        children: "保存"
                    })]
                })]
            })]
        })
    })
}

function F() {
    const [s, t] = f.useState(!0), [a, r] = f.useState(null), [o, c] = f.useState(null), [n, d] = f.useState(null), [p, u] = f.useState(!1), [w, x] = f.useState(""), [m, h] = f.useState({
        open: !1,
        account: null
    });
    f.useEffect(() => {
        R().then(t), (async () => {
            try {
                const l = await chrome.tabs.query({active: !0, currentWindow: !0}), i = l[0] ?? null;
                if (r(i), !(i != null && i.url) || !/^https?:/.test(i.url)) return;
                const S = await $();
                c(S), d(b(S, g(i.url)))
            } catch (l) {
                x(J(l) ? "当前标签页不可用，请刷新页面后重试" : l.message ?? "读取当前标签页失败")
            }
        })()
    }, []), f.useEffect(() => {
        const l = (i, S) => {
            S === "local" && i[N] && t(i[N].newValue !== !1)
        };
        return chrome.storage?.onChanged?.addListener(l), () => chrome.storage?.onChanged?.removeListener(l)
    }, []), f.useEffect(() => {
        u(!1)
    }, [n == null ? void 0 : n.project.id, n == null ? void 0 : n.env.id]);

    async function j() {
        const l = !s;
        t(l), await O(l)
    }

    function y() {
        chrome.tabs.create({url: chrome.runtime.getURL("extension.html")}), window.close()
    }

    function V() {
        chrome.tabs.create({url: `${chrome.runtime.getURL("extension.html")}#changelog`}), window.close()
    }

    function Q() {
        chrome.tabs.create({url: chrome.runtime.getURL("install.html")}), window.close()
    }

    function K() {
        chrome.tabs.create({url: "https://github.com/zzwxxxx/WebAccountAssistant"}), window.close()
    }

    async function v(l) {
        if (a != null && a.id) {
            x("");
            try {
                const i = await X(a.id);
                if (!i) {
                    x("当前标签页已关闭或不可用，请重新打开插件后再试");
                    return
                }
                const S = await Y(a.id, {type: "WAA_FILL_ACCOUNT", accountId: l.id});
                if (!(S != null && S.ok)) {
                    x((S == null ? void 0 : S.error) ?? "填充失败");
                    return
                }
                window.close()
            } catch (i) {
                x(i.message)
            }
        }
    }

    async function I(l) {
        if (!o || !n || !(a != null && a.url)) return;
        const i = L(o, n.project.id, n.env.id, l);
        await k(i), c(i), d(b(i, g(a.url))), u(!0), h({open: !1, account: null})
    }

    async function M(l) {
        if (!o || !n || !(a != null && a.url)) return;
        const i = W(o, n.project.id, n.env.id, l.id);
        await k(i), c(i), d(b(i, g(a.url))), u(!0), h({open: !1, account: null})
    }

    function E(l) {
        x(""), h({open: !0, account: l})
    }

    return e.jsxs("div", {
        className: "wm-popup-stage", children: e.jsxs("main", {
            className: "wm-popup",
            children: [e.jsx("header", {
                className: "wm-popup__header",
                children: e.jsx("strong", {children: "账号管理助手"})
            }), e.jsxs("button", {
                className: "wm-popup__switch-row",
                type: "button",
                role: "switch",
                "aria-checked": s,
                onClick: () => void j(),
                children: [e.jsx("span", {
                    className: "wm-popup__switch-label",
                    children: "账号弹窗"
                }), e.jsx("span", {
                    className: `wm-switch ${s ? "wm-switch--on" : ""}`,
                    children: e.jsx("span", {className: "wm-switch__knob"})
                })]
            }), e.jsxs("div", {
                className: "wm-popup__match",
                children: [e.jsxs("div", {
                    className: `wm-popup__item wm-popup__match-row ${n ? "" : "wm-popup__match-row--empty"} ${n && p ? "wm-popup__match-row--open" : ""}`,
                    children: [e.jsx("span", {
                        className: "wm-popup__match-label",
                        children: n ? `${n.project.name}-${n.env.name}` : "未配置环境"
                    }), n ? e.jsx("span", {
                        className: "wm-popup__actions",
                        children: e.jsx("button", {
                            className: "wm-popup__icon",
                            type: "button",
                            "aria-label": p ? "收起账号列表" : "展开账号列表",
                            "aria-expanded": p,
                            title: p ? "收起账号列表" : "展开账号列表",
                            onClick: () => u(l => !l),
                            children: e.jsx("img", {
                                className: "wm-popup__icon-img",
                                src: p ? "icons/menu/down.png" : "icons/menu/right.png",
                                alt: "",
                                "aria-hidden": "true"
                            })
                        })
                    }) : null]
                }), n && p ? e.jsxs("div", {
                    className: "wm-popup__accounts",
                    children: [n.env.accounts.length === 0 ? e.jsx("div", {
                        className: "wm-popup__empty",
                        children: "暂无账号"
                    }) : null, n.env.accounts.map(l => {
                        const i = q(n, l), S = H(i);
                        return e.jsx("div", {
                            className: "wm-popup__account-row",
                            children: e.jsxs("button", {
                                className: "wm-popup__account",
                                type: "button",
                                title: S,
                                onClick: () => void v(l),
                                children: [e.jsx("span", {
                                    className: "wm-popup__account-summary",
                                    style: {gridTemplateColumns: `repeat(${i.length}, minmax(0, 1fr))`},
                                    children: i.map((T, W) => e.jsxs("span", {
                                        className: "wm-popup__account-part",
                                        children: [W > 0 ? e.jsx("span", {
                                            className: "wm-popup__account-sep",
                                            children: "｜"
                                        }) : null, e.jsx("span", {
                                            className: "wm-popup__account-text",
                                            children: T
                                        })]
                                    }, `${W}-${T}`))
                                }), e.jsx("span", {className: "wm-popup__account-tooltip", children: S})]
                            })
                        }, l.id)
                    })]
                }) : null]
            }), e.jsx("button", {
                className: "wm-popup__item",
                type: "button",
                onClick: y,
                children: e.jsx("span", {children: "管理面板"})
            }), w ? e.jsx("div", {
                className: "wm-popup__status",
                children: w
            }) : null, e.jsx("div", {
                className: "wm-popup__footer",
                children: e.jsxs("div", {
                    className: "wm-popup__links",
                    "aria-label": "辅助链接",
                    children: [e.jsx("button", {
                        className: "wm-popup__version",
                        type: "button",
                        title: "安装教程",
                        onClick: Q,
                        children: P()
                    }), e.jsx("button", {
                        className: "wm-popup__link",
                        type: "button",
                        onClick: V,
                        children: "更新日志"
                    }), e.jsx("button", {
                        className: "wm-popup__github",
                        type: "button",
                        "aria-label": "GitHub",
                        title: "GitHub",
                        onClick: K,
                        children: e.jsx("svg", {
                            className: "wm-popup__github-icon",
                            viewBox: "0 0 24 24",
                            "aria-hidden": "true",
                            children: e.jsx("path", {d: "M12 2.2A9.8 9.8 0 0 0 8.9 21.3c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1 1.6 1 .9 1.5 2.4 1.1 2.9.8.1-.6.4-1.1.7-1.3-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z"})
                        })
                    })]
                })
            })]
        })
    })
}

U(document.getElementById("root")).render(e.jsx(F, {}));
