import Link from "next/link";
import { Suspense } from "react";

import { listWeddings } from "@/entities/wedding";

import { Button } from "@/shared/ui/button";

import { EventsTable } from "@/features/wedding-list/ui/EventsTable";
import type { EventsTableRowData } from "@/features/wedding-list/ui/EventsTable";

// The invitations list must always reflect the current DB state, not a
// build-time snapshot.
export const dynamic = "force-dynamic";

export default function AdminPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Invitations</h1>
        <Button render={<Link href="/admin/create" />}>Create Invitation</Button>
      </div>

      {/* Only the DB read sits behind the boundary, so the header renders
          immediately instead of the whole page blocking on MongoDB. The
          fallback lives here rather than in an admin/loading.tsx file, which
          would also apply to /admin/login, /admin/create and /admin/[slug]/edit. */}
      <Suspense fallback={<InvitationsSkeleton />}>
        <InvitationsList />
      </Suspense>
    </div>
  );
}

async function InvitationsList(): Promise<React.JSX.Element> {
  const weddings = await listWeddings();
  const rows: EventsTableRowData[] = weddings.map((wedding) => ({
    slug: wedding.slug,
    template: wedding.template,
    names: wedding.names,
    date: wedding.date,
    guests: wedding.guests,
  }));

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-muted-foreground">No invitations yet.</p>
        <Button render={<Link href="/admin/create" />}>Create Invitation</Button>
      </div>
    );
  }

  return <EventsTable weddings={rows} />;
}

function InvitationsSkeleton(): React.JSX.Element {
  return (
    <div role="status" className="flex flex-col gap-2">
      <span className="sr-only">Loading invitations…</span>
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </div>
  );
}
