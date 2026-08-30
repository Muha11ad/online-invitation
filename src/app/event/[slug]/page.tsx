import { notFound } from "next/navigation";

import { getAvailableLocales, getWeddingBySlug } from "@/entities/wedding";

import { resolveGuestName } from "@/shared/lib/guests";

import { LocaleProvider, WeddingTemplateSwitch } from "@/widgets/wedding";

export default async function EventSlugPage({
  params,
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const guest = firstValue(resolvedSearchParams.guest);

  const doc = await getWeddingBySlug(slug);

  if (!doc) {
    notFound();
  }

  const availableLocales = getAvailableLocales(doc);

  if (availableLocales.length === 0) {
    notFound();
  }

  let guestName: string | undefined;
  if (guest !== undefined) {
    guestName = resolveGuestName(doc.guests, decodeURIComponent(guest));
    if (guestName === undefined) {
      notFound();
    }
  }

  return (
    <LocaleProvider
      slug={slug}
      availableLocales={availableLocales}
      initialLocale={availableLocales[0]}
    >
      <WeddingTemplateSwitch doc={doc} guestName={guestName} />
    </LocaleProvider>
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ guest?: string | string[] }>;
}
