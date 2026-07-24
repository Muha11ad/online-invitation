import { notFound } from "next/navigation";

import { getWeddingBySlug } from "@/entities/wedding";

import { WeddingForm } from "@/features/wedding-form/ui/WeddingForm";

export default async function AdminEditPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const wedding = await getWeddingBySlug(slug);

  if (!wedding) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Edit Invitation</h1>
      <WeddingForm mode="edit" initialValue={wedding} />
    </div>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}
