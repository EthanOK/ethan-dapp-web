# Market 6M Range Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6M (180-day) time range tab to the Market chart page between 3M and 1Y.

**Architecture:** Extend the existing `TIME_RANGES` constant in `MarketChartPage.tsx`. All data loading, caching, and UI tabs already derive from this array—no API or CSS changes.

**Tech Stack:** React 18, CoinGecko API via `coinGeckoApi.ts`, lightweight-charts.

---

### Task 1: Add 6M to TIME_RANGES

**Files:**
- Modify: `src/pages/MarketChartPage.tsx` — `TIME_RANGES` array

- [ ] **Step 1:** Insert `{ label: "6M", days: 180 }` after the 3M entry and before 1Y.

```typescript
const TIME_RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 }
] as const;
```

- [ ] **Step 2:** Run `npm run typecheck` and confirm zero errors.

- [ ] **Step 3:** Manual smoke test—select a coin, click 6M, verify Area and K-Line load; check landscape toolbar on mobile width if available.
