# Bun + Vite 完全替换实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ethan-dapp-web 项目从 Node.js/npm/CRACO 完全迁移到 Bun + Vite，获得更快的开发和构建体验。

**Architecture:** 使用 Bun 替代 npm 作为包管理器，用 Vite 替代 CRACO/Webpack 作为构建工具，保留 React 18 + TypeScript 技术栈。

**Tech Stack:** Bun, Vite, React 18, TypeScript

---

## craco.config.js - vite.config.ts 迁移映射

| CRACO/Webpack 配置 | Vite 等价配置 |
|---|---|
| alias: `@` - `path.resolve(__dirname, "src")` | resolve.alias: `@` - `/src` |
| alias: `node:events` - `require.resolve("events/")` | resolve.alias: `node:events` - `events` |
| ProvidePlugin({ process: "process/browser", Buffer: ["buffer", "Buffer"] }) | vite-plugin-node-polyfills |
| NormalModuleReplacementPlugin(/^node:/) | 自定义 plugin |
| NormalModuleReplacementPlugin for okx-sui-swap | 自定义 plugin |
| NormalModuleReplacementPlugin for valibot | 自定义 plugin |
| fallback: crypto, stream, assert, http, etc. | vite-plugin-node-polyfills |
| source-map-loader | Vite 内置支持 |

---

## 文件结构

**将创建的文件:**
- `vite.config.ts` - Vite 配置
- `src/env.d.ts` - Vite 环境类型声明
- `index.html` - Vite 入口 HTML（项目根目录）

**将修改的文件:**
- `package.json` - 更新 scripts、添加 Vite 依赖
- `tsconfig.json` - 更新 moduleResolution
- `.gitignore` - 添加 Vite/Bun 相关文件

**将删除的文件:**
- `craco.config.js` - CRACO 配置
- `public/index.html` - CRA 入口 HTML（迁移到根目录）
- `package-lock.json` - npm 锁文件
- `node_modules/` - npm 依赖

---

## 任务 1: 安装 Bun 并创建分支

**文件:** 无文件修改

- [ ] **Step 1: 安装 Bun**

```bash
curl -fsSL https://bun.sh/install | bash
```

- [ ] **Step 2: 验证安装**

```bash
bun --version
```

- [ ] **Step 3: 创建 Git 分支**

```bash
cd /Users/ethan/workspace/web-projects/ethan-dapp-web
git checkout -b feat/bun-vite-migration
```

---

## 任务 2: 迁移到 Bun 包管理器

**文件:**
- 删除: `package-lock.json`, `node_modules/`
- 创建: `bun.lockb`（自动生成）

- [ ] **Step 1: 备份关键文件**

```bash
cp package.json package.json.bak
cp craco.config.js craco.config.js.bak
cp public/index.html public/index.html.bak
```

- [ ] **Step 2: 删除旧依赖**

```bash
rm -rf node_modules package-lock.json
```

- [ ] **Step 3: 用 Bun 安装依赖**

```bash
bun install
```

- [ ] **Step 4: 验证安装**

```bash
ls bun.lockb
ls node_modules | head -10
```

---

## 任务 3: 安装 Vite 和插件

**文件:**
- 修改: `package.json`（添加 Vite 依赖）

- [ ] **Step 1: 安装 Vite 核心**

```bash
bun add -D vite @vitejs/plugin-react
```

- [ ] **Step 2: 安装 Node polyfill 插件**

```bash
bun add -D vite-plugin-node-polyfills
```

- [ ] **Step 3: 验证安装**

```bash
cat package.json | grep -E "vite|plugin-react|node-polyfills"
```

---

## 任务 4: 创建 Vite 配置

**文件:** 创建 `vite.config.ts`

- [ ] **Step 1: 创建 vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import path from "path";
import { readFileSync } from "fs";

