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

  const hasHexPrefix = s.length >= 2 && s.slice(0, 2).toLowerCase() === "0x";
  const prefix = hasHexPrefix ? "0x" : "";
  const body = hasHexPrefix ? s.slice(2) : s;

  if (body.length <= head + tail) return s;
  return `${prefix}${body.slice(0, head)}…${body.slice(-tail)}`;
}
