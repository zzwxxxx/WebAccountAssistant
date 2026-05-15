import {r as p, j as e, c as Ns} from "./client.js";
import {S as _e, a as A, i as Cs, n as ks, c as Y, b as Ge, P as Ss, r as _s, w as Ts} from "./storage.js";
import {ensureSensitiveAccess as WAAensureSensitiveAccess} from "./security-gate.js";

function WAAshowInlineError(n, t = "error") {
    let i = document.getElementById("waa-message-dialog");
    i && i.remove(), window.__waaMessageTimer && window.clearTimeout(window.__waaMessageTimer);
    let a = document.createElement("div"), o = document.createElement("div"), h = document.createElement("span"),
        u = document.createElement("div"), d = document.createElement("div"), j = document.createElement("div"),
        g = t === "success" ? ["操作成功", "#0f9d58", "#e8f7ee", "✓"] : t === "warning" ? ["提示", "#d97706", "#fff7ed", "!"] : ["操作失败", "#dc2626", "#fff1f2", "!"];
    a.id = "waa-message-dialog", Object.assign(a.style, {
        position: "fixed",
        left: "50%",
        top: "18px",
        zIndex: "2147483647",
        transform: "translate(-50%, -8px)",
        opacity: "0",
        transition: "opacity .18s ease, transform .18s ease",
        pointerEvents: "none"
    }), Object.assign(o.style, {
        display: "grid",
        gridTemplateColumns: "28px minmax(0,1fr)",
        gap: "10px",
        alignItems: "start",
        width: "min(420px, calc(100vw - 32px))",
        background: "rgba(255,255,255,.98)",
        border: "1px solid #e5e7eb",
        borderLeft: `4px solid ${g[1]}`,
        borderRadius: "10px",
        boxShadow: "0 16px 40px rgba(15,23,42,.18)",
        padding: "12px 14px",
        font: "14px/1.45 Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif",
        color: "#111827",
        backdropFilter: "blur(10px)"
    }), Object.assign(h.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "999px",
        background: g[2],
        color: g[1],
        fontWeight: "700",
        lineHeight: "28px"
    }), Object.assign(u.style, {display: "grid", gap: "3px", minWidth: "0"}), Object.assign(d.style, {
        fontWeight: "600",
        color: "#111827"
    }), Object.assign(j.style, {
        color: "#374151",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap"
    }), h.textContent = g[3], d.textContent = g[0], j.textContent = n || g[0], u.append(d, j), o.append(h, u), a.append(o), document.body.appendChild(a), requestAnimationFrame(() => {
        a.style.opacity = "1", a.style.transform = "translate(-50%, 0)"
    }), window.__waaMessageTimer = window.setTimeout(() => {
        a.style.opacity = "0", a.style.transform = "translate(-50%, -8px)", window.setTimeout(() => a.remove(), 180), window.__waaMessageTimer = null
    }, 1200)
}

function WAAconfirmInline(n) {
    return new Promise(t => {
        let i = document.getElementById("waa-confirm-dialog");
        i && i.remove();
        let a = document.createElement("div"), o = document.createElement("div"), h = document.createElement("div"),
            u = document.createElement("div"), d = document.createElement("button"),
            j = document.createElement("button");
        a.id = "waa-confirm-dialog", Object.assign(a.style, {
            position: "fixed",
            inset: "0",
            zIndex: "2147483647",
            background: "rgba(15,23,42,.28)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px"
        }), Object.assign(o.style, {
            width: "min(360px, calc(100vw - 32px))",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            boxShadow: "0 18px 45px rgba(15,23,42,.22)",
            padding: "18px",
            font: "14px/1.5 Inter, PingFang SC, Microsoft YaHei, system-ui, sans-serif",
            color: "#111827"
        }), Object.assign(h.style, {
            fontWeight: "600",
            marginBottom: "16px",
            wordBreak: "break-word"
        }), Object.assign(u.style, {
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px"
        }), Object.assign(d.style, {
            height: "34px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "#fff",
            color: "#374151",
            cursor: "pointer"
        }), Object.assign(j.style, {
            height: "34px",
            padding: "0 14px",
            borderRadius: "8px",
            border: "1px solid #dc2626",
            background: "#dc2626",
            color: "#fff",
            cursor: "pointer"
        }), h.textContent = n || "确认继续？", d.textContent = "取消", j.textContent = "确认", u.append(d, j), o.append(h, u), a.append(o);
        let g = b => {
            a.remove(), t(b)
        };
        a.addEventListener("click", b => {
            b.target === a && g(!1)
        }), d.addEventListener("click", () => g(!1)), j.addEventListener("click", () => g(!0)), document.body.appendChild(a), j.focus()
    })
}

