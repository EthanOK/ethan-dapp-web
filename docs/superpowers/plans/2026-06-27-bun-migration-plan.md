# Bun 迁移实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 ethan-dapp-web 项目从 Node.js/npm 迁移到 Bun 作为包管理器和运行时，保留 CRACO 作为构建工具。

**Architecture:** 使用 Bun 替代 npm 作为包管理器，用 Bun 运行所有脚本，保留现有的 CRACO/Webpack 构建配置。

**Tech Stack:** Bun, React 18, TypeScript, CRACO, Webpack

---

## 文件结构

**将修改的文件:**
- `package.json` - 更新 scripts 部分
- `.gitignore` - 添加 bun.lockb 忽略规则

**将创建的文件:**
- `bun.lockb` - Bun 锁文件（自动生成）

**将删除的文件:**
- `package-lock.json` - npm 锁文件

---

## 任务 1: 安装 Bun 并验证

**文件:** 无文件修改，仅安装和验证

- [ ] **Step 1: 安装 Bun**

```bash
curl -fsSL https://bun.sh/install | bash
```

- [ ] **Step 2: 验证 Bun 安装**

```bash
bun --version
```

预期输出: Bun 版本号

- [ ] **Step 3: 切换到项目目录**

```bash
cd /Users/ethan/workspace/web-projects/ethan-dapp-web
```

- [ ] **Step 4: 创建 Git 分支**

```bash
git checkout -b feat/bun-migration
```

---

## 任务 2: 迁移包管理器

**文件:**
- 删除: `package-lock.json`, `node_modules/`

- [ ] **Step 1: 备份当前依赖**

```bash
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup
```

- [ ] **Step 2: 删除 npm 缓存文件**

```bash
rm -rf node_modules package-lock.json
```

- [ ] **Step 3: 使用 Bun 安装依赖**

```bash
bun install
```

预期: 安装速度比 npm 快 5-10 倍

- [ ] **Step 4: 验证依赖安装**

```bash
ls node_modules | head -20
```

预期: 显示 node_modules 目录中的包

- [ ] **Step 5: 检查 Bun 锁文件**

```bash
ls -la bun.lockb
```

预期: 存在 `bun.lockb` 文件

---

## 任务 3: 更新 package.json 脚本

**文件:** 修改 `package.json` scripts 部分

- [ ] **Step 1: 更新 package.json scripts**

将 `package.json` 中的 `scripts` 部分从：

```json
"scripts": {
  "prepare": "husky install",
  "prettier": "prettier --write \"{src,tests}/**/*.{js,ts,tsx,json,css,md}\"",
  "typecheck": "tsc --noEmit",
  "start": "REACT_APP_VERSION=$npm_package_version craco start",
  "build": "GENERATE_SOURCEMAP=false REACT_APP_VERSION=$npm_package_version craco build",
  "preview": "serve -s build",
  "release": "standard-version --release-as patch"
}
```

更新为（使用 Bun 运行）：

```json
"scripts": {
  "prepare": "husky install",
  "prettier": "bun x prettier --write \"{src,tests}/**/*.{js,ts,tsx,json,css,md}\"",
  "typecheck": "bun x tsc --noEmit",
  "start": "REACT_APP_VERSION=$npm_package_version bun x craco start",
  "build": "GENERATE_SOURCEMAP=false REACT_APP_VERSION=$npm_package_version bun x craco build",
  "preview": "bun x serve -s build",
  "release": "bun x standard-version --release-as patch"
}
```

- [ ] **Step 2: 验证脚本更新**

```bash
cat package.json | jq '.scripts'
```

预期输出: 显示更新后的脚本

---

## 任务 4: 更新 .gitignore

**文件:** 修改 `.gitignore`

- [ ] **Step 1: 在 .gitignore 末尾添加 Bun 相关条目**

在 `.gitignore` 文件末尾添加：

```gitignore
# Bun
bun.lockb
```

- [ ] **Step 2: 验证 .gitignore 更新**

```bash
tail -5 .gitignore
```

预期: 显示添加的 Bun 相关条目

---

## 任务 5: 测试开发服务器

**文件:** 无文件修改，仅测试

- [ ] **Step 1: 启动开发服务器**

```bash
bun start
```

预期: 开发服务器在 http://localhost:3000 启动

- [ ] **Step 2: 等待服务器启动**

等待 10-15 秒，直到看到类似以下输出：

```
Compiled successfully!
```

- [ ] **Step 3: 停止服务器**

按 `Ctrl+C` 停止服务器

---

## 任务 6: 测试生产构建

**文件:** 无文件修改，仅测试

- [ ] **Step 1: 运行生产构建**

```bash
bun run build
```

预期: 构建成功，生成 `build/` 目录

- [ ] **Step 2: 验证构建输出**

```bash
ls -la build/
```

预期: 显示构建文件

---

## 任务 7: 测试 TypeScript 检查

**文件:** 无文件修改，仅测试

- [ ] **Step 1: 运行 TypeScript 检查**

```bash
bun run typecheck
```

预期: TypeScript 检查通过

---

## 任务 8: 清理备份文件

**文件:**
- 删除: `package.json.backup`
- 删除: `package-lock.json.backup`

- [ ] **Step 1: 删除备份文件**

```bash
rm -f package.json.backup package-lock.json.backup
```

---

## 任务 9: 提交更改

**文件:** 所有变更文件

- [ ] **Step 1: 检查 Git 状态**

```bash
git status
```

- [ ] **Step 2: 添加所有更改**

```bash
git add .
```

- [ ] **Step 3: 提交更改**

```bash
git commit -m "feat: migrate from npm to Bun as package manager"
```

- [ ] **Step 4: 验证提交**

```bash
git log -1
```

---

## 自我审查

### 1. 规范覆盖检查

- [x] 安装 Bun
- [x] 迁移包管理器
- [x] 更新脚本
- [x] 更新 .gitignore
- [x] 测试开发服务器
- [x] 测试生产构建
- [x] 测试 TypeScript 检查
- [x] 清理备份文件
- [x] 提交更改

### 2. 占位符扫描

无占位符，所有步骤都有具体命令和预期输出。

### 3. 类型一致性检查

所有命令和文件路径都是一致的。