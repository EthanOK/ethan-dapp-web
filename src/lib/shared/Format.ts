/** JSON.stringify that encodes bigint as decimal strings (for UI display). */
export function stringifyJson(value: unknown, space?: string | number): string {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? v.toString() : v),
    space
  );
}

export function truncateHash(hash: string, head = 18, tail = 18): string {
  const s = String(hash ?? "");
  if (!s) return "";
  if (s.length <= head + tail) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
