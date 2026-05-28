export function truncateHash(hash: string, head = 18, tail = 18): string {
  const s = String(hash ?? "");
  if (!s) return "";
  if (s.length <= head + tail) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
