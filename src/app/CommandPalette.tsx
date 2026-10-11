import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/i18n";
import {
  ALL_PAGES,
  NAV_GROUPS,
  PALETTE_SHORTCUTS,
  type PaletteEntry
} from "@/app/navigation";
import { NavIcon } from "@/app/navIcons";

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

/**
 * ⌘K / Ctrl+K page launcher.
 *
 * The sidebar only pins ~19 routes, but the router has ~28 — deep tools like
 * `/eip7702` or unlisted pages like `/market` are otherwise unreachable
 * without typing a URL. Searching matches the translated title, the raw
 * route path and the latin `keywords` from `navigation.ts`, so it works in
 * every locale (typing "swap" while the UI is Chinese still hits BricSwap).
 */
export default function CommandPalette({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const ranked = ALL_PAGES.map((entry) => ({
      entry,
      title: t(entry.titleKey)
    }));

    if (!trimmed) {
      // No query: shortcuts first, then the sidebar order.
      const shortcutRank = new Map(
        PALETTE_SHORTCUTS.map((id, index) => [id, index])
      );
      return ranked
        .sort((a, b) => {
          const ra = shortcutRank.get(a.entry.id) ?? Number.MAX_SAFE_INTEGER;
          const rb = shortcutRank.get(b.entry.id) ?? Number.MAX_SAFE_INTEGER;
          return ra - rb;
        })
        .map((row) => row.entry);
    }

    const tokens = trimmed.split(/\s+/);
    const matched = ranked.filter(({ entry, title }) => {
      const haystack = [title, entry.to, ...(entry.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    // Title-prefix matches beat keyword-only matches.
    return matched
      .sort((a, b) => {
        const aStarts = a.title.toLowerCase().startsWith(trimmed) ? 0 : 1;
        const bStarts = b.title.toLowerCase().startsWith(trimmed) ? 0 : 1;
        if (aStarts !== bStarts) return aStarts - bStarts;
        return a.title.localeCompare(b.title);
      })
      .map((row) => row.entry);
  }, [query, t]);

  // Reset state every time the palette opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    // Autofocus after the panel mounts.
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Hand focus back to the trigger on close (keyboard users keep their place).
  useEffect(() => {
    if (open) return;
    const target = restoreFocusRef.current;
    restoreFocusRef.current = null;
    if (target && typeof target.focus === "function") target.focus();
  }, [open]);

  // Esc closes from anywhere in the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Keep the highlighted row inside the scroll viewport.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, results.length]);

  useEffect(() => {
    if (activeIndex > results.length - 1) setActiveIndex(0);
  }, [results.length, activeIndex]);

  const go = (entry: PaletteEntry) => {
    navigate(entry.to);
    onClose();
  };

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!results.length) {
      if (event.key === "Enter") event.preventDefault();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const entry = results[activeIndex];
      if (entry) go(entry);
    }
  };

  if (!open) return null;

  // Every entry comes from a NAV_GROUP, so the lookup always hits; the
  // overview group has no heading and contributes nothing.
  const groupLabel = (groupId: string): string | null => {
    const group = NAV_GROUPS.find((candidate) => candidate.id === groupId);
    return group?.titleKey ? t(group.titleKey) : null;
  };

  const rows: ReactNode[] = [];
  let lastGroupId = "";
  results.forEach((entry, index) => {
    if (entry.groupId !== lastGroupId) {
      lastGroupId = entry.groupId;
      const label = groupLabel(entry.groupId);
      if (label) {
        rows.push(
          <div className="cmd-group" key={`group-${entry.groupId}`}>
            {label}
          </div>
        );
      }
    }
    rows.push(
      <button
        type="button"
        key={entry.id}
        data-index={index}
        role="option"
        aria-selected={index === activeIndex}
        className={"cmd-item" + (index === activeIndex ? " is-active" : "")}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => go(entry)}
      >
        <span className="cmd-item-icon" aria-hidden>
          <NavIcon name={entry.id} size={16} />
        </span>
        <span className="cmd-item-label">{t(entry.titleKey)}</span>
        <span className="cmd-item-path">{entry.to}</span>
      </button>
    );
  });

  return (
    <div className="cmd-overlay" onMouseDown={onClose} role="presentation">
      <div
        className="cmd-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("command.title")}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cmd-head">
          <span className="cmd-head-icon" aria-hidden>
            <NavIcon name="search" size={16} />
          </span>
          <input
            ref={inputRef}
            className="cmd-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onInputKeyDown}
            placeholder={t("command.placeholder")}
            aria-label={t("command.title")}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="cmd-kbd">esc</kbd>
        </div>

        <div
          className="cmd-list"
          ref={listRef}
          role="listbox"
          aria-label={t("command.title")}
        >
          {rows.length ? (
            rows
          ) : (
            <div className="cmd-empty">{t("command.empty")}</div>
          )}
        </div>

        <div className="cmd-foot">
          <span className="cmd-foot-hints">{t("command.hints")}</span>
          <span className="cmd-foot-count">
            {results.length} {t("command.results")}
          </span>
        </div>
      </div>
    </div>
  );
}

export { MOD_KEY };
