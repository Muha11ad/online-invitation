// Nobody registers a guest any more: whatever name the link carries is the
// name the invitation greets. The only guard is length — the value is public
// and editable by anyone holding the link, and an absurdly long one would
// wreck the page layout. There is no escaping to do here; React escapes the
// text when it renders it.
const MAX_GUEST_NAME_LENGTH = 60;

export function parseGuestName(raw: string | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }

  // Deliberately not decodeURIComponent'd: Next already hands searchParams
  // over decoded, and decoding a second time throws a URIError on any name
  // containing a bare "%".
  const name = raw.trim();
  if (name.length === 0 || name.length > MAX_GUEST_NAME_LENGTH) {
    return undefined;
  }

  return name;
}
