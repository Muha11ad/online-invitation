import { notFound } from "next/navigation";

import { getWeddingBySlug, hasCompleteLocale } from "@/entities/wedding";

import { resolveGuestName } from "@/shared/lib/guests";
import { resolveLocale } from "@/shared/i18n";

import { WeddingTemplateSwitch } from "@/widgets/wedding";

export default async function EventSlugPage({
  params,
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const lang = firstValue(resolvedSearchParams.lang);
  const guest = firstValue(resolvedSearchParams.guest);

  const doc = await getWeddingBySlug(slug);

  if (!doc) {
    notFound();
  }

  const locale = resolveLocale(lang);

  if (!hasCompleteLocale(doc, locale)) {
    notFound();
  }

  let guestName: string | undefined;
  if (guest !== undefined) {
    guestName = resolveGuestName(doc.guests, decodeURIComponent(guest));
    if (guestName === undefined) {
      notFound();
    }
  }

  return <WeddingTemplateSwitch doc={doc} locale={locale} guestName={guestName} />;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string | string[]; guest?: string | string[] }>;
}
