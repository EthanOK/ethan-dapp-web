"use strict";

/** Webpack stub: EVM-only app does not execute OKX Sui swaps. */
class SuiSwapExecutor {
  constructor() {
    throw new Error("Sui swap is not supported in this application");
  }

  async executeSwap() {
    throw new Error("Sui swap is not supported in this application");
  }
}

module.exports = { SuiSwapExecutor };
