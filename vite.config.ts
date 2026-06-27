import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import envCompatible from "vite-plugin-env-compatible";
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
    envCompatible({
      prefix: "REACT_APP_",
    }),
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
    host: true,
    port: 3000,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    // SwapPage / Web3AuthPage are lazy routes (~1.4 MB each on demand only)
    chunkSizeWarningLimit: 1600,
    rolldownOptions: {
      // Rely on rolldown's automatic code splitting. Manual size-based groups
      // can reorder side-effectful modules (e.g. @reown) and break execution
      // ("n is not a function" at runtime), so we only keep package grouping
      // without maxSize and enforce execution order.
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: "reown",
              test: /node_modules[\\/]@reown[\\/]/,
              priority: 25,
            },
            {
              name: "solana",
              test: /node_modules[\\/]@solana[\\/]/,
              priority: 20,
            },
            {
              name: "ethers",
              test: /node_modules[\\/]ethers[\\/]/,
              priority: 20,
            },
            {
              name: "bric-sdk",
              test: /node_modules[\\/]@bric-labs[\\/]/,
              priority: 18,
            },
            {
              name: "web3auth",
              test: /node_modules[\\/]@web3auth[\\/]/,
              priority: 15,
            },
          ],
        },
      },
      // ox (via @base-org/account / @coinbase/wallet-sdk) misplaces @__PURE__ on object literals
      onLog(level, log, defaultHandler) {
        if (log.code === "INVALID_ANNOTATION") return;
        defaultHandler(level, log);
      },
    },
  },
});
