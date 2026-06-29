import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import envCompatible from "vite-plugin-env-compatible";
import path from "path";
import { readFileSync } from "fs";

const analyze = process.env.ANALYZE === "true";

const okxSuiSwapStub = path.resolve(
  __dirname,
  "src/stubs/okx-sui-swap-stub.cjs"
);
const valibotCjs = path.resolve(
  __dirname,
  "node_modules/valibot/dist/index.cjs"
);

// Read the version straight from package.json so the build always reflects the
// real version. Relying on $npm_package_version is unsafe: `bun run` keeps an
// inherited npm_package_version (e.g. standard-version sets the pre-bump value),
// which would otherwise stamp the build with the old version during `release`.
const pkgVersion = JSON.parse(
  readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
).version;
process.env.REACT_APP_VERSION = pkgVersion;

export default defineConfig(async (): Promise<UserConfig> => ({
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
    ...(analyze
      ? [
          (await import("rollup-plugin-visualizer")).visualizer({
            filename: "build/stats.html",
            template: "treemap",
            gzipSize: true,
            brotliSize: true,
            emitFile: false,
          }),
        ]
      : []),
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
    port: 3001,
    strictPort: true,
  },
  build: {
    outDir: "build",
    sourcemap: false,
    // SwapPage / Web3AuthPage are lazy routes (~1.4 MB each on demand only)
    chunkSizeWarningLimit: 1600,
    rolldownOptions: {
      // Rely on rolldown's automatic code splitting. Manual vendor groups
      // (splitting @reown / @solana apart) broke cross-chunk references
      // ("PublicKey is not defined" at runtime), so we let rolldown decide.
      // ox (via @base-org/account / @coinbase/wallet-sdk) misplaces @__PURE__ on object literals
      onLog(level, log, defaultHandler) {
        if (log.code === "INVALID_ANNOTATION") return;
        defaultHandler(level, log);
      },
    },
  },
}));
