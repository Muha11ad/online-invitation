export function resolveGuestName(
  guests: string[] | undefined,
  requested: string | undefined,
): string | undefined {
  if (!guests || !requested) {
    return undefined;
  }

  const target = requested.trim().toLowerCase();
  if (!target) {
    return undefined;
  }

  return guests.find((guest) => guest.trim().toLowerCase() === target);
}
