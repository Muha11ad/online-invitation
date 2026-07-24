export function parseGuestsInput(text: string): string[] | undefined {
  const guests = text
    .split(",")
    .map((guest) => guest.trim())
    .filter((guest) => guest.length > 0);

  return guests.length > 0 ? guests : undefined;
}

export function guestsToText(guests: string[] | undefined): string {
  return guests?.join(", ") ?? "";
}
