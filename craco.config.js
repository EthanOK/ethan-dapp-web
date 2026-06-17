const path = require("path");
const webpack = require("webpack");

const okxSuiSwapStub = path.resolve(
  __dirname,
  "src/stubs/okx-sui-swap-stub.cjs"
);
const valibotCjs = path.resolve(
  __dirname,
  "node_modules/valibot/dist/index.cjs"
);

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "node:events": require.resolve("events/"),
    },
    configure: (config) => {
      const fallback = config.resolve.fallback || {};
      Object.assign(fallback, {
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
        events: require.resolve("events/"),
      });
      config.resolve.fallback = fallback;

      config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        }),
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        }),
        // bric-sdk → okx-dex-sdk factory.js: require("./sui/sui-swap")
        new webpack.NormalModuleReplacementPlugin(
          /^\.\/sui\/sui-swap$/,
          (resource) => {
            if (resource.context.includes("okx-dex-sdk")) {
              resource.request = okxSuiSwapStub;
            }
          }
        ),
        // Fallback if @mysten/sui is still pulled elsewhere
        new webpack.NormalModuleReplacementPlugin(/^valibot$/, (resource) => {
          const ctx = resource.context.replace(/\\/g, "/");
          if (ctx.includes("@mysten/") || ctx.includes("/@mysten/")) {
            resource.request = valibotCjs;
          }
        }),
      ]);

      config.resolve.alias = {
        ...config.resolve.alias,
        events: require.resolve("events/"),
      };
      config.ignoreWarnings = [/Failed to parse source map/];
      config.module.rules.push({
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        enforce: "pre",
        loader: require.resolve("source-map-loader"),
        resolve: {
          fullySpecified: false,
        },
      });
      return config;
    },
  },
};
