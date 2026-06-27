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
