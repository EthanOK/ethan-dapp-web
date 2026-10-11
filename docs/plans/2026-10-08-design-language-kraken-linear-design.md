# 设计语言迁移：暗色数据台（Linear 骨架 + Kraken 紫）

日期：2026-10-08
范围：全站 UI 视觉层。页面逻辑、路由、i18n 文案、业务代码不动。

## 决策记录

| 项 | 决定 |
|---|---|
| 改造深度 | 换设计语言（token + 组件形态 + 清硬编码），不引入组件库 |
| 视觉方向 | 暗色数据台：Linear 的暗色骨架 + Kraken 的紫色强调 |
| light 主题 | 保留并同步重做 |

### 参照来源修正

getdesign.md 对 Kraken 的一句话描述是 "Purple-accented dark UI，data-dense dashboards"，
但 `kraken/DESIGN.md` 实际内容是**白底浅色站**（`#ffffff` 底、`#101114` 文字）。
暗色骨架实际来自 `linear.app/DESIGN.md`（canvas `#010102`、四级 surface 阶梯、hairline `#23252a`）。
因此本方案为**混血**：Linear 提供暗色层级与度量，Kraken 只提供强调色。

| 层 | 取自 | 值 |
|---|---|---|
| 底色 / 层级 / hairline | Linear | `#010102` / `#0f1011` / `#141516` / `#18191a` / `#191a1b`、`#23252a`、`#34343a` |
| 强调色 | Kraken | `#7132f5`、`#5741d8`、`rgba(133,91,251,.16)` |
| 圆角 / 间距 / 字阶 | Linear | 4/8/12/16、4·8·12·16·24·32·48·96 |
| 涨跌语义色 | 沿用现有 | `#0ecb81` / `#f6465d`（Linear 与 Kraken 都未提供 trading 语义色） |

## 1. Token 层

### 暗色（默认）

```
canvas / surface
  --w3-bg-deep      #010102   surface-1  #0f1011   surface-2  #141516
  --w3-bg-elevated  #18191a   --w3-bg-hover #191a1b

border
  --w3-border         #23252a
  --w3-border-strong  #34343a
  --w3-border-focus   rgba(113,50,245,.65)

accent（Kraken 紫）
  --w3-accent       #7132f5
  --w3-accent-dim   #5741d8
  --w3-accent-soft  rgba(113,50,245,.16)
  --w3-accent-glow  rgba(113,50,245,.18)

text
  --w3-text        #f7f8f8
  --w3-text-muted  #d0d6e0
  --w3-text-dim    #8a8f98

semantic
  --w3-success  #0ecb81
  --w3-danger   #f6465d
  --w3-warning  #fbbf24   ← 原 --w3-secondary 琥珀黄降级为纯警告色

shape / spacing
  --w3-radius-sm 4px   --w3-radius 8px   --w3-radius-lg 12px   --w3-radius-xl 16px
  spacing 4 · 8 · 12 · 16 · 24 · 32 · 48 · 96
```

### light（对位反转）

紫在浅底上必须加深才够对比，故 accent 取 Kraken purple-deep。

```
  --w3-bg-deep #f5f6f6   --w3-bg-main #ffffff   --w3-bg-card #ffffff
  --w3-bg-elevated #fafafa   --w3-bg-hover #f1f2f4
  --w3-border #dedee5
  --w3-accent #5b1ecf
  --w3-text #101114   --w3-text-muted #686b82   --w3-text-dim #9497a9
```

### 字体

- display：**保留 Chakra Petch**（tech 品牌感来源）
- 正文 / UI：Chakra Petch → **Inter**（Kraken 与 Linear 均指定 Inter 为开源替代）
- 数字：**JetBrains Mono**（不变），并补 `font-variant-numeric: tabular-nums`
  —— 对应 Kraken "所有数字用等宽" 的原则

### 氛围层（弱化，不删除）

