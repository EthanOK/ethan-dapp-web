# Bun 迁移设计文档

## 概述

将 ethan-dapp-web 项目从 Node.js/npm/CRACO 工具链完全迁移到 Bun 工具链，以提升开发体验，包括更快的热重载、启动速度和构建时间。

## 当前状态

### 技术栈
- **运行时**: Node.js v22
- **包管理器**: npm
- **构建工具**: CRACO (Create React App Configuration Override)
- **打包器**: Webpack (通过 CRACO)
- **测试框架**: 无
- **框架**: React 18 + TypeScript

### 当前构建流程
1. `npm install` - 安装依赖
2. `npm start` - 启动开发服务器 (CRACO)
3. `npm run build` - 生产构建 (CRACO)
4. `npm run typecheck` - TypeScript 检查
5. `npm run prettier` - 代码格式化

### 当前配置文件
- `package.json` - 项目配置和脚本
- `tsconfig.json` - TypeScript 配置
- `craco.config.js` - CRACO/Webpack 配置
- `.env` / `.env.example` - 环境变量

## 目标状态

### 技术栈
- **运行时**: Bun
- **包管理器**: Bun
- **构建工具**: Bun 内置打包器
- **打包器**: Bun 打包器
- **测试框架**: 暂不添加
- **框架**: React 18 + TypeScript

### 目标构建流程
1. `bun install` - 安装依赖
2. `bun start` - 启动开发服务器
3. `bun run build` - 生产构建
4. `bun run typecheck` - TypeScript 检查
5. `bun run prettier` - 代码格式化

## 设计方案

### 方案 1: Bun 作为包管理器和运行时（推荐）

保留 CRACO 作为构建工具，但用 Bun 替代 npm 作为包管理器，并用 Bun 运行所有脚本。

**优点:**
- 迁移风险低
- 保持构建配置不变
- 立即获得 Bun 的性能优势
- 可以逐步迁移构建工具

**缺点:**
- 仍然依赖 Node.js 运行时（通过 Bun）
- 构建工具未优化

**实施步骤:**

1. **安装 Bun**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **迁移包管理器**
   ```bash
   # 删除 node_modules 和 package-lock.json
   rm -rf node_modules package-lock.json
   
   # 使用 Bun 安装依赖
   bun install
   ```

3. **更新 package.json 脚本**
   ```json
   {
     "scripts": {
       "start": "bun x craco start",
       "build": "GENERATE_SOURCEMAP=false REACT_APP_VERSION=$npm_package_version bun x craco build",
       "preview": "bun x serve -s build",
       "typecheck": "bun x tsc --noEmit",
       "prettier": "bun x prettier --write \"{src,tests}/**/*.{js,ts,tsx,json,css,md}\"",
       "release": "bun x standard-version --release-as patch"
     }
   }
   ```

4. **验证功能**
   ```bash
   bun start
   bun run build
   bun run typecheck
   ```

### 方案 2: Bun + Vite 完全替换

用 Bun 作为包管理器，用 Vite 替代 CRACO 作为构建工具。

**优点:**
- 现代化工具链
- 构建速度更快
- 更好的开发体验

**缺点:**
- 需要重写构建配置
- 可能需要调整某些依赖
- 迁移工作量较大

**实施步骤:**

1. **安装 Bun 和 Vite**
   ```bash
   curl -fsSL https://bun.sh/install | bash
   rm -rf node_modules package-lock.json
   bun install
   bun add -D vite @vitejs/plugin-react
   ```

2. **创建 Vite 配置**
   ```typescript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': '/src',
       },
     },
     server: {
       port: 3000,
     },
     build: {
       outDir: 'build',
     },
   });
   ```

3. **迁移 index.html**
   将 `public/index.html` 移动到项目根目录并修改。

4. **更新 package.json 脚本**
   ```json
   {
     "scripts": {
       "start": "bun x vite",
       "build": "GENERATE_SOURCEMAP=false REACT_APP_VERSION=$npm_package_version bun x vite build",
       "preview": "bun x vite preview",
       "typecheck": "bun x tsc --noEmit",
       "prettier": "bun x prettier --write \"{src,tests}/**/*.{js,ts,tsx,json,css,md}\"",
       "release": "bun x standard-version --release-as patch"
     }
   }
   ```

### 方案 3: 渐进式迁移

先添加 Bun 支持，再逐步移除旧工具。

**优点:**
- 风险最低
- 可以逐步验证
- 保持向后兼容

