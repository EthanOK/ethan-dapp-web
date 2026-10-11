import { useEffect, useRef } from "react";

/**
 * Close a popover when a pointer lands outside of it.
 *
 * The listener is attached on a `setTimeout(0)` so the very click that opened
 * the popover (which is still bubbling) cannot immediately close it again.
 * This is the pattern the header menus already used inline; extracted so the
 * settings menu and the network picker share one implementation.
 */
export function useOutsideDismiss<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onDismiss: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const timerId = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onDismiss]);

  return ref;
}
