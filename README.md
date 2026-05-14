# 账号管理助手

账号管理助手是一个 Manifest V3 Chrome 扩展，用于在匹配的登录页面上管理、选择和填充账号信息。扩展支持项目、环境、字段、账号、JSON 导入导出以及 MinIO 同步配置，数据默认保存在浏览器本地的 `chrome.storage.local` 中。

> 当前仓库看起来是已构建后的扩展产物，没有 `src/`、构建脚本或自动化测试配置。

## 功能概览

- 按项目分组维护账号配置。
- 按项目配置字段、环境、登录页域名和路径关键字。
- 在匹配登录页显示账号列表弹窗，可新增、编辑、删除和选择账号。
- 支持将账号字段填充到页面输入框。
- 支持敏感字段隐藏显示。
- 支持默认账号自动填充。
- 支持完整配置 JSON 的导入和导出。
- 支持 MinIO 作为远程同步通道。
- 工具栏图标会根据当前页面是否匹配配置切换为彩色或灰色图标。

## 目录结构

```text
.
├── manifest.json              # Chrome Extension Manifest V3 配置
├── background.js              # Service Worker，负责初始化、消息处理和图标状态更新
├── content.js                 # 内容脚本，在匹配页面注入账号面板并执行字段填充
├── page-guard.js              # 页面主世界脚本，处理部分登录页 CryptoJS 兼容问题
├── popup.html                 # 浏览器工具栏弹窗入口
├── extension.html             # 完整配置页面入口
├── assets/
│   ├── popup.js               # 弹窗页面逻辑
│   ├── popup.css              # 弹窗样式
│   ├── extension.js           # 完整配置页面逻辑
│   ├── extension.css          # 完整配置页面样式
│   ├── storage.js             # 本地配置读取、保存和归一化逻辑
│   └── client.js              # 前端运行时代码
├── icons/                     # 彩色和灰色扩展图标
├── AGENTS.md                  # 仓库协作说明
└── LICENSE
```

## 本地安装

1. 打开 Chrome，进入 `chrome://extensions`。
2. 开启右上角的“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本仓库目录。
5. 修改文件后，在扩展卡片上点击刷新按钮重新加载。

## 使用说明

### 1. 打开配置页面

加载扩展后，可以通过工具栏弹窗进入完整配置页面，也可以在扩展详情中打开扩展页面。完整配置入口文件是 `extension.html`。

### 2. 配置项目和环境

配置页面中主要维护以下内容：

- 全局配置：控制登录页是否显示账号列表弹窗。
- 项目分组：维护项目分类。
- 项目配置：维护项目名称、字段列表、环境列表和弹窗位置。
- 字段模板：复用常见字段配置。
- 账号配置：按项目和环境维护账号数据。
- 完整 JSON：直接查看、编辑、导入或导出完整配置。
- 同步配置：配置 MinIO 并执行本地与远程 JSON 同步。

页面匹配逻辑需要同时满足：

- 当前页面 host 匹配环境中的 `hosts` 配置。
- 当前页面路径、查询参数或 hash 包含环境中的 `pathKeywords` 任意关键字。

### 3. 配置字段选择器

字段用于描述账号值以及页面填充位置。内容脚本支持常见 CSS 选择器，也支持 XPath 风格的选择器。

常见写法：

```text
input[name="username"]
input[type="password"]
#login-form input[1]
xpath=//input[@name="username"]
//input[@type="password"]
```

字段如果被标记为敏感字段，会在列表中默认隐藏。字段名称或 key 包含 `password`、`passwd`、`pass`、`pwd`、`密码`、`口令` 等关键词时，代码中也会按敏感字段相关逻辑处理。

### 4. 在登录页使用

访问已配置匹配规则的登录页面后：

1. 页面右上方默认会显示账号管理面板。
2. 点击账号行会将该账号字段填充到页面输入框。
3. 已设置默认账号时，进入匹配页面后会尝试自动填充默认账号。
4. 可在面板内新增、编辑或删除当前环境下的账号。
5. 点击面板关闭按钮会关闭当前页面面板，并将扩展启用状态写入本地存储。

## 配置存储

配置保存在：

```js
chrome.storage.local["appConfig"]
```

扩展启用状态保存在：

```js
chrome.storage.local["extensionEnabled"]
```

可在扩展上下文控制台中查看当前配置：

```js
chrome.storage.local.get("appConfig").then(console.log)
```

当前默认配置结构大致如下：

```json
{
  "schemaVersion": "1.0",
  "global": {
    "showLoginAccountPanel": true
  },
  "projectGroups": [
    {
      "code": "default",
      "name": "默认分组",
      "description": ""
    }
  ],
  "fieldTemplates": [],
  "projects": [],
  "sync": {
    "minioEnabled": false
  },
  "meta": {
    "localRevision": 1
  }
}
```

## 权限说明

`manifest.json` 中声明的主要权限：

- `storage`：读取和保存本地账号配置。
- `tabs`：读取当前标签页信息，用于判断页面是否匹配配置。
- `activeTab`：访问当前活动标签页。
- `scripting`：支持扩展脚本注入能力。
- `clipboardWrite`：支持复制字段值。
- `<all_urls>`：在所有页面注入内容脚本，再由配置决定是否显示账号面板。

## 手动验证

修改后建议按以下步骤验证：

1. 在 `chrome://extensions` 重新加载扩展。
2. 打开工具栏弹窗，确认启用状态、当前页面匹配状态和账号列表显示正常。
3. 打开完整配置页，验证项目、字段、环境、账号的新增、编辑、删除和排序。
4. 导入和导出 JSON，确认配置结构有效。
5. 在代表性登录页面验证账号面板显示、默认账号填充和手动账号填充。
6. 打开扩展 Service Worker 控制台，确认没有运行时错误。
7. 如使用 MinIO，同步前后分别检查本地配置和远程对象内容。

## 开发说明

本仓库没有可用的构建命令。当前文件为可直接加载的扩展文件，修改时请注意：

- 尽量保持已构建文件的现有风格。
- 避免大范围格式化 `assets/*.js`，这些文件为压缩或构建产物。
- 涉及存储结构变更时，需要同步调整 `assets/storage.js` 的归一化逻辑。
- 涉及页面匹配或自动填充时，需要同时验证 `background.js` 和 `content.js` 的行为。
- 涉及权限变更时，需要更新 `manifest.json` 并在文档中说明原因。

## 安全提示

账号、密码和同步凭据等数据会保存在本地浏览器存储中。请注意：

- 不要提交真实账号、密码或导出的配置 JSON。
- 不要把包含真实 `accessKey`、`secretKey` 的 MinIO 配置提交到仓库。
- 使用同步能力前，确认远程 Bucket、对象 key 和访问权限范围符合预期。
- 在共享电脑或多人调试环境中使用前，先清理本地扩展数据。

## License

见 [LICENSE](./LICENSE)。
