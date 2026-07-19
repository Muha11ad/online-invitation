import { notFound } from "next/navigation";

import { getWeddingBySlug } from "@/entities/wedding";

import { WeddingTemplateSwitch } from "@/widgets/wedding";

export default async function EventSlugPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;

  const doc = await getWeddingBySlug(slug);

  if (!doc) {
    notFound();
  }

  return <WeddingTemplateSwitch doc={doc} />;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}