function Q(n = "id") {
    return typeof crypto < "u" && typeof crypto.randomUUID == "function" ? `${n}-${crypto.randomUUID()}` : `${n}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function Te(n, t) {
    var a;
    const i = {};
    for (const o of n.fields) i[o.key] = ((a = t == null ? void 0 : t.values) == null ? void 0 : a[o.key]) ?? "";
    return {
        id: (t == null ? void 0 : t.id) ?? Q("account"),
        values: i,
        isDefault: (t == null ? void 0 : t.isDefault) ?? !1,
        updatedAt: (t == null ? void 0 : t.updatedAt) ?? new Date().toISOString()
    }
}

function Is({open: n, project: t, account: i, title: a, onClose: o, onSave: h, onDelete: u}) {
    const d = p.useMemo(() => t ? Te(t, i ?? void 0) : null, [i, t]), [j, g] = p.useState(d), [b, x] = p.useState({}), [S, P] = p.useState({});
    if (p.useEffect(() => {
        !n || !t || (g(Te(t, i ?? void 0)), x({}), P({}))
    }, [i, n, t]), !n || !t || !j) return null;

    function m() {
        if (!t || !j) return;
        const w = Object.fromEntries(t.fields.filter(y => y.required && !String(j.values[y.key] ?? "").trim()).map(y => [y.key, !0]));
        if (x(w), Object.keys(w).length > 0) {
            WAAshowInlineError("请填写必填字段");
            return
        }
        h({...j, updatedAt: new Date().toISOString()})
    }

    return e.jsx("div", {
        className: "wm-overlay", role: "presentation", children: e.jsxs("div", {
            className: "wm-modal wm-account-editor-modal",
            children: [e.jsxs("div", {
                className: "wm-modal__header",
                children: [e.jsx("strong", {children: a}), e.jsx("button", {
                    className: "wm-icon-btn",
                    type: "button",
                    onClick: o,
                    children: "×"
                })]
            }), e.jsxs("div", {
                className: "wm-modal__body",
                children: [e.jsxs("label", {
                    className: "wm-field wm-field--aligned",
                    style: {display: "none"},
                    children: [e.jsxs("span", {
                        children: ["账号 ID ", e.jsx("b", {
                            className: "wm-required",
                            children: "*"
                        })]
                    }), e.jsx("div", {
                        className: "wm-field__control",
                        children: e.jsx("input", {
                            value: j.id,
                            onChange: w => g({...j, id: w.target.value || Q("account")})
                        })
                    })]
                }), t.fields.map(w => e.jsxs("label", {
                    className: "wm-field wm-field--aligned",
                    children: [e.jsxs("span", {
                        children: [w.label, w.required ? e.jsx("b", {
                            className: "wm-required",
                            children: "*"
                        }) : null]
                    }), e.jsxs("div", {
                        className: "wm-field__control",
                        children: [e.jsx("input", {
                            className: b[w.key] ? "wm-input--error" : void 0,
                            type: w.sensitive && !S[w.key] ? "password" : "text",
                            placeholder: w.sensitive && j.values[w.key] && typeof j.values[w.key] == "object" && j.values[w.key].__waaEncrypted ? "已加密，点击眼睛查看或重新输入" : void 0,
                            value: j.values[w.key] && typeof j.values[w.key] == "object" && j.values[w.key].__waaEncrypted ? "******" : j.values[w.key] ?? "",
                            onFocus: y => {
                                j.values[w.key] && typeof j.values[w.key] == "object" && j.values[w.key].__waaEncrypted && y.currentTarget.select()
                            },
                            onChange: y => {
                                const N = y.target.value;
                                if (N === "******" && j.values[w.key] && typeof j.values[w.key] == "object" && j.values[w.key].__waaEncrypted) return;
                                g({...j, values: {...j.values, [w.key]: N}}), N.trim() && x(_ => {
                                    const F = {..._};
                                    return delete F[w.key], F
                                })
                            }
                        }), w.sensitive ? e.jsx("button", {
                            className: "wm-icon-btn wm-secret-toggle",
                            type: "button",
                            title: S[w.key] ? "隐藏明文" : "查看明文",
                            "aria-label": S[w.key] ? "隐藏明文" : "查看明文",
                            onClick: async () => {
                                if (S[w.key]) {
                                    P(y => ({...y, [w.key]: !1}));
                                    return
                                }
                                try {
                                    if (await WAAensureSensitiveAccess()) {
                                        let V = j.values[w.key];
                                        if (V && typeof V === "object" && V.__waaEncrypted) {
                                            let R = await chrome.runtime.sendMessage({type: "DECRYPT_VALUE", value: V});
                                            if (!R?.ok) throw new Error(R?.error ?? "解密失败");
                                            g({...j, values: {...j.values, [w.key]: R.value ?? ""}})
                                        }
                                        P(y => ({...y, [w.key]: !0}))
                                    }
                                } catch (_err) {
                                    WAAshowInlineError(_err.message)
                                }
                            },
                            children: S[w.key] ? "🔒" : "👁"
                        }) : null, b[w.key] ? e.jsx("small", {className: "wm-field__error", children: "必填"}) : null]
                    })]
                }, w.key)), e.jsxs("label", {
                    className: "wm-field wm-field--aligned wm-field--check",
                    children: [e.jsx("span", {children: "默认账号"}), e.jsx("div", {
                        className: "wm-field__control",
                        children: e.jsx("button", {
                            className: j.isDefault ? "wm-switch wm-switch--on" : "wm-switch",
                            type: "button",
                            role: "switch",
                            "aria-checked": j.isDefault,
                            onClick: () => g({...j, isDefault: !j.isDefault}),
                            children: e.jsx("span", {className: "wm-switch__knob"})
                        })
                    })]
                })]
            }), e.jsxs("div", {
                className: "wm-modal__footer",
                children: [e.jsx("div", {
                    children: i && u ? e.jsx("button", {
                        type: "button",
                        className: "wm-btn wm-btn--danger",
                        onClick: () => u(i),
                        children: "删除"
                    }) : null
                }), e.jsxs("div", {
                    className: "wm-inline",
                    children: [e.jsx("button", {
                        type: "button",
                        className: "wm-btn",
                        onClick: o,
                        children: "取消"
                    }), e.jsx("button", {
                        type: "button",
                        className: "wm-btn wm-btn--primary",
                        onClick: m,
                        children: "保存"
                    })]
                })]
            })]
        })
    })
}

function je(n) {
    return !!n && typeof n == "object" && !Array.isArray(n)
}

function W(n) {
    return new Set(n).size === n.length
}

function Je(n, t) {
    var a;
    const i = [];
    return n.key.trim() || i.push({path: t, message: "字段 key 不能为空"}), n.label.trim() || i.push({
        path: t,
        message: "字段名称不能为空"
    }), ["input", "display"].includes(n.type) || i.push({
        path: t,
        message: "字段类型非法"
    }), n.type === "input" && !((a = n.selector) != null && a.trim()) && i.push({
        path: t,
        message: "input 字段必须配置 selector"
    }), n.minWidth !== void 0 && n.minWidth <= 0 && i.push({
        path: t,
        message: "minWidth 必须大于 0"
    }), n.maxWidth !== void 0 && n.maxWidth <= 0 && i.push({
        path: t,
        message: "maxWidth 必须大于 0"
    }), n.minWidth !== void 0 && n.maxWidth !== void 0 && n.minWidth > n.maxWidth && i.push({
        path: t,
        message: "minWidth 不能大于 maxWidth"
    }), i
}

function Os(n, t) {
    const i = [];
    return n.code.trim() || i.push({path: t, message: "分组 code 不能为空"}), n.name.trim() || i.push({
        path: t,
        message: "分组名称不能为空"
    }), i
}

function As(n, t) {
    const i = [];
    if (n.id.trim() || i.push({path: t, message: "模板 id 不能为空"}), n.name.trim() || i.push({
        path: t,
        message: "模板名称不能为空"
    }), !Array.isArray(n.fields) || n.fields.length === 0) i.push({path: t, message: "模板至少需要 1 个字段"}); else {
        const a = n.fields.map(o => o.key);
        W(a) || i.push({path: t, message: "模板字段 key 不能重复"}), n.fields.forEach((o, h) => {
            i.push(...Je(o, `${t}.fields[${h}]`))
        })
    }
    return i
}

function Ds(n, t, i) {
    const a = [];
    n.id.trim() || a.push({path: i, message: "账号 id 不能为空"});
    for (const o of t) o.key in n.values || a.push({
        path: i,
        message: `账号缺少字段值: ${o.key}`
    }), o.required && !String(n.values[o.key] ?? "").trim() && a.push({
        path: i,
        message: `必填字段不能为空: ${o.label || o.key}`
    });
    return a
}

function Ps(n, t, i) {
    const a = [];
    if (n.id.trim() || a.push({path: i, message: "环境 id 不能为空"}), n.name.trim() || a.push({
        path: i,
        message: "环境名称不能为空"
    }), (!Array.isArray(n.hosts) || n.hosts.length === 0) && a.push({
        path: i,
        message: "环境 hosts 不能为空"
    }), (!Array.isArray(n.pathKeywords) || n.pathKeywords.length === 0) && a.push({
        path: i,
        message: "环境 pathKeywords 不能为空"
    }), n.accounts.filter(h => h.isDefault).length > 1 && a.push({
        path: i,
        message: "同一环境最多允许一个默认账号"
    }), !Array.isArray(n.accounts) || n.accounts.length === 0) a.push({path: i, message: "环境账号不能为空"}); else {
        const h = n.accounts.map(u => u.id);
        W(h) || a.push({path: i, message: "账号 id 不能重复"}), n.accounts.forEach((u, d) => {
            a.push(...Ds(u, t, `${i}.accounts[${d}]`))
        })
    }
    return a
}

function Es(n, t, i) {
    var o;
    const a = [];
    if (n.id.trim() || a.push({path: i, message: "项目 id 不能为空"}), n.name.trim() || a.push({
        path: i,
        message: "项目名称不能为空"
    }), (o = n.groupCode) != null && o.trim() ? t.has(n.groupCode) || a.push({
        path: i,
        message: `项目分组不存在: ${n.groupCode}`
    }) : a.push({
        path: i,
        message: "项目分组不能为空"
    }), n.popupPosition !== void 0 && !Cs(n.popupPosition) && a.push({
        path: i,
        message: "弹窗位置非法"
    }), !Array.isArray(n.fields) || n.fields.length === 0) a.push({path: i, message: "项目至少需要 1 个字段"}); else {
        const h = n.fields.map(u => u.key);
        W(h) || a.push({path: i, message: "字段 key 不能重复"}), n.fields.forEach((u, d) => {
            a.push(...Je(u, `${i}.fields[${d}]`))
        })
    }
    if (!Array.isArray(n.envs) || n.envs.length === 0) a.push({path: i, message: "项目至少需要 1 个环境"}); else {
        const h = n.envs.map(u => u.id);
        W(h) || a.push({path: i, message: "环境 id 不能重复"}), n.envs.forEach((u, d) => {
            a.push(...Ps(u, n.fields, `${i}.envs[${d}]`))
        })
    }
    return a
}

function fe(n) {
    if (!je(n)) return {ok: !1, errors: [{path: "", message: "配置必须是对象"}]};
    const t = n, i = [];
    if (t.schemaVersion !== _e && i.push({
        path: "schemaVersion",
        message: `仅支持 schemaVersion=${_e}`
    }), Array.isArray(t.projects) || i.push({
        path: "projects",
        message: "projects 必须是数组"
    }), je(t.global) || i.push({
        path: "global",
        message: "global 必须是对象"
    }), Array.isArray(t.projectGroups) || i.push({
        path: "projectGroups",
        message: "projectGroups 必须是数组"
    }), Array.isArray(t.fieldTemplates) || i.push({
        path: "fieldTemplates",
        message: "fieldTemplates 必须是数组"
    }), je(t.sync) || i.push({
        path: "sync",
        message: "sync 必须是对象"
    }), i.length === 0 && Array.isArray(t.projects) && Array.isArray(t.projectGroups) && Array.isArray(t.fieldTemplates)) {
        const a = t.projectGroups.map(d => d.code);
        W(a) || i.push({
            path: "projectGroups",
            message: "分组 code 不能重复"
        }), a.includes(A) || i.push({
            path: "projectGroups",
            message: "必须包含 default 默认分组"
        }), t.projectGroups.forEach((d, j) => {
            i.push(...Os(d, `projectGroups[${j}]`))
        });
        const o = t.fieldTemplates.map(d => d.id);
        W(o) || i.push({path: "fieldTemplates", message: "模板 id 不能重复"}), t.fieldTemplates.forEach((d, j) => {
            i.push(...As(d, `fieldTemplates[${j}]`))
        });
        const h = t.projects.map(d => d.id);
        W(h) || i.push({path: "projects", message: "项目 id 不能重复"});
        const u = new Set(a);
        t.projects.forEach((d, j) => {
            i.push(...Es(d, u, `projects[${j}]`))
        })
    }
    return {ok: i.length === 0, errors: i, value: t}
}

function Ie(n) {
    return JSON.stringify(n, null, 2)
}

function Oe(n) {
    const t = JSON.parse(n);
    return fe(ks(t))
}

function Re(n, t) {
    const i = new Map;
    for (const a of n) i.set(a.id, I(a));
    for (const a of t) i.set(a.id, I(a));
    return [...i.values()]
}

function I(n) {
    return JSON.parse(JSON.stringify(n))
}

function Ms(n, t) {
    const i = new Map;
    for (const a of n) i.set(a.key, I(a));
    for (const a of t) i.set(a.key, I(a));
    return [...i.values()]
}

function $s(n, t) {
    return Re(n, t)
}

function Ks(n, t) {
    var a;
    const i = new Map;
    for (const o of n) i.set(o.id, I(o));
    for (const o of t) {
        const h = i.get(o.id);
        if (!h) {
            i.set(o.id, I(o));
            continue
        }
        i.set(o.id, {
            ...I(h), ...I(o),
            hosts: [...new Set([...h.hosts ?? [], ...o.hosts ?? []])],
            pathKeywords: [...new Set([...h.pathKeywords ?? [], ...o.pathKeywords ?? []])],
            retryDelays: (a = o.retryDelays) != null && a.length ? [...o.retryDelays] : [...h.retryDelays],
            accounts: $s(h.accounts ?? [], o.accounts ?? [])
        })
    }
    return [...i.values()]
}

function Fs(n, t) {
    const i = new Map;
    for (const a of n) i.set(a.id, I(a));
    for (const a of t) {
        const o = i.get(a.id);
        if (!o) {
            i.set(a.id, I(a));
            continue
        }
        i.set(a.id, {
            ...I(o), ...I(a),
            fields: Ms(o.fields ?? [], a.fields ?? []),
            envs: Ks(o.envs ?? [], a.envs ?? [])
        })
    }
    return [...i.values()]
}

function Gs(n, t) {
    const i = new Map;
    for (const a of n) i.set(a.code, I(a));
    for (const a of t) i.set(a.code, I(a));
    return [...i.values()]
}

function Js(n, t) {
    return Re(n, t)
}

function Rs(n, t, i) {
    var h, u;
    const a = Y(n);
    a.projectGroups = Gs(n.projectGroups ?? [], t.projectGroups ?? []), a.fieldTemplates = Js(n.fieldTemplates ?? [], t.fieldTemplates ?? []), a.projects = Fs(n.projects ?? [], t.projects ?? []), a.sync = {...n.sync, ...t.sync}, a.meta = {
        ...n.meta ?? {}, ...t.meta ?? {},
        localRevision: Math.max(((h = n.meta) == null ? void 0 : h.localRevision) ?? 0, ((u = t.meta) == null ? void 0 : u.localRevision) ?? 0) + 1
    };
    const o = [];
    return o.push("云端同步已覆盖本地同 id 配置项，本地未删除数据已保留。"), {config: a, warnings: o}
}

function Bs(n) {
    return n.replace(/\/+$/, "")
}

function Ws(...n) {
    return n.filter(Boolean).map(t => String(t).replace(/^\/+|\/+$/g, "")).filter(Boolean).join("/")
}

function Be(n) {
    if (!n.endpoint) throw new Error("MinIO endpoint 未配置");
    const t = Bs(n.endpoint), i = Ws(n.bucket, n.pathPrefix, n.objectKey ?? "app-config.json");
    return `${t}/${i}`
}

async function Us(n) {
    const t = await fetch(Be(n), {
        method: "GET",
        headers: n.accessKey && n.secretKey ? {
            "X-MinIO-Access-Key": n.accessKey,
            "X-MinIO-Secret-Key": n.secretKey
        } : void 0
    });
    if (!t.ok) throw new Error(`拉取远端配置失败: ${t.status}`);
    return await t.json()
}

async function Ls(n, t) {
    const i = await fetch(Be(n), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json", ...n.accessKey && n.secretKey ? {
                "X-MinIO-Access-Key": n.accessKey,
                "X-MinIO-Secret-Key": n.secretKey
            } : {}
        },
        body: JSON.stringify(t, null, 2)
    });
    if (!i.ok) throw new Error(`推送远端配置失败: ${i.status}`)
}

function We(n, t) {
    const i = n.map(o => JSON.parse(JSON.stringify(o))), a = i.findIndex(o => o.id === t.id);
    return a >= 0 ? (i[a] = JSON.parse(JSON.stringify(t)), i) : (i.push(JSON.parse(JSON.stringify(t))), i)
}

function Ae(n, t) {
    var a;
    const i = Y(n);
    return i.projects = We(i.projects, t), i.meta = {
        ...i.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((a = i.meta) == null ? void 0 : a.localRevision) ?? 0) + 1
    }, i
}

function qs(n, t) {
    var a;
    const i = Y(n);
    return i.projects = i.projects.filter(o => o.id !== t), i.meta = {
        ...i.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((a = i.meta) == null ? void 0 : a.localRevision) ?? 0) + 1
    }, i
}

function De(n, t, i, a) {
    var h;
    const o = Y(n);
    return o.projects = o.projects.map(u => u.id !== t ? u : {
        ...u, envs: u.envs.map(d => {
            if (d.id !== i) return d;
            const j = We(d.accounts, a);
            return a.isDefault ? {...d, accounts: j.map(g => ({...g, isDefault: g.id === a.id}))} : {...d, accounts: j}
        })
    }), o.meta = {
        ...o.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((h = o.meta) == null ? void 0 : h.localRevision) ?? 0) + 1
    }, o
}

function Vs(n, t, i, a) {
    var h;
    const o = Y(n);
    return o.projects = o.projects.map(u => u.id !== t ? u : {
        ...u,
        envs: u.envs.map(d => d.id !== i ? d : {...d, accounts: d.accounts.filter(j => j.id !== a)})
    }), o.meta = {
        ...o.meta ?? {},
        lastUpdatedAt: new Date().toISOString(),
        localRevision: (((h = o.meta) == null ? void 0 : h.localRevision) ?? 0) + 1
    }, o
}

function ie({open: n, title: t, width: i = 900, onClose: a, children: o, footer: h}) {
    return n ? e.jsx("div", {
        className: "wm-overlay",
        role: "presentation",
        children: e.jsxs("div", {
            className: "wm-modal",
            style: {width: `min(${i}px, calc(100vw - 32px))`},
            children: [e.jsxs("div", {
                className: "wm-modal__header",
                children: [e.jsx("strong", {children: t}), e.jsx("button", {
                    className: "wm-icon-btn",
                    type: "button",
                    onClick: a,
                    children: "×"
                })]
            }), e.jsx("div", {
                className: "wm-modal__body",
                children: o
            }), h ? e.jsx("div", {className: "wm-modal__footer", children: h}) : null]
        })
    }) : null
}

function U(n) {
    return JSON.parse(JSON.stringify(n))
}

function zs(n, t, i) {
    const a = [...n], [o] = a.splice(t, 1);
    return a.splice(i, 0, o), a
}

function Xs(n) {
    return n.join(", ")
}

function Pe(n) {
    return n.join(", ")
}

function Ee(n) {
    return n.split(",").map(t => t.trim()).filter(Boolean)
}

function Hs(n) {
    return n.split(",").map(t => Number(t.trim())).filter(t => Number.isFinite(t))
}

function Qs({open: n, project: t, groups: i, fieldTemplates: a, title: o, onClose: h, onSave: u}) {
    const [d, j] = p.useState(t), [g, b] = p.useState("");
    p.useEffect(() => {
        !n || !t || (j(U(t)), b(""))
    }, [n, t]);
    const x = !!(d != null && d.id.trim() && (d != null && d.name.trim()));
    return e.jsx(ie, {
        open: n && !!d,
        title: o,
        width: 640,
        onClose: h,
        footer: e.jsxs(e.Fragment, {
            children: [e.jsx("button", {
                type: "button",
                className: "wm-btn",
                onClick: h,
                children: "取消"
            }), e.jsx("button", {
                type: "button", className: "wm-btn wm-btn--primary", onClick: () => {
                    if (!x) {
                        WAAshowInlineError("项目 ID 和名称不能为空");
                        return
                    }
                    d && u({...d, fields: d.fields ?? [], envs: d.envs ?? []})
                }, children: "保存"
            })]
        }),
        children: d ? e.jsxs("div", {
            className: "wm-grid wm-grid--2",
            children: [e.jsxs("label", {
                className: "wm-field",
                style: {display: "none"},
                children: [e.jsx("span", {children: "项目 ID *"}), e.jsx("input", {
                    value: d.id,
                    onChange: m => j({...d, id: m.target.value})
                })]
            }), e.jsxs("label", {
                className: "wm-field",
                children: [e.jsx("span", {children: "项目名称 *"}), e.jsx("input", {
                    value: d.name,
                    onChange: m => j({...d, name: m.target.value})
                })]
            }), e.jsxs("label", {
                className: "wm-field",
                children: [e.jsx("span", {children: "项目分组"}), e.jsx("select", {
                    value: d.groupCode ?? "default",
                    onChange: m => j({...d, groupCode: m.target.value}),
                    children: i.map(m => e.jsx("option", {value: m.code, children: m.name}, m.code))
                })]
            }), e.jsxs("label", {
                className: "wm-field",
                children: [e.jsx("span", {children: "字段模板"}), e.jsxs("select", {
                    value: g,
                    onChange: m => {
                        const w = m.target.value;
                        b(w);
                        const y = a.find(N => N.id === w);
                        y && j({...d, fields: U(y.fields)})
                    },
                    children: [e.jsx("option", {
                        value: "",
                        children: "不使用模板"
                    }), a.map(m => e.jsx("option", {value: m.id, children: m.name}, m.id))]
                })]
            }), e.jsxs("label", {
                className: "wm-field",
                children: [e.jsx("span", {children: "登录页弹窗位置"}), e.jsx("select", {
                    value: d.popupPosition ?? Ge,
                    onChange: m => j({...d, popupPosition: m.target.value}),
                    children: Ss.map(m => e.jsx("option", {value: m.value, children: m.label}, m.value))
                })]
            })]
        }) : null
    })
}

function Me({open: n, project: t, title: i, onClose: a, onSave: o}) {
    const [h, u] = p.useState([]), [d, j] = p.useState(null);
    p.useEffect(() => {
        !n || !t || u(U(t.fields))
    }, [n, t]);
    const g = p.useMemo(() => h.length, [h]);
    return e.jsxs(ie, {
        open: n && !!t,
        title: i,
        width: 1180,
        onClose: a,
        footer: e.jsxs(e.Fragment, {
            children: [e.jsxs("span", {
                className: "wm-tiny",
                children: ["共 ", g, " 个字段"]
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
                    onClick: () => o(U(h)),
                    children: "保存"
                })]
            })]
        }),
        children: [e.jsxs("div", {
            className: "wm-inline wm-field-editor-toolbar",
            style: {justifyContent: "space-between"},
            children: [e.jsx("div", {
                className: "wm-tiny",
                children: "字段配置支持增删改查和拖动排序。带 * 的字段为必填；input 类型还需要配置选择器。"
            }), e.jsx("button", {
                type: "button",
                className: "wm-btn wm-btn--primary",
                onClick: () => u(b => [...b, {
                    key: `field_${Date.now()}`,
                    label: "新字段",
                    type: "input",
                    selector: "",
                    sensitive: !1,
                    required: !1,
                    copyable: !0
                }]),
                children: "新增字段"
            })]
        }), e.jsxs("table", {
            className: "wm-table wm-field-editor-table",
            children: [e.jsx("thead", {children: e.jsxs("tr", {children: [e.jsx("th", {children: "顺序"}), e.jsx("th", {children: "Key *"}), e.jsx("th", {children: "名称 *"}), e.jsx("th", {children: "类型 *"}), e.jsx("th", {children: "选择器"}), e.jsx("th", {children: "敏感"}), e.jsx("th", {children: "必填"}), e.jsx("th", {children: "复制"}), e.jsx("th", {children: "操作"})]})}), e.jsx("tbody", {
                children: h.map((b, x) => e.jsxs("tr", {
                    draggable: !0,
                    onDragStart: () => j(x),
                    onDragOver: m => m.preventDefault(),
                    onDrop: () => {
                        d === null || d === x || (u(m => zs(m, d, x)), j(null))
                    },
                    onDragEnd: () => j(null),
                    children: [e.jsx("td", {
                        children: e.jsx("button", {
                            type: "button",
                            className: "wm-icon-btn",
                            title: "拖动排序",
                            onDragStart: () => j(x),
                            children: "☰"
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            value: b.key,
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, key: m.target.value} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            value: b.label,
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, label: m.target.value} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsxs("select", {
                            value: b.type,
                            onChange: m => u(w => w.map((y, N) => {
                                if (N !== x) return y;
                                const _ = m.target.value;
                                return _ === "display" ? {...y, type: _, selector: ""} : {...y, type: _}
                            })),
                            children: [e.jsx("option", {
                                value: "input",
                                children: "input"
                            }), e.jsx("option", {value: "display", children: "display"})]
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            value: b.selector ?? "",
                            disabled: b.type === "display",
                            placeholder: b.type === "display" ? "展示字段不填充页面" : "CSS / XPath selector",
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, selector: m.target.value} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            type: "checkbox",
                            checked: b.sensitive,
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, sensitive: m.target.checked} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            type: "checkbox",
                            checked: !!b.required,
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, required: m.target.checked} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsx("input", {
                            type: "checkbox",
                            checked: b.copyable !== !1,
                            onChange: m => u(w => w.map((y, N) => N === x ? {...y, copyable: m.target.checked} : y))
                        })
                    }), e.jsx("td", {
                        children: e.jsx("button", {
                            className: "wm-btn",
                            type: "button",
                            onClick: () => u(m => m.filter((w, y) => y !== x)),
                            children: "删除"
                        })
                    })]
                }, x))
            })]
        })]
    })
}

function Ys({open: n, project: t, title: i, onClose: a, onSave: o}) {
    const [h, u] = p.useState([]);
    return p.useEffect(() => {
        !n || !t || u(U(t.envs).map(d => ({
            ...d,
            hostsText: Pe(d.hosts),
            pathKeywordsText: Pe(d.pathKeywords),
            retryDelaysText: Xs(d.retryDelays)
        })))
    }, [n, t]), e.jsxs(ie, {
        open: n && !!t,
        title: i,
        width: 1180,
        onClose: a,
        footer: e.jsxs(e.Fragment, {
            children: [e.jsxs("span", {
                className: "wm-tiny",
                children: ["共 ", h.length, " 个环境"]
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
                    onClick: () => o(U(h).map(d => ({
                        id: d.id,
                        name: d.name,
                        hosts: Ee(d.hostsText),
                        pathKeywords: Ee(d.pathKeywordsText),
                        retryDelays: Hs(d.retryDelaysText),
                        accounts: d.accounts
                    }))),
                    children: "保存"
                })]
            })]
        }),
        children: [e.jsxs("div", {
            className: "wm-inline",
            style: {justifyContent: "space-between"},
            children: [e.jsx("div", {
                className: "wm-tiny",
                children: "环境配置支持增删改查。带 * 的字段为必填。Hosts 和 Path 关键字使用英文逗号分隔；重试延迟示例：0, 500, 1000。"
            }), e.jsx("button", {
                type: "button",
                className: "wm-btn wm-btn--primary",
                onClick: () => u(d => [...d, {
                    id: `env_${Date.now()}`,
                    name: "新环境",
                    hosts: ["example.com"],
                    hostsText: "example.com",
                    pathKeywords: ["/login"],
                    pathKeywordsText: "/login",
                    retryDelays: [0, 500],
                    accounts: [],
                    retryDelaysText: "0, 500"
                }]),
                children: "新增环境"
            })]
        }), e.jsx("div", {
            className: "wm-grid", children: h.map((d, j) => e.jsxs("div", {
                className: "wm-card",
                children: [e.jsxs("div", {
                    className: "wm-card__hd",
                    children: [e.jsx("strong", {children: d.name || d.id}), e.jsx("button", {
                        className: "wm-btn",
                        type: "button",
                        onClick: () => u(g => g.filter((b, x) => x !== j)),
                        children: "删除"
                    })]
                }), e.jsx("div", {
                    className: "wm-card__bd", children: e.jsxs("div", {
                        className: "wm-grid wm-grid--2",
                        children: [e.jsxs("label", {
                            className: "wm-field",
                            style: {display: "none"},
                            children: [e.jsx("span", {children: "环境 ID *"}), e.jsx("input", {
                                value: d.id,
                                onChange: g => u(b => b.map((x, m) => m === j ? {...x, id: g.target.value} : x))
                            })]
                        }), e.jsxs("label", {
                            className: "wm-field",
                            children: [e.jsx("span", {children: "环境名称 *"}), e.jsx("input", {
                                value: d.name,
                                onChange: g => u(b => b.map((x, m) => m === j ? {...x, name: g.target.value} : x))
                            })]
                        }), e.jsxs("label", {
                            className: "wm-field",
                            children: [e.jsx("span", {children: "Hosts *"}), e.jsx("small", {children: "英文逗号分隔，例如 10.0.0.1, login.example.com"}), e.jsx("input", {
                                value: d.hostsText,
                                onChange: g => u(b => b.map((x, m) => m === j ? {...x, hostsText: g.target.value} : x))
                            })]
                        }), e.jsxs("label", {
                            className: "wm-field",
                            children: [e.jsx("span", {children: "Path 关键字 *"}), e.jsx("small", {children: "英文逗号分隔，例如 /login, /admin"}), e.jsx("input", {
                                value: d.pathKeywordsText,
                                onChange: g => u(b => b.map((x, m) => m === j ? {
                                    ...x,
                                    pathKeywordsText: g.target.value
                                } : x))
                            })]
                        }), e.jsxs("label", {
                            className: "wm-field",
                            children: [e.jsx("span", {children: "重试延迟 *"}), e.jsx("small", {children: "英文逗号分隔，单位毫秒，例如 0, 500, 1000"}), e.jsx("input", {
                                value: d.retryDelaysText,
                                placeholder: "0, 500, 1000",
                                onChange: g => u(b => b.map((x, m) => m === j ? {
                                    ...x,
                                    retryDelaysText: g.target.value
                                } : x))
                            })]
                        })]
                    })
                })]
            }, j))
        })]
    })
}

function Zs({open: n, config: t, onClose: i, onExport: a}) {
    const [o, h] = p.useState([]), [u, d] = p.useState(!1);
    p.useEffect(() => {
        if (!n) return;
        const g = t.projects.map(b => b.id);
        h(g), d(!!(t.sync.minioEnabled || t.sync.endpoint || t.sync.bucket || t.sync.accessKey || t.sync.secretKey))
    }, [t, n]);
    const j = !!(t.sync.minioEnabled || t.sync.endpoint || t.sync.bucket || t.sync.accessKey || t.sync.secretKey);
    return e.jsxs(ie, {
        open: n,
        title: "导出配置",
        width: 720,
        onClose: i,
        footer: e.jsxs(e.Fragment, {
            children: [e.jsx("button", {
                type: "button",
                className: "wm-btn",
                onClick: i,
                children: "取消"
            }), e.jsx("button", {
                type: "button",
                className: "wm-btn wm-btn--primary",
                onClick: () => a({projectIds: o, includeMinio: u}),
                children: "导出"
            })]
        }),
        children: [e.jsx("div", {
            className: "wm-tiny",
            children: "默认全选项目，可按需取消项目，并决定是否导出 MinIO 配置。"
        }), e.jsxs("div", {
            className: "wm-grid",
            children: [e.jsxs("div", {
                className: "wm-inline",
                children: [e.jsx("button", {
                    type: "button",
                    className: "wm-btn",
                    onClick: () => h(t.projects.map(g => g.id)),
                    children: "全选"
                }), e.jsx("button", {type: "button", className: "wm-btn", onClick: () => h([]), children: "全不选"})]
            }), t.projects.map(g => e.jsxs("label", {
                className: "wm-inline",
                children: [e.jsx("input", {
                    type: "checkbox",
                    checked: o.includes(g.id),
                    onChange: b => h(x => b.target.checked ? [...x, g.id] : x.filter(m => m !== g.id))
                }), g.name, " ", e.jsx("span", {className: "wm-tiny", children: g.id})]
            }, g.id)), j ? e.jsxs("label", {
                className: "wm-inline",
                children: [e.jsx("input", {
                    type: "checkbox",
                    checked: u,
                    onChange: g => d(g.target.checked)
                }), "导出 MinIO 配置"]
            }) : null]
        })]
    })
}

const en = 1600, Ue = [{key: "groups", label: "项目分组", icon: "icons/menu/group.png"}, {
    key: "projects",
    label: "项目管理",
    icon: "icons/menu/project.png"
}, {key: "fieldTemplates", label: "字段模板", icon: "icons/menu/template.png"}, {
    key: "accounts",
    label: "账号管理",
    icon: "icons/menu/account.png"
}, {key: "config", label: "系统设置", icon: "icons/menu/settings.png"}];

function sn(n) {
    var t;
    return ((t = Ue.find(i => i.key === n)) == null ? void 0 : t.label) ?? ""
}

function nn() {
    return {
        id: Q("project"),
        name: "新项目",
        groupCode: A,
        popupPosition: Ge,
        fields: [{
            key: "login",
            label: "登录名",
            type: "input",
            selector: "#login",
            sensitive: !1,
            required: !1,
            copyable: !0,
            minWidth: 120,
            maxWidth: 220
        }, {
            key: "note",
            label: "备注",
            type: "display",
            sensitive: !1,
            required: !1,
            copyable: !0,
            minWidth: 120,
            maxWidth: 280
        }],
        envs: [{
            id: "main",
            name: "官网",
            hosts: ["example.com"],
            pathKeywords: ["/login"],
            retryDelays: [0, 500],
            accounts: [{
                id: Q("account"),
                values: {login: "", note: ""},
                isDefault: !0,
                updatedAt: new Date().toISOString()
            }]
        }]
    }
}

function tn() {
    return {code: `group_${Date.now()}`, name: "新分组", description: ""}
}

function an() {
    return [{
        key: "login",
        label: "登录名",
        type: "input",
        selector: "#login",
        sensitive: !1,
        required: !1,
        copyable: !0,
        minWidth: 120,
        maxWidth: 220
    }, {
        key: "note",
        label: "备注",
        type: "display",
        sensitive: !1,
        required: !1,
        copyable: !0,
        minWidth: 120,
        maxWidth: 280
    }]
}

function ln() {
    return {id: Q("template"), name: "新模板", fields: an()}
}

function $e(n) {
    return JSON.parse(JSON.stringify(n))
}

function Ke(n, t, i, a, o = !1) {
    if (t === i) return n;
    const h = n.find(j => a(j) === t);
    if (!h) return n;
    const u = n.filter(j => a(j) !== t), d = u.findIndex(j => a(j) === i);
    return d < 0 ? n : (u.splice(d + (o ? 1 : 0), 0, h), u)
}

function rn(n, t) {
    const i = {};
    for (const a of n) i[a.key] = t[a.key] ?? "";
    return i
}

function Fe(n) {
    return {
        ...n,
        envs: n.envs.map(t => ({...t, accounts: t.accounts.map(i => ({...i, values: rn(n.fields, i.values)}))}))
    }
}

function cn(n, t, i) {
    return {...n, projects: n.projects.map(a => a.id === t ? i : a)}
}

function on(n) {
    return {minioEnabled: !1}
}

function dn(n, t, i) {
    const a = t.length > 0 ? n.projects.filter(o => t.includes(o.id)) : n.projects;
    return {...JSON.parse(JSON.stringify(n)), projects: a, sync: i ? JSON.parse(JSON.stringify(n.sync)) : on(n.sync)}
}

function un(n, t) {
    return n.fields.filter(i => !i.sensitive).map(i => `${i.label}: ${t.values[i.key] ?? ""}`).join(" | ")
}

function mn() {
    const [n, t] = p.useState(null), [i, a] = p.useState("正在加载配置"), [o, h] = p.useState([]), [u, d] = p.useState("projects"), [j, g] = p.useState(!1), [b, x] = p.useState(""), [m, w] = p.useState(""), [y, N] = p.useState(""), [_, F] = p.useState(""), [G, R] = p.useState(""), [ae, xe] = p.useState(""), [le, Le] = p.useState(""), [ye, re] = p.useState(""), [ce, we] = p.useState(!1), [be, qe] = p.useState("minio"), [L, ge] = p.useState(null), [Ve, ze] = p.useState({}), [C, E] = p.useState(null), [T, J] = p.useState(null), [Xe, oe] = p.useState(null), [He, de] = p.useState(null), [accountDragId, setAccountDragId] = p.useState(null),
        q = p.useRef(null), [Z, ee] = p.useState({
            open: !1,
            originalId: null,
            project: null
        }), [V, ue] = p.useState(null), [z, me] = p.useState(null), [X, he] = p.useState(null), [M, se] = p.useState({
            open: !1,
            projectId: "",
            envId: "",
            account: null
        }), [Qe, pe] = p.useState(!1), c = n,
        $ = p.useMemo(() => (c == null ? void 0 : c.projects.find(s => s.id === _)) ?? null, [c, _]),
        P = (c == null ? void 0 : c.projectGroups) ?? [], D = (c == null ? void 0 : c.fieldTemplates) ?? [],
        ve = p.useMemo(() => {
            if (!c) return [];
            const s = y.trim().toLowerCase();
            return c.projects.filter(l => !(m && (l.groupCode ?? A) !== m || s && !l.name.toLowerCase().includes(s)))
        }, [c, y, m]), Ne = p.useMemo(() => {
            const s = le.trim().toLowerCase();
            return s ? D.filter(l => l.name.toLowerCase().includes(s)) : D
        }, [D, le]), H = p.useMemo(() => D.find(s => s.id === z) ?? null, [z, D]),
        Ye = p.useMemo(() => H ? {id: H.id, name: H.name, groupCode: A, fields: H.fields, envs: []} : null, [H]);

    async function k(s, l = "已保存到本地") {
        t(s), re(Ie(s)), h(fe(s).errors), a(l), await Ts(s)
    }

    function Ze(s) {
        var r;
        const l = s || A;
        return ((r = P.find(f => f.code === l)) == null ? void 0 : r.name) ?? l
    }

    function O(s, l, r = "success") {
        a(l), WAAshowInlineError(l, r)
    }

    p.useEffect(() => {
        _s().then(s => {
            var l;
            t(s), re(Ie(s)), x(((l = s.projects[0]) == null ? void 0 : l.id) ?? ""), w(""), F(""), R(""), h(fe(s).errors), a("配置已加载")
        }).catch(s => WAAshowInlineError(s.message))
    }, []), p.useEffect(() => () => {
        q.current !== null && window.clearTimeout(q.current)
    }, []), p.useEffect(() => {
        if (!(c != null && c.projects.length)) {
            x("");
            return
        }
        (!b || !c.projects.some(s => s.id === b)) && x(c.projects[0].id)
    }, [c, b]), p.useEffect(() => {
        if (!_ || !$) {
            R("");
            return
        }
        G && !$.envs.some(s => s.id === G) && R("")
    }, [G, $, _]);

    async function es(s, l) {
        var v;
        if (!c) return;
        const r = Fe({...l, groupCode: l.groupCode || A}), f = s ? cn(c, s, r) : {...c, projects: [...c.projects, r]};
        await k(f, s ? "项目已保存" : "项目已新增"), x(r.id), F(r.id), R(((v = r.envs[0]) == null ? void 0 : v.id) ?? ""), ee({
            open: !1,
            originalId: null,
            project: null
        })
    }

    function ss() {
        E({originalCode: null, draft: tn()})
    }

    function ns(s) {
        E({originalCode: s.code, draft: $e(s)})
    }

    async function ts(s) {
        if (!c || !C) return;
        const l = {...C.draft, code: C.draft.code.trim(), name: C.draft.name.trim()};
        if (!l.code || !l.name) {
            O(s, "分组 code 和名称不能为空", "warning");
            return
        }
        if (P.some(S => S.code === l.code && S.code !== C.originalCode)) {
            O(s, "分组 code 已存在", "warning");
            return
        }
        const f = C.originalCode ? P.map(S => S.code === C.originalCode ? l : S) : [...P, l],
            v = C.originalCode && C.originalCode !== l.code ? c.projects.map(S => (S.groupCode ?? A) === C.originalCode ? {
                ...S,
                groupCode: l.code
            } : S) : c.projects;
        await k({
            ...c,
            projectGroups: f,
            projects: v
        }, C.originalCode ? "分组已保存" : "分组已新增"), O(s, C.originalCode ? "分组已保存" : "分组已新增", "success"), E(null)
    }

    function is(s, l, r, f) {
        if (!c || !s || s === l) return;
        const v = Ke(P, s, l, S => S.code, !!f);
        if (v === P) return;
        const K = {...c, projectGroups: v};
        t(K), re(Ie(K)), h(fe(K).errors), a("拖动排序中")
    }

    async function groupDrop(s) {
        if (!c) return;
        await k(c, "分组顺序已保存"), oe(null), O(s, "分组顺序已保存", "success")
    }

    async function Ce(s) {
        if (!c || s === A) return;
        const l = P.find(r => r.code === s);
        if (!l || !(await WAAconfirmInline(`确认删除分组 ${l.name} ? 分组下项目会归入默认分组。`))) return;
        await k({
            ...c,
            projectGroups: P.filter(r => r.code !== s),
            projects: c.projects.map(r => (r.groupCode ?? A) === s ? {...r, groupCode: A} : r)
        }, "分组已删除"), E(r => (r == null ? void 0 : r.originalCode) === s ? null : r)
    }

    function as() {
        J({originalId: null, draft: ln()})
    }

    function ls(s) {
        J({originalId: s.id, draft: $e(s)})
    }

    async function rs(s) {
        if (!c || !T) return;
        const l = {...T.draft, name: T.draft.name.trim()};
        if (!l.name) {
            O(s, "模板名称不能为空", "warning");
            return
        }
        const r = T.originalId ? D.map(f => f.id === T.originalId ? l : f) : [...D, l];
        await k({
            ...c,
            fieldTemplates: r
        }, T.originalId ? "模板已保存" : "模板已新增"), O(s, T.originalId ? "模板已保存" : "模板已新增", "success"), J(null)
    }

    async function cs(s, l) {
        c && (await k({
            ...c,
            fieldTemplates: D.map(r => r.id === s ? {...r, ...l} : r)
        }, "模板已保存"), J(r => (r == null ? void 0 : r.originalId) === s ? {...r, draft: {...r.draft, ...l}} : r))
    }

    function os(s, l, r, f) {
        if (!c || !s || s === l) return;
        const v = Ke(D, s, l, S => S.id, !!f);
        if (v === D) return;
        const K = {...c, fieldTemplates: v};
        t(K), re(Ie(K)), h(fe(K).errors), a("拖动排序中")
    }

    async function templateDrop(s) {
        if (!c) return;
        await k(c, "模板顺序已保存"), de(null), O(s, "模板顺序已保存", "success")
    }

    async function ke(s) {
        if (!c) return;
        const l = D.find(r => r.id === s);
        if (!l || !(await WAAconfirmInline(`确认删除模板 ${l.name} ?`))) return;
        await k({
            ...c,
            fieldTemplates: D.filter(r => r.id !== s)
        }, "模板已删除"), J(r => (r == null ? void 0 : r.originalId) === s ? null : r)
    }

    async function ds(s) {
        var f;
        if (!c) return;
        const l = c.projects.find(v => v.id === s);
        if (!l || !(await WAAconfirmInline(`确认删除项目 ${l.name} ?`))) return;
        const r = qs(c, s);
        await k(r, "项目已删除"), x(((f = r.projects[0]) == null ? void 0 : f.id) ?? ""), _ === s && (F(""), R(""))
    }

    async function us(s, l) {
        if (!c) return;
        const r = c.projects.find(v => v.id === s);
        if (!r) return;
        const f = Fe({...r, fields: l});
        await k(Ae(c, f), "字段已保存"), ue(null)
    }

    async function ms(s, l) {
        if (!c) return;
        const r = c.projects.find(f => f.id === s);
        r && (await k(Ae(c, {...r, envs: l}), "环境已保存"), he(null))
    }

    const ne = p.useMemo(() => {
        if (!c || !_ || !G) return [];
        const s = [], l = c.projects.find(r => r.id === _), r = l?.envs.find(f => f.id === G);
        if (!l || !r) return s;
        for (const f of r.accounts) {
            const v = ae.trim().toLowerCase();
            v && !un(l, f).toLowerCase().includes(v) || s.push({project: l, env: r, account: f})
        }
        return s
    }, [ae, c, G, _]), Se = p.useMemo(() => {
        const s = [], l = new Set, r = $ ? [$] : ne.map(f => f.project);
        for (const f of r) for (const v of f.fields) l.has(v.key) || (l.add(v.key), s.push(v));
        return s
    }, [ne, $]);

    async function hs(s) {
        if (!c || !M.projectId || !M.envId) return;
        const l = De(c, M.projectId, M.envId, s);
        await k(l, "账号已保存"), se({open: !1, projectId: "", envId: "", account: null})
    }

    async function ps(s, l, r) {
        if (!c || !(await WAAconfirmInline(`确认删除账号 ${r} ?`))) return;
        await k(Vs(c, s, l, r), "账号已删除")
    }

    async function js(s, l, r) {
        if (!c) return;
        const f = c.projects.find(K => K.id === s), v = f == null ? void 0 : f.envs.find(K => K.id === l),
            S = v == null ? void 0 : v.accounts.find(K => K.id === r);
        !f || !v || !S || await k(De(c, s, l, {
            ...S,
            isDefault: !0,
            updatedAt: new Date().toISOString()
        }), "默认账号已更新")
    }

    function accountPreviewMove(s, l, r, f, v) {
        if (!c || !s || !l || !r || !f || r === f) return;
        const S = c.projects.find(K => K.id === s), te = S?.envs.find(K => K.id === l);
        if (!S || !te) return;
        const Ee = Ke(te.accounts, r, f, K => K.id, !!v);
        if (Ee === te.accounts) return;
        const ze = {
            ...c,
            projects: c.projects.map(K => K.id !== s ? K : {
                ...K,
                envs: K.envs.map(We => We.id !== l ? We : {...We, accounts: Ee})
            })
        };
        t(ze), re(Ie(ze)), h(fe(ze).errors), a("拖动排序中")
    }

    async function accountDrop(s) {
        if (!c) return;
        await k(c, "账号顺序已保存"), setAccountDragId(null), O(s, "账号顺序已保存", "success")
    }

    async function fs() {
        try {
            const s = Oe(ye);
            if (!s.ok || !s.value) {
                h(s.errors), WAAshowInlineError("JSON 校验失败");
                return
            }
            await k(s.value, "JSON 已保存"), we(!1)
        } catch (s) {
            WAAshowInlineError(s.message)
        }
    }

    async function xs(s) {
        const l = await s.text(), r = Oe(l);
        if (!r.ok || !r.value) {
            h(r.errors), WAAshowInlineError("导入失败：JSON 不合法");
            return
        }
        await k(r.value, "已导入配置")
    }

    async function ys(s, l) {
        if (!c) return;
        let r;
        try {
            await WAAensureSensitiveAccess();
            const R = await chrome.runtime.sendMessage({type: "DECRYPT_APP_CONFIG"});
            if (!R?.ok) throw new Error(R?.error ?? "解密配置失败");
            r = dn(R.appConfig, s, l)
        } catch (R) {
            WAAshowInlineError(R.message);
            return
        }
        const f = new Blob([JSON.stringify(r, null, 2)], {type: "application/json"}), v = document.createElement("a");
        v.href = URL.createObjectURL(f), v.download = "web-account-config.json", v.click(), URL.revokeObjectURL(v.href), a("已导出 JSON"), pe(!1)
    }

    async function ws(s) {
        if (!(c != null && c.sync.minioEnabled)) {
            a("未启用 MinIO"), O(s, "未启用 MinIO", "warning");
            return
        }
        try {
            const l = await Us(c.sync), r = Rs(c, l, "cloudToLocal"),
                f = r.warnings.join(" ") || "远程配置已同步到本地";
            await k(r.config, f), O(s, f, r.warnings.length > 0 ? "warning" : "success")
        } catch (l) {
            const r = l.message;
            a(r), O(s, r, "error")
        }
    }

    async function bs(s) {
        var l;
        if (!(c != null && c.sync.minioEnabled)) {
            a("未启用 MinIO"), O(s, "未启用 MinIO", "warning");
            return
        }
        try {
            await Ls(c.sync, c);
            const r = "已同步到 MinIO";
            await k({
                ...c,
                meta: {
                    ...c.meta ?? {},
                    lastSyncedAt: new Date().toISOString(),
                    remoteRevision: (((l = c.meta) == null ? void 0 : l.remoteRevision) ?? 0) + 1
                }
            }, r), O(s, r, "success")
        } catch (r) {
            const f = r.message;
            a(f), O(s, f, "error")
        }
    }

    function B(s) {
        c && k({...c, sync: {...c.sync, ...s}}, "MinIO 配置已保存")
    }

    function gs(s) {
        c && k({...c, global: {...c.global, ...s}}, "全局配置已保存")
    }

    return c ? e.jsxs(e.Fragment, {
        children: [e.jsxs("div", {
            className: `wm-shell ${j ? "wm-shell--collapsed" : ""}`,
            children: [e.jsxs("aside", {
                className: "wm-panel wm-sidebar",
                children: [e.jsxs("div", {
                    className: "wm-panel__hd",
                    children: [e.jsx("strong", {
                        className: "wm-sidebar__title",
                        children: "菜单"
                    }), e.jsx("button", {
                        className: "wm-icon-btn wm-sidebar-toggle",
                        type: "button",
                        title: j ? "展开菜单" : "折叠菜单",
                        "aria-label": j ? "展开菜单" : "折叠菜单",
                        "aria-expanded": !j,
                        onClick: () => g(s => !s),
                        children: e.jsx("img", {
                            className: "wm-sidebar-toggle__icon",
                            src: j ? "icons/menu/expand.png" : "icons/menu/collapse.png",
                            alt: "",
                            "aria-hidden": "true"
                        })
                    })]
                }), e.jsx("div", {
                    className: "wm-panel__bd",
                    children: e.jsx("div", {
                        className: "wm-list",
                        children: Ue.map(({key: s, label: l, icon: r}) => e.jsxs("button", {
                            type: "button",
                            "aria-label": l,
                            className: `wm-item ${u === s ? "wm-item--active" : ""}`,
                            onClick: () => d(s),
                            children: [e.jsx("span", {
                                className: "wm-menu-icon",
                                "aria-hidden": "true",
                                children: e.jsx("img", {className: "wm-menu-icon__img", src: r, alt: ""})
                            }), e.jsx("span", {
                                className: "wm-menu-label",
                                children: l
                            }), e.jsx("span", {className: "wm-menu-tooltip", role: "tooltip", children: l})]
                        }, s))
                    })
                })]
            }), e.jsxs("main", {
                className: "wm-panel",
                children: [e.jsxs("div", {
                    className: "wm-panel__hd",
                    children: [e.jsx("strong", {children: sn(u)}), null]
                }), e.jsxs("div", {
                    className: "wm-panel__bd",
                    children: [u === "config" ? e.jsx("div", {
                        className: "wm-sections",
                        style: {gap: 20, marginBottom: 20},
                        children: e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsx("div", {
                                className: "wm-card__hd",
                                children: e.jsx("strong", {children: "全局配置"})
                            }), e.jsx("div", {
                                className: "wm-card__bd",
                                children: e.jsxs("label", {
                                    className: "wm-inline",
                                    children: [e.jsx("input", {
                                        type: "checkbox",
                                        checked: c.global.showLoginAccountPanel,
                                        onChange: s => gs({showLoginAccountPanel: s.target.checked})
                                    }), "登陆页显示账号列表弹窗"]
                                })
                            })]
                        })
                    }) : null, u === "groups" ? e.jsxs("div", {
                        className: "wm-sections", style: {gap: 20, marginBottom: 20}, children: [e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "项目分组列表"}), e.jsx("button", {
                                    className: "wm-btn wm-btn--primary",
                                    type: "button",
                                    onClick: ss,
                                    children: "新增分组"
                                })]
                            }), e.jsx("div", {
                                className: "wm-card__bd", children: e.jsxs("table", {
                                    className: "wm-table",
                                    children: [e.jsx("thead", {children: e.jsxs("tr", {children: [e.jsx("th", {children: "顺序"}), e.jsx("th", {children: "分组 code"}), e.jsx("th", {children: "分组名称"}), e.jsx("th", {children: "描述"}), e.jsx("th", {children: "操作"})]})}), e.jsx("tbody", {
                                        children: P.map(s => e.jsxs("tr", {
                                            className: Xe === s.code ? "wm-dragging-row" : void 0,
                                            onDragOver: l => {
                                                l.preventDefault(), l.dataTransfer && (l.dataTransfer.dropEffect = "move");
                                                const r = l.currentTarget.getBoundingClientRect();
                                                is(Xe, s.code, l.currentTarget, l.clientY > r.top + r.height / 2)
                                            },
                                            onDrop: l => {
                                                l.preventDefault(), l.stopPropagation(), void groupDrop(l.currentTarget)
                                            },
                                            children: [e.jsx("td", {
                                                children: e.jsx("button", {
                                                    type: "button",
                                                    className: "wm-icon-btn",
                                                    title: "拖动排序",
                                                    draggable: !0,
                                                    onClick: l => l.stopPropagation(),
                                                    onDragStart: l => {
                                                        l.dataTransfer && (l.dataTransfer.effectAllowed = "move", l.dataTransfer.setData("text/plain", s.code)), l.dataTransfer?.setDragImage(l.currentTarget.closest("tr") ?? l.currentTarget, 0, 0), oe(s.code)
                                                    },
                                                    onDragEnd: () => oe(null),
                                                    children: "☰"
                                                })
                                            }), e.jsx("td", {
                                                className: "wm-code",
                                                children: s.code
                                            }), e.jsx("td", {children: s.name}), e.jsx("td", {children: s.description ?? ""}), e.jsx("td", {
                                                children: e.jsxs("div", {
                                                    className: "wm-table__actions",
                                                    children: [e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => ns(s),
                                                        children: "编辑"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn wm-btn--danger",
                                                        type: "button",
                                                        disabled: s.code === A,
                                                        onClick: () => void Ce(s.code),
                                                        children: "删除"
                                                    })]
                                                })
                                            })]
                                        }, s.code))
                                    })]
                                })
                            })]
                        }), C ? e.jsx("div", {
                            className: "wm-overlay", role: "presentation", children: e.jsxs("div", {
                                className: "wm-modal",
                                style: {width: "min(520px, calc(100vw - 32px))"},
                                children: [e.jsxs("div", {
                                    className: "wm-modal__header",
                                    children: [e.jsx("strong", {children: C.originalCode ? "编辑分组" : "新增分组"}), e.jsx("button", {
                                        className: "wm-icon-btn",
                                        type: "button",
                                        onClick: () => E(null),
                                        children: "×"
                                    })]
                                }), e.jsxs("div", {
                                    className: "wm-modal__body",
                                    children: [e.jsxs("label", {
                                        className: "wm-field",
                                        style: {display: "none"},
                                        children: [e.jsx("span", {children: "分组 code *"}), e.jsx("input", {
                                            value: C.draft.code,
                                            disabled: C.originalCode === A,
                                            onChange: s => E({...C, draft: {...C.draft, code: s.target.value}})
                                        })]
                                    }), e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "分组名称 *"}), e.jsx("input", {
                                            value: C.draft.name,
                                            onChange: s => E({...C, draft: {...C.draft, name: s.target.value}})
                                        })]
                                    }), e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "描述"}), e.jsx("textarea", {
                                            rows: 4,
                                            value: C.draft.description ?? "",
                                            onChange: s => E({...C, draft: {...C.draft, description: s.target.value}})
                                        })]
                                    })]
                                }), e.jsxs("div", {
                                    className: "wm-modal__footer",
                                    children: [e.jsx("div", {
                                        children: C.originalCode && C.originalCode !== A ? e.jsx("button", {
                                            className: "wm-btn wm-btn--danger",
                                            type: "button",
                                            onClick: () => void Ce(C.originalCode),
                                            children: "删除"
                                        }) : null
                                    }), e.jsxs("div", {
                                        className: "wm-inline",
                                        children: [e.jsx("button", {
                                            className: "wm-btn",
                                            type: "button",
                                            onClick: () => E(null),
                                            children: "取消"
                                        }), e.jsx("button", {
                                            className: "wm-btn wm-btn--primary",
                                            type: "button",
                                            onClick: s => void ts(s.currentTarget),
                                            children: "保存"
                                        })]
                                    })]
                                })]
                            })
                        }) : null]
                    }) : null, u === "projects" ? e.jsxs("div", {
                        className: "wm-sections",
                        style: {gap: 20, marginBottom: 20},
                        children: [e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "筛选"}), e.jsx("button", {
                                    className: "wm-btn",
                                    type: "button",
                                    onClick: () => {
                                        w(""), N("")
                                    },
                                    children: "重置"
                                })]
                            }), e.jsx("div", {
                                className: "wm-card__bd",
                                children: e.jsxs("div", {
                                    className: "wm-grid wm-grid--2",
                                    children: [e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "分组"}), e.jsxs("select", {
                                            value: m,
                                            onChange: s => w(s.target.value),
                                            children: [e.jsx("option", {
                                                value: "",
                                                children: "全部"
                                            }), P.map(s => e.jsx("option", {value: s.code, children: s.name}, s.code))]
                                        })]
                                    }), e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "项目名称"}), e.jsx("input", {
                                            value: y,
                                            onChange: s => N(s.target.value)
                                        })]
                                    })]
                                })
                            })]
                        }), e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "项目列表"}), e.jsx("button", {
                                    className: "wm-btn wm-btn--primary",
                                    type: "button",
                                    onClick: () => ee({open: !0, originalId: null, project: nn()}),
                                    children: "新增项目"
                                })]
                            }), e.jsx("div", {
                                className: "wm-card__bd",
                                children: ve.length > 0 ? e.jsxs("table", {
                                    className: "wm-table",
                                    children: [e.jsx("thead", {children: e.jsxs("tr", {children: [e.jsx("th", {children: "分组"}), e.jsx("th", {children: "名称"}), e.jsx("th", {children: "字段"}), e.jsx("th", {children: "环境"}), e.jsx("th", {children: "操作"})]})}), e.jsx("tbody", {
                                        children: ve.map(s => e.jsxs("tr", {
                                            children: [e.jsx("td", {children: Ze(s.groupCode)}), e.jsx("td", {children: s.name}), e.jsx("td", {children: s.fields.length}), e.jsx("td", {children: s.envs.length}), e.jsx("td", {
                                                children: e.jsxs("div", {
                                                    className: "wm-table__actions",
                                                    children: [e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => ee({open: !0, originalId: s.id, project: s}),
                                                        children: "编辑"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => ue(s.id),
                                                        children: "字段配置"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => he(s.id),
                                                        children: "环境配置"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn wm-btn--danger",
                                                        type: "button",
                                                        onClick: () => void ds(s.id),
                                                        children: "删除"
                                                    })]
                                                })
                                            })]
                                        }, s.id))
                                    })]
                                }) : e.jsx("div", {
                                    className: "wm-tiny",
                                    children: "当前没有项目。可通过“新增项目”或导入 JSON 创建配置。"
                                })
                            })]
                        })]
                    }) : null, u === "fieldTemplates" ? e.jsxs("div", {
                        className: "wm-sections", style: {gap: 20, marginBottom: 20}, children: [e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "字段模板列表"}), e.jsx("button", {
                                    className: "wm-btn wm-btn--primary",
                                    type: "button",
                                    onClick: as,
                                    children: "新增模板"
                                })]
                            }), e.jsxs("div", {
                                className: "wm-card__bd",
                                children: [e.jsxs("label", {
                                    className: "wm-field",
                                    style: {marginBottom: 10, maxWidth: 320},
                                    children: [e.jsx("span", {children: "模板名称"}), e.jsx("input", {
                                        value: le,
                                        onChange: s => Le(s.target.value)
                                    })]
                                }), Ne.length > 0 ? e.jsxs("table", {
                                    className: "wm-table",
                                    children: [e.jsx("thead", {children: e.jsxs("tr", {children: [e.jsx("th", {children: "顺序"}), e.jsx("th", {children: "模板名称"}), e.jsx("th", {children: "字段数"}), e.jsx("th", {children: "操作"})]})}), e.jsx("tbody", {
                                        children: Ne.map(s => e.jsxs("tr", {
                                            className: He === s.id ? "wm-dragging-row" : void 0,
                                            onDragOver: l => {
                                                l.preventDefault(), l.dataTransfer && (l.dataTransfer.dropEffect = "move");
                                                const r = l.currentTarget.getBoundingClientRect();
                                                os(He, s.id, l.currentTarget, l.clientY > r.top + r.height / 2)
                                            },
                                            onDrop: l => {
                                                l.preventDefault(), l.stopPropagation(), void templateDrop(l.currentTarget)
                                            },
                                            children: [e.jsx("td", {
                                                children: e.jsx("button", {
                                                    type: "button",
                                                    className: "wm-icon-btn",
                                                    title: "拖动排序",
                                                    draggable: !0,
                                                    onClick: l => l.stopPropagation(),
                                                    onDragStart: l => {
                                                        l.dataTransfer && (l.dataTransfer.effectAllowed = "move", l.dataTransfer.setData("text/plain", s.id)), l.dataTransfer?.setDragImage(l.currentTarget.closest("tr") ?? l.currentTarget, 0, 0), de(s.id)
                                                    },
                                                    onDragEnd: () => de(null),
                                                    children: "☰"
                                                })
                                            }), e.jsx("td", {children: s.name}), e.jsx("td", {children: s.fields.length}), e.jsx("td", {
                                                children: e.jsxs("div", {
                                                    className: "wm-table__actions",
                                                    children: [e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => ls(s),
                                                        children: "编辑"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => me(s.id),
                                                        children: "字段配置"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn wm-btn--danger",
                                                        type: "button",
                                                        onClick: () => void ke(s.id),
                                                        children: "删除"
                                                    })]
                                                })
                                            })]
                                        }, s.id))
                                    })]
                                }) : e.jsx("div", {className: "wm-tiny", children: "当前没有字段模板。"})]
                            })]
                        }), T ? e.jsx("div", {
                            className: "wm-overlay", role: "presentation", children: e.jsxs("div", {
                                className: "wm-modal",
                                style: {width: "min(460px, calc(100vw - 32px))"},
                                children: [e.jsxs("div", {
                                    className: "wm-modal__header",
                                    children: [e.jsx("strong", {children: T.originalId ? "编辑模板" : "新增模板"}), e.jsx("button", {
                                        className: "wm-icon-btn",
                                        type: "button",
                                        onClick: () => J(null),
                                        children: "×"
                                    })]
                                }), e.jsxs("div", {
                                    className: "wm-modal__body",
                                    children: [e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "模板名称 *"}), e.jsx("input", {
                                            value: T.draft.name,
                                            onChange: s => J({...T, draft: {...T.draft, name: s.target.value}})
                                        })]
                                    }), e.jsxs("span", {
                                        className: "wm-tiny",
                                        children: ["字段数：", T.draft.fields.length]
                                    })]
                                }), e.jsxs("div", {
                                    className: "wm-modal__footer",
                                    children: [e.jsx("div", {
                                        children: T.originalId ? e.jsx("button", {
                                            className: "wm-btn wm-btn--danger",
                                            type: "button",
                                            onClick: () => void ke(T.originalId),
                                            children: "删除"
                                        }) : null
                                    }), e.jsxs("div", {
                                        className: "wm-inline",
                                        children: [e.jsx("button", {
                                            className: "wm-btn",
                                            type: "button",
                                            onClick: () => J(null),
                                            children: "取消"
                                        }), e.jsx("button", {
                                            className: "wm-btn wm-btn--primary",
                                            type: "button",
                                            onClick: s => void rs(s.currentTarget),
                                            children: "保存"
                                        })]
                                    })]
                                })]
                            })
                        }) : null]
                    }) : null, u === "accounts" ? e.jsxs("div", {
                        className: "wm-sections", style: {gap: 20, marginBottom: 20}, children: [e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "筛选"}), e.jsxs("div", {
                                    className: "wm-inline",
                                    children: [e.jsx("button", {
                                        className: "wm-btn", type: "button", onClick: () => {
                                            F(""), R(""), xe("")
                                        }, children: "重置"
                                    }), e.jsx("button", {
                                        className: "wm-btn wm-btn--primary",
                                        type: "button",
                                        onClick: () => {
                                            if (!_ || !G) {
                                                WAAshowInlineError("请选择项目和环境");
                                                return
                                            }
                                            se({open: !0, projectId: _, envId: G, account: null})
                                        },
                                        children: "新增账号"
                                    })]
                                })]
                            }), e.jsx("div", {
                                className: "wm-card__bd",
                                children: e.jsxs("div", {
                                    className: "wm-grid wm-grid--3",
                                    children: [e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "项目"}), e.jsxs("select", {
                                            value: _,
                                            required: !0,
                                            onChange: s => {
                                                F(s.target.value), R("")
                                            },
                                            children: [e.jsx("option", {
                                                value: "",
                                                disabled: !0,
                                                children: "请选择项目"
                                            }), c.projects.map(s => e.jsx("option", {
                                                value: s.id,
                                                children: s.name
                                            }, s.id))]
                                        })]
                                    }), e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "环境"}), e.jsxs("select", {
                                            value: G,
                                            required: !0,
                                            disabled: !_,
                                            onChange: s => R(s.target.value),
                                            children: [e.jsx("option", {
                                                value: "",
                                                disabled: !0,
                                                children: "请选择环境"
                                            }), (($ == null ? void 0 : $.envs) ?? []).map(s => e.jsx("option", {
                                                value: s.id,
                                                children: s.name
                                            }, `${_}-${s.id}-${s.name}`))]
                                        })]
                                    }), e.jsxs("label", {
                                        className: "wm-field",
                                        children: [e.jsx("span", {children: "关键字"}), e.jsx("input", {
                                            value: ae,
                                            onChange: s => xe(s.target.value)
                                        })]
                                    })]
                                })
                            })]
                        }), e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsxs("div", {
                                className: "wm-card__hd",
                                children: [e.jsx("strong", {children: "账号列表"}), e.jsx("span", {
                                    className: "wm-tiny",
                                    children: "查询非敏感字段值"
                                })]
                            }), e.jsx("div", {
                                className: "wm-card__bd", children: ne.length > 0 ? e.jsxs("table", {
                                    className: "wm-table",
                                    children: [e.jsx("thead", {children: e.jsxs("tr", {children: [e.jsx("th", {children: "顺序"}), e.jsx("th", {children: "项目"}), e.jsx("th", {children: "环境"}), Se.map(s => e.jsx("th", {children: s.label}, s.key)), e.jsx("th", {children: "默认"}), e.jsx("th", {children: "操作"})]})}), e.jsx("tbody", {
                                        children: ne.map(({project: s, env: l, account: r}) => e.jsxs("tr", {
                                            className: accountDragId === r.id ? "wm-dragging-row" : void 0,
                                            onDragOver: f => {
                                                f.preventDefault(), f.dataTransfer && (f.dataTransfer.dropEffect = "move");
                                                const v = f.currentTarget.getBoundingClientRect();
                                                accountPreviewMove(s.id, l.id, accountDragId, r.id, f.clientY > v.top + v.height / 2)
                                            },
                                            onDrop: f => {
                                                f.preventDefault(), f.stopPropagation(), void accountDrop(f.currentTarget)
                                            },
                                            children: [e.jsx("td", {
                                                children: e.jsx("button", {
                                                    type: "button",
                                                    className: "wm-icon-btn",
                                                    title: "拖动排序",
                                                    draggable: !0,
                                                    onClick: f => f.stopPropagation(),
                                                    onDragStart: f => {
                                                        f.dataTransfer && (f.dataTransfer.effectAllowed = "move", f.dataTransfer.setData("text/plain", r.id)), f.dataTransfer?.setDragImage(f.currentTarget.closest("tr") ?? f.currentTarget, 0, 0), setAccountDragId(r.id)
                                                    },
                                                    onDragEnd: () => setAccountDragId(null),
                                                    children: "☰"
                                                })
                                            }), e.jsx("td", {children: s.name}), e.jsx("td", {children: l.name}), Se.map(f => {
                                                const v = s.fields.find(te => te.key === f.key),
                                                    S = `${s.id}:${l.id}:${r.id}:${f.key}`,
                                                    K = !!(v != null && v.sensitive && !Ve[S]),
                                                    vs = r.values[f.key] ?? "";
                                                return e.jsx("td", {
                                                    children: v ? e.jsxs("div", {
                                                        className: "wm-cell",
                                                        children: [e.jsx("span", {
                                                            className: "wm-code wm-cell__text",
                                                            children: K ? "******" : vs
                                                        }), v.sensitive ? e.jsx("button", {
                                                            className: "wm-icon-btn",
                                                            type: "button",
                                                            title: K ? "查看明文" : "隐藏明文",
                                                            onClick: async () => {
                                                                if (!K) {
                                                                    ze(te => ({...te, [S]: !1}));
                                                                    return
                                                                }
                                                                try {
                                                                    if (await WAAensureSensitiveAccess()) {
                                                                        let V = r.values[f.key];
                                                                        if (V && typeof V === "object" && V.__waaEncrypted) {
                                                                            let R = await chrome.runtime.sendMessage({
                                                                                type: "DECRYPT_VALUE",
                                                                                value: V
                                                                            });
                                                                            if (!R?.ok) throw new Error(R?.error ?? "解密失败");
                                                                            r.values[f.key] = R.value ?? ""
                                                                        }
                                                                        ze(te => ({...te, [S]: !0}))
                                                                    }
                                                                } catch (_err) {
                                                                    WAAshowInlineError(_err.message)
                                                                }
                                                            },
                                                            children: K ? "👁" : "🔒"
                                                        }) : null]
                                                    }) : null
                                                }, S)
                                            }), e.jsx("td", {children: r.isDefault ? "是" : ""}), e.jsx("td", {
                                                children: e.jsxs("div", {
                                                    className: "wm-table__actions",
                                                    children: [e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => se({
                                                            open: !0,
                                                            projectId: s.id,
                                                            envId: l.id,
                                                            account: r
                                                        }),
                                                        children: "编辑"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn",
                                                        type: "button",
                                                        onClick: () => void js(s.id, l.id, r.id),
                                                        children: "默认"
                                                    }), e.jsx("button", {
                                                        className: "wm-btn wm-btn--danger",
                                                        type: "button",
                                                        onClick: () => void ps(s.id, l.id, r.id),
                                                        children: "删除"
                                                    })]
                                                })
                                            })]
                                        }, `${s.id}-${l.id}-${r.id}`))
                                    })]
                                }) : e.jsx("div", {
                                    className: "wm-tiny",
                                    children: !_ || !G ? "请选择项目和环境后查看账号。" : "没有匹配账号。"
                                })
                            })]
                        })]
                    }) : null, u === "config" ? e.jsx("div", {
                        className: "wm-sections",
                        style: {gap: 20, marginBottom: 20},
                        children: e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsx("div", {
                                className: "wm-card__hd",
                                children: e.jsx("strong", {children: "数据配置"})
                            }), e.jsxs("div", {
                                className: "wm-card__bd",
                                children: [e.jsxs("div", {
                                    className: "wm-inline",
                                    style: {marginTop: 8},
                                    children: [e.jsx("button", {
                                        className: "wm-btn", type: "button", onClick: () => {
                                            var s;
                                            return (s = document.getElementById("import-json-input")) == null ? void 0 : s.click()
                                        }, children: "导入 JSON"
                                    }), e.jsx("button", {
                                        className: "wm-btn",
                                        type: "button",
                                        onClick: () => pe(!0),
                                        children: "导出 JSON"
                                    }), e.jsx("input", {
                                        id: "import-json-input",
                                        type: "file",
                                        accept: "application/json",
                                        style: {display: "none"},
                                        onChange: s => {
                                            var r;
                                            const l = (r = s.target.files) == null ? void 0 : r[0];
                                            l && xs(l)
                                        }
                                    })]
                                }), o.length > 0 ? e.jsx("div", {
                                    className: "wm-tiny",
                                    style: {marginTop: 8},
                                    children: o.map((s, l) => e.jsx("div", {children: `${s.path || "root"}: ${s.message}`}, `${s.path}-${l}`))
                                }) : null]
                            })]
                        })
                    }) : null, u === "config" ? e.jsx("div", {
                        className: "wm-sections", style: {gap: 20, marginBottom: 20}, children: e.jsxs("div", {
                            className: "wm-card",
                            children: [e.jsx("div", {
                                className: "wm-card__hd",
                                children: e.jsx("strong", {children: "同步通道"})
                            }), e.jsxs("div", {
                                className: "wm-card__bd",
                                children: [e.jsx("div", {
                                    className: "wm-inline",
                                    style: {marginBottom: 12},
                                    children: e.jsx("button", {
                                        type: "button",
                                        className: `wm-btn ${be === "minio" ? "wm-btn--primary" : ""}`,
                                        onClick: () => qe("minio"),
                                        children: "MinIO 同步"
                                    })
                                }), be === "minio" ? e.jsxs(e.Fragment, {
                                    children: [e.jsxs("div", {
                                        className: "wm-grid wm-grid--2",
                                        children: [e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Endpoint"}), e.jsx("input", {
                                                value: c.sync.endpoint ?? "",
                                                onChange: s => B({endpoint: s.target.value})
                                            })]
                                        }), e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Bucket"}), e.jsx("input", {
                                                value: c.sync.bucket ?? "",
                                                onChange: s => B({bucket: s.target.value})
                                            })]
                                        }), e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Access Key"}), e.jsx("input", {
                                                value: c.sync.accessKey ?? "",
                                                onChange: s => B({accessKey: s.target.value})
                                            })]
                                        }), e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Secret Key"}), e.jsx("input", {
                                                value: c.sync.secretKey ?? "",
                                                onChange: s => B({secretKey: s.target.value})
                                            })]
                                        }), e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Path Prefix"}), e.jsx("input", {
                                                value: c.sync.pathPrefix ?? "",
                                                onChange: s => B({pathPrefix: s.target.value})
                                            })]
                                        }), e.jsxs("label", {
                                            className: "wm-field",
                                            children: [e.jsx("span", {children: "Object Key"}), e.jsx("input", {
                                                value: c.sync.objectKey ?? "",
                                                onChange: s => B({objectKey: s.target.value})
                                            })]
                                        })]
                                    }), e.jsxs("div", {
                                        className: "wm-inline",
                                        style: {marginTop: 12},
                                        children: [e.jsxs("label", {
                                            className: "wm-inline",
                                            children: [e.jsx("input", {
                                                type: "checkbox",
                                                checked: c.sync.minioEnabled,
                                                onChange: s => B({minioEnabled: s.target.checked})
                                            }), "启用 MinIO"]
                                        }), e.jsx("button", {
                                            className: "wm-btn",
                                            type: "button",
                                            onClick: s => void ws(s.currentTarget),
                                            children: "远程 -> 本地"
                                        }), e.jsx("button", {
                                            className: "wm-btn wm-btn--success",
                                            type: "button",
                                            onClick: s => void bs(s.currentTarget),
                                            children: "本地 -> 远程"
                                        })]
                                    }), e.jsx("div", {
                                        className: "wm-tiny",
                                        style: {marginTop: 8},
                                        children: "保存按钮会把同步配置写回本地 JSON；同步按钮直接读写 MinIO 中的数据配置。"
                                    })]
                                }) : null]
                            })]
                        })
                    }) : null]
                })]
            })]
        }), e.jsx(Qs, {
            open: Z.open,
            project: Z.project,
            groups: P,
            fieldTemplates: D,
            title: Z.originalId ? "编辑项目" : "新增项目",
            onClose: () => ee({open: !1, originalId: null, project: null}),
            onSave: s => void es(Z.originalId, s)
        }), e.jsx(Me, {
            open: !!V,
            project: V ? c.projects.find(s => s.id === V) ?? null : null,
            title: "字段配置",
            onClose: () => ue(null),
            onSave: s => {
                V && us(V, s)
            }
        }), e.jsx(Me, {
            open: !!z, project: Ye, title: "模板字段配置", onClose: () => me(null), onSave: s => {
                z && cs(z, {fields: s}).then(() => me(null))
            }
        }), e.jsx(Ys, {
            open: !!X,
            project: X ? c.projects.find(s => s.id === X) ?? null : null,
            title: "环境配置",
            onClose: () => he(null),
            onSave: s => {
                X && ms(X, s)
            }
        }), e.jsx(Is, {
            open: M.open,
            project: M.projectId ? c.projects.find(s => s.id === M.projectId) ?? null : null,
            account: M.account,
            title: M.account ? "编辑账号" : "新增账号",
            onClose: () => se({open: !1, projectId: "", envId: "", account: null}),
            onSave: s => void hs(s)
        }), e.jsx(Zs, {
            open: Qe,
            config: c,
            onClose: () => pe(!1),
            onExport: ({projectIds: s, includeMinio: l}) => void ys(s, l)
        })]
    }) : e.jsx("div", {
        style: {padding: 24},
        children: e.jsxs("div", {
            className: "wm-card",
            children: [e.jsxs("div", {
                className: "wm-card__hd",
                children: [e.jsx("strong", {children: "账号管理助手"}), null]
            }), e.jsx("div", {className: "wm-card__bd", children: "正在加载配置"})]
        })
    })
}

Ns(document.getElementById("root")).render(e.jsx(mn, {}));
