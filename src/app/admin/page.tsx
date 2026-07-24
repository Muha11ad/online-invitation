import Link from "next/link";

import { listWeddings } from "@/entities/wedding";

import { Button } from "@/shared/ui/button";

import { EventsTable } from "@/features/wedding-list/ui/EventsTable";
import type { EventsTableRowData } from "@/features/wedding-list/ui/EventsTable";

// The invitations list must always reflect the current DB state, not a
// build-time snapshot.
export const dynamic = "force-dynamic";

export default async function AdminPage(): Promise<React.JSX.Element> {
  const weddings = await listWeddings();
  const rows: EventsTableRowData[] = weddings.map((wedding) => ({
    slug: wedding.slug,
    template: wedding.template,
    names: wedding.names,
    date: wedding.date,
    guests: wedding.guests,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Invitations</h1>
        <Button render={<Link href="/admin/create" />}>Create Invitation</Button>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No invitations yet.</p>
          <Button render={<Link href="/admin/create" />}>Create Invitation</Button>
        </div>
      ) : (
        <EventsTable weddings={rows} />
      )}
    </div>
  );
}
