// UI-agnostic on purpose, like the rest of `shared/lib`: it reports whether
// the copy succeeded and leaves the caller to decide how to tell the user —
// every current caller happens to reach for the same toast copy, but that is
// a UI decision, not this helper's.
export async function copyToClipboard(text: string): Promise<boolean> {
  // `navigator.clipboard` is undefined outside a secure context (plain HTTP,
  // some embedded webviews), so a bare call would throw a TypeError before
  // ever reaching the permission prompt.
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
