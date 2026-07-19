import { notFound } from "next/navigation";

import { getWeddingBySlug } from "@/entities/wedding";

import { resolveGuestName } from "@/shared/lib/guests";

import { WeddingTemplateSwitch } from "@/widgets/wedding";

export default async function EventSlugGuestPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { slug, guest } = await params;

  const doc = await getWeddingBySlug(slug);

  if (!doc) {
    notFound();
  }

  const guestName = resolveGuestName(doc.guests, decodeURIComponent(guest));

  if (guestName === undefined) {
    notFound();
  }

  return <WeddingTemplateSwitch doc={doc} guestName={guestName} />;
}

interface PageProps {
  params: Promise<{ slug: string; guest: string }>;
}