- `body::before` 终端网格：透明度 `0.035` → `0.02`
- `body::after`：三颗青色 radial 光晕 → 收敛为**一颗**紫色顶部光晕
- `--w3-shadow-glow` 保留，但只在焦点 / 强调元素上使用，不再做全局底噪

## 2. 组件形态

| 组件 | 现状 | 目标 |
|---|---|---|
| 卡片 | glass 模糊 + 青色内发光 | 实色 `surface-2` + 1px hairline + radius 12px + padding 24px；`backdrop-filter` 从 16px 降到 12px 且仅用于浮层（header / sidebar / modal） |
| 主按钮 | 各页自建：`cta-button`、`connect-button`、`swap-primary-btn`、`tools-generate-btn` 等 | 统一紫底、radius 8px、padding 8px 14px、高 40px。**先统一外观，类名不动** |
| 输入框 | `feature-field` / `swap-field` / `yg-field` / `home-field` | surface-1 + hairline + radius 8px + padding 8px 12px；focus = 2px 紫 ring @ 50% |
| 表格 | 行 12px 16px + hairline，已达标 | 表头硬编码 `#1a1a24` → 换 token（当前 light 下无覆盖，属 bug）；所有数字加 `tabular-nums` |
| Header | 64px、青色 active | 56px（Linear spec）、active 用 `--w3-accent-soft` |
| Sidebar | `rgba(7,7,13,.72)` 半透 + 青色选中 | canvas 实色 `#010102`、选中项紫底 |
| 密度 | 松散 | 卡片内 24px、区块间 96px |

约束（来自 Linear Do/Don't，本项目采纳）：

- 紫只用于：品牌标记、主 CTA、focus ring、链接强调。**不做区块背景、不做卡片填充**
- 不引入第二个彩色强调色
- 不用 pill 圆角做 CTA

## 3. 实施范围

代码现状：UI 类名**按页面分散**（`swap-*` / `market-*` / `home-*` / `eip7702-*` / `faucet-*` / `tools-*`），
无统一组件层。因此不做组件抽象，按三波推进，每波独立可验证。

### 波次 1 — Token

- 重写 `src/index.css`：暗色 + `html[data-theme="light"]` 双套
- 字体 `@import`：加入 Inter，Chakra Petch 只保留 display 权重
- `body::before` / `body::after` 弱化
- 交付物：`bun run typecheck` 通过，页面能跑

### 波次 2 — 清硬编码

| 文件 | 硬编码 hex 数 |
|---|---|
| `src/app/App.css` | 58 |
| `src/pages/MarketChartPage.css` | 14 |
| `src/components/swap/SwapTokenMarketInfoPanel.css` | 7 |
| `src/components/swap/SwapTokenPickerModal.css` | 7 |
| `src/pages/SwapPage.css` | 5 |
| `src/pages/MarketListPage.css` | 5 |
| `src/components/swap/SwapTxToast.css` | 4 |
| 其余 | 3 |

- 全部替换为 token
- 补 `html[data-theme="light"]` 覆盖（现有约 15 处）
- 修 `MarketListPage.css:104` 表头 `#1a1a24` 在 light 下无兜底的问题
- 补 `.market-list-change` 缺失的 `tabular-nums`

### 波次 3 — 形态

按第 2 节表格批量调整卡片 / 按钮 / 输入 / 导航 / 密度。

### 风险点

`src/pages/MarketChartPage.tsx` 有 19 处颜色供 lightweight-charts 的 canvas 绘制使用，
**无法读取 CSS 变量**，必须在 tsx 内同步维护一份常量并随主题切换。

## 4. 验收

- `bun run typecheck` 通过
- `bun run build` 通过
- 抽查 5 个代表页：Home、Markets、MarketChart、Swap、EIP-7702
- 暗色 / light 各过一遍，检查对比度与表头、图表、Toast 的读取
- 3 种语言各过一遍首页（字号变化可能影响排版）
- 移动端 ≤768px 过一遍（Header 由 64px 改为 56px）
