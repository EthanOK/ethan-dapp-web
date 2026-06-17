# Market 图表页增加 6M 时间范围

**Date:** 2026-05-28  
**Status:** Approved

## Goal

在 Market 详情页（`/market?coinId=...`）的时间范围切换栏中增加 **6M**（180 天），顺序为 `1W | 1M | 3M | 6M | 1Y`。

## Scope

- **In:** `MarketChartPage` 的 `TIME_RANGES` 常量；主工具栏与横屏工具栏（共用同一数组 map，自动生效）。
- **Out:** `HomePage` 市场列表、`coinGeckoApi.ts`、CSS、默认选中范围（仍为 1M / 30 天）。

## Behavior

| 标签 | days | API |
|------|------|-----|
| 6M | 180 | Area: `market_chart?days=180`（`days>=90` 时已有 `interval=daily`）；K-Line: `ohlc?days=180` |

选中 6M 时：`setActiveRange(180)` → 现有 `loadData(180)`、缓存键 `${coinId}-180` / `${coinId}-180-ohlc`、120s 内存缓存与错误重试逻辑不变。

## Implementation approach

**方案 A（已选）：** 在 `TIME_RANGES` 增加 `{ label: "6M", days: 180 }`，插入 `3M` 与 `1Y` 之间。不抽新文件、不改 API 层。

## Verification

1. 打开任意币种 Market 页，确认 tab 顺序含 6M 且位于 3M 与 1Y 之间。
2. 点击 6M：Area 图显示约半年价格与成交量；切换 K-Line 同样有效。
3. 移动端横屏模式工具栏含 6M 且可切换。
4. `npm run typecheck` 通过。

## Risks

- CoinGecko 限流：与 3M/1Y 相同，无额外风险。
- 移动端 tab 增多：`marketchart-tabs` 已 `flex-wrap`，无需改样式。