const okxSuiSwapStub = path.resolve(
  __dirname,
  "src/stubs/okx-sui-swap-stub.cjs"
);
const valibotCjs = path.resolve(
  __dirname,
  "node_modules/valibot/dist/index.cjs"
);

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "events", "stream", "util", "crypto"],
      globals: { Buffer: true, process: true },
    }),
    {
      name: "okx-sui-swap-stub",
      resolveId(source, importer) {
        if (
          source === "./sui/sui-swap" &&
          importer &&
          importer.includes("okx-dex-sdk")
        ) {
          return okxSuiSwapStub;
        }
      },
      load(id) {
        if (id === okxSuiSwapStub) {
          return readFileSync(okxSuiSwapStub, "utf-8");
        }
      },
    },
    {
      name: "valibot-mysten-stub",
      resolveId(source, importer) {
        if (
          source === "valibot" &&
          importer &&
          (importer.includes("@mysten/") || importer.includes("/@mysten/"))
        ) {
          return valibotCjs;
        }
      },
    },
    {
      name: "node-prefix-alias",
      resolveId(source) {
        if (source.startsWith("node:")) {
          return source.slice(5);
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "node:events": "events",
      events: "events",
    },
  },
  envPrefix: "REACT_APP_",
  define: {
    global: "globalThis",
  },
  css: {
    devSourcemap: true,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
```

---

## 任务 5: 迁移 index.html 到项目根目录

**文件:** 创建 `index.html`（根目录，Vite 入口）

- [ ] **Step 1: 在项目根目录创建 index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="alternate icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#06060a" />
    <meta
      name="description"
      content="0xEthan DApp — Multi-chain Web3 tools: NFT, DeFi, ENS, Faucet & more"
    />
    <link rel="apple-touch-icon" href="/logo192.png" />
    <link rel="manifest" href="/manifest.json" />
    <title>Ethan DApp</title>
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id="75901ce6-8cc5-4748-853d-bdbf3915e0ed"
    ></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

---

## 任务 6: 创建 Vite 环境类型声明

**文件:** 创建 `src/env.d.ts`

- [ ] **Step 1: 创建 env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_VERSION: string;
  readonly REACT_APP_WALLETCONNECT_PROJECTID: string;
  readonly REACT_APP_ALCHEMY_MAINNET_URL: string;
  readonly REACT_APP_ALCHEMY_KEY_V3: string;
  readonly REACT_APP_MAINNET_RPC: string;
  readonly REACT_APP_SEPOLIA_RPC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 任务 7: 更新 tsconfig.json

**文件:** 修改 `tsconfig.json`

- [ ] **Step 1: 更新 TypeScript 配置**

将 `tsconfig.json` 更新为：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["vite/client"]
  },
  "include": ["src", "vite.config.ts"]
}
```

---

## 任务 8: 更新 package.json scripts 并移除 CRACO

**文件:** 修改 `package.json`

- [ ] **Step 1: 更新 scripts 部分**

```json
{
  "scripts": {
    "prepare": "husky install",
    "prettier": "bun x prettier --write \"{src,tests}/**/*.{js,ts,tsx,json,css,md}\"",
    "typecheck": "bun x tsc --noEmit",
    "start": "bun x vite",
    "build": "bun x vite build",
    "preview": "bun x vite preview",
    "release": "bun x standard-version --release-as patch"
  }
}
```

- [ ] **Step 2: 移除 CRACO 依赖**

```bash
bun remove @craco/craco
```

---

## 任务 9: 更新 .gitignore

**文件:** 修改 `.gitignore`

- [ ] **Step 1: 在 .gitignore 末尾添加**

```gitignore
# Bun
bun.lockb

# Vite
dist
*.local
```

---

## 任务 10: 测试开发服务器

**文件:** 无文件修改

- [ ] **Step 1: 启动 Vite 开发服务器**

```bash
bun start
```

- [ ] **Step 2: 验证控制台输出**

预期看到：`VITE v5.x.x  ready in xxx ms`

- [ ] **Step 3: 在浏览器验证页面加载**

- [ ] **Step 4: 停止服务器 (Ctrl+C)**

---

## 任务 11: 测试生产构建

**文件:** 无文件修改

- [ ] **Step 1: 运行生产构建**

```bash
bun run build
```

- [ ] **Step 2: 验证构建输出**

```bash
ls -la build/
```

- [ ] **Step 3: 测试预览服务器**

```bash
bun run preview
```

- [ ] **Step 4: 停止服务器 (Ctrl+C)**

---

## 任务 12: 测试 TypeScript 检查

**文件:** 无文件修改

- [ ] **Step 1: 运行类型检查**

```bash
bun run typecheck
```

- [ ] **Step 2: 修复类型错误（如有）**

---

## 任务 13: 清理旧文件

**文件:**
- 删除: `craco.config.js`, `public/index.html`

- [ ] **Step 1: 删除 CRACO 配置**

```bash
rm craco.config.js
```

- [ ] **Step 2: 删除旧 index.html**

```bash
rm public/index.html
```

- [ ] **Step 3: 删除备份文件**

```bash
rm -f package.json.bak craco.config.js.bak public/index.html.bak
```

---

## 任务 14: 更新文档并提交

**文件:** 修改 `README.md`, `CLAUDE.md`

- [ ] **Step 1: 更新 README.md 中的命令**

将 `npm start` / `npm run build` 更新为 `bun start` / `bun run build`

- [ ] **Step 2: 更新 CLAUDE.md 中的 Commands 部分**

```markdown
| `bun start` | Dev server (Vite) at localhost:3000 |
| `bun run build` | Production build - `build/` |
| `bun run typecheck` | TypeScript check (no emit) |
| `bun run prettier` | Format source files |
| `bun run release` | Patch version bump (standard-version) |
```

- [ ] **Step 3: 提交更改**

```bash
git add .
git commit -m "feat: migrate from CRACO/Webpack to Bun + Vite

- Replace npm with Bun for faster dependency management
- Replace CRACO/Webpack with Vite for faster dev/build
- Migrate index.html to project root (Vite convention)
- Add vite.config.ts with polyfills and path aliases
- Update tsconfig.json for Vite compatibility
- Remove CRACO configuration"
```

---

## CRACO 配置迁移完整性检查

| 原始配置 | Vite 等价 | 已覆盖 |
|---|---|---|
| `@` 别名 | resolve.alias | [x] |
| `node:events` 别名 | resolve.alias | [x] |
| ProvidePlugin (process, Buffer) | vite-plugin-node-polyfills | [x] |
| node: 前缀替换 | 自定义 plugin | [x] |
| okx-sui-swap 替换 | 自定义 plugin | [x] |
| valibot @mysten 替换 | 自定义 plugin | [x] |
| Node polyfill fallback | vite-plugin-node-polyfills | [x] |
| source-map-loader | Vite 内置 | [x] |