**缺点:**
- 迁移周期较长
- 维护两套工具链
- 最终仍需完成完全迁移

**实施步骤:**

1. **安装 Bun 并添加为开发依赖**
   ```bash
   bun install -D bun
   ```

2. **添加 Bun 脚本**
   在 `package.json` 中添加：
   ```json
   {
     "scripts": {
       "bun:start": "bun x craco start",
       "bun:build": "bun x craco build"
     }
   }
   ```

3. **测试 Bun 兼容性**
   ```bash
   bun run bun:start
   bun run bun:build
   ```

4. **逐步迁移**
   - 先用 Bun 作为包管理器
   - 再用 Bun 运行构建
   - 最后移除 Node.js/npm 配置

### 方案 2: 渐进式迁移

先添加 Bun 支持，再逐步移除旧工具。

**优点:**
- 风险较低
- 可以逐步验证
- 保持向后兼容

**缺点:**
- 迁移周期较长
- 维护两套工具链
- 最终仍需完成完全迁移

**实施步骤:**

1. **安装 Bun 并添加为开发依赖**
   ```bash
   bun install -D bun
   ```

2. **添加 Bun 脚本**
   在 `package.json` 中添加：
   ```json
   {
     "scripts": {
       "bun:start": "bun x craco start",
       "bun:build": "bun x craco build"
     }
   }
   ```

3. **测试 Bun 兼容性**
   ```bash
   bun run bun:start
   bun run bun:build
   ```

4. **逐步迁移**
   - 先用 Bun 作为包管理器
   - 再用 Bun 运行构建
   - 最后移除 Node.js/npm 配置

### 方案 3: 使用 Vite 替代 CRACO

使用现代构建工具 Vite 替代 CRACO，同时使用 Bun 作为包管理器。

**优点:**
- Vite 专为现代 Web 开发设计
- 构建速度极快
- 优秀的开发体验

**缺点:**
- 需要重写构建配置
- 可能需要调整某些依赖
- 学习曲线

**实施步骤:**

1. **安装 Vite 和相关插件**
   ```bash
   bun add -D vite @vitejs/plugin-react
   ```

2. **创建 Vite 配置**
   ```typescript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         '@': '/src',
       },
     },
     server: {
       port: 3000,
     },
     build: {
       outDir: 'build',
     },
   });
   ```

3. **迁移 index.html**
   将 `public/index.html` 移动到项目根目录并修改。

4. **更新导入路径**
   Vite 使用不同的模块解析方式。

## 架构设计

### 构建流程架构

**方案 1 (推荐): Bun 作为包管理器和运行时**
```
当前架构:
Node.js → npm → CRACO → Webpack → React 应用

目标架构:
Bun → Bun 包管理器 → CRACO → Webpack → React 应用
```

**方案 2: Bun + Vite 完全替换**
```
当前架构:
Node.js → npm → CRACO → Webpack → React 应用

目标架构:
Bun → Bun 包管理器 → Vite → React 应用
```

### 文件结构变化

**当前:**
```
├── package.json          # npm 配置
├── package-lock.json     # npm 锁文件
├── craco.config.js       # CRACO 配置
├── node_modules/         # npm 依赖
└── ...
```

**方案 1 目标:**
```
├── package.json          # Bun 配置
├── bun.lockb             # Bun 锁文件（二进制）
├── craco.config.js       # CRACO 配置（保留）
├── node_modules/         # Bun 依赖
└── ...
```

**方案 2 目标:**
```
├── package.json          # Bun 配置
├── bun.lockb             # Bun 锁文件（二进制）
├── vite.config.ts        # Vite 配置
├── index.html            # Vite 入口文件
├── node_modules/         # Bun 依赖
└── ...
```

### 脚本映射

| 当前脚本 | Bun 脚本 | 说明 |
|---------|---------|------|
| `npm start` | `bun start` | 启动开发服务器 |
| `npm run build` | `bun run build` | 生产构建 |
| `npm run typecheck` | `bun run typecheck` | TypeScript 检查 |
| `npm run prettier` | `bun run prettier` | 代码格式化 |
| `npm run release` | `bun run release` | 版本发布 |

## 兼容性考虑

### 依赖兼容性
- Bun 兼容 npm 包，大多数依赖应正常工作
- 需要测试 Web3 相关依赖（ethers.js, Solana SDK 等）
- 某些原生模块可能需要额外配置

