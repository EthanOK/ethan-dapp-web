import { useCallback, useEffect, useState } from "react";
import {
  getStoredGasSpeed,
  setStoredGasSpeed,
  type GasSpeed
} from "@/lib/evm/GasStrategy";

/** User-selected gas speed tier (low / medium / high). */
export function useGasSpeed() {
  const [speed, setSpeedState] = useState<GasSpeed>(getStoredGasSpeed);

  useEffect(() => {
    const onSpeedChanged = (event: Event) => {
      const next = (event as CustomEvent<GasSpeed>).detail;
      if (next) setSpeedState(next);
    };
    window.addEventListener("app-gas-speed-changed", onSpeedChanged);
    return () =>
      window.removeEventListener("app-gas-speed-changed", onSpeedChanged);
  }, []);

  const setSpeed = useCallback((next: GasSpeed) => {
    setSpeedState(next);
    setStoredGasSpeed(next);
  }, []);

  return { speed, setSpeed };
}
