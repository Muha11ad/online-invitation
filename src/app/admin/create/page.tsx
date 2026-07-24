import { WeddingForm } from "@/features/wedding-form/ui/WeddingForm";

export default function AdminCreatePage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Create Invitation</h1>
      <WeddingForm mode="create" />
    </div>
  );
}