### 环境变量
- Bun 支持 `.env` 文件，与 Node.js 兼容
- `REACT_APP_*` 变量在构建时自动注入（通过 CRACO/Vite）
- Bun 运行时可以直接访问 `process.env` 中的变量
- 无需额外配置，现有 `.env` 文件可直接使用

### 构建配置
- CRACO 的 Webpack 配置需要转换为 Bun 配置
- 路径别名（`@/` → `src/`）需要在 Bun 中配置
- Polyfill 和 fallback 需要重新实现

## 风险评估

### 高风险
1. **原生模块兼容性**: 某些 Web3 依赖可能包含原生模块
2. **构建配置迁移**: 复杂的 Webpack 配置可能难以完全转换
3. **环境变量注入**: `REACT_APP_*` 变量处理方式不同

### 中风险
1. **TypeScript 配置**: 模块解析方式可能需要调整
2. **路径别名**: 需要确保 `@/` 别名正常工作
3. **热重载**: 开发服务器的热重载行为可能不同

### 低风险
1. **包管理器切换**: Bun 与 npm 高度兼容
2. **脚本执行**: 大多数 npm 脚本可直接用 Bun 运行
3. **TypeScript 检查**: tsc 命令应正常工作

## 测试策略

### 功能测试
1. 开发服务器启动
2. 热重载功能
3. 生产构建
4. 环境变量注入
5. 路径别名解析

### 性能测试
1. 安装时间对比
2. 启动时间对比
3. 构建时间对比
4. 热重载速度对比

### 兼容性测试
1. Web3 钱包连接
2. 智能合约交互
3. 多链支持（EVM, Solana, Bitcoin）

## 实施计划

### 方案 1: Bun 作为包管理器和运行时（推荐）

**阶段 1: 准备（1 小时）**
1. 备份当前配置
2. 安装 Bun
3. 创建新的分支

**阶段 2: 包管理器迁移（1 小时）**
1. 删除 `node_modules` 和 `package-lock.json`
2. 使用 `bun install` 安装依赖
3. 验证依赖安装正确

**阶段 3: 脚本迁移（1 小时）**
1. 更新 `package.json` 脚本
2. 测试开发服务器
3. 测试生产构建

**阶段 4: 功能验证（2 小时）**
1. 测试所有页面功能
2. 验证 Web3 连接
3. 性能对比测试

**阶段 5: 清理（1 小时）**
1. 更新文档
2. 提交更改

### 方案 2: Bun + Vite 完全替换

**阶段 1: 准备（1 小时）**
1. 备份当前配置
2. 安装 Bun
3. 创建新的分支

**阶段 2: 包管理器迁移（1 小时）**
1. 删除 `node_modules` 和 `package-lock.json`
2. 使用 `bun install` 安装依赖
3. 安装 Vite 和插件

**阶段 3: 构建配置迁移（3-4 小时）**
1. 创建 Vite 配置
2. 迁移 index.html
3. 更新导入路径
4. 调整 TypeScript 配置

**阶段 4: 功能验证（2-3 小时）**
1. 测试所有页面功能
2. 验证 Web3 连接
3. 测试生产构建
4. 性能对比测试

**阶段 5: 清理（1 小时）**
1. 移除旧的配置文件（CRACO）
2. 更新文档
3. 提交更改

## 成功标准

1. **功能完整**: 所有现有功能正常工作，包括：
   - 开发服务器启动（`bun start`）
   - 热重载功能
   - 生产构建（`bun run build`）
   - TypeScript 检查（`bun run typecheck`）
   - 代码格式化（`bun run prettier`）

2. **性能提升**: 
   - 包安装时间减少 50% 以上
   - 开发服务器启动时间减少 30% 以上
   - 生产构建时间减少 20% 以上

3. **兼容性**:
   - 所有 Web3 钱包连接正常
   - 智能合约交互正常
   - 多链支持（EVM, Solana, Bitcoin）正常

4. **无破坏性更改**: 
   - 现有用户无需修改任何配置
   - 环境变量保持兼容
   - 部署流程保持兼容

## 回滚计划

如果迁移失败，可以：
1. 切换回原来的分支
2. 恢复 `package.json` 和配置文件
3. 重新运行 `npm install`

## 后续优化

1. **添加 Bun 测试**: 使用 Bun 内置测试运行器
2. **优化构建**: 利用 Bun 的原生 TypeScript 支持
3. **性能监控**: 建立基准测试
4. **Docker 优化**: 更新 Dockerfile 使用 Bun