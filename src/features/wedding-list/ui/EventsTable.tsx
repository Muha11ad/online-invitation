"use client";

import Link from "next/link";
import { useState } from "react";

import type { LocalizedString, WeddingListItem } from "@/entities/wedding";

import { LOCALES } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

export type EventsTableRowData = Omit<WeddingListItem, "_id">;

export function EventsTable({ weddings }: EventsTableProps): React.JSX.Element {
  const [rows, setRows] = useState(weddings);

  function handleDeleted(slug: string): void {
    setRows((previousRows) => previousRows.filter((row) => row.slug !== slug));
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Couple</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Guests</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <EventsTableRow key={row.slug} wedding={row} onDeleted={() => handleDeleted(row.slug)} />
        ))}
      </TableBody>
    </Table>
  );
}

function EventsTableRow({ wedding, onDeleted }: EventsTableRowProps): React.JSX.Element {
  const husbandName = resolveDisplayName(wedding.names.husband);
  const wifeName = resolveDisplayName(wedding.names.wife);
  const guestsCount = wedding.guests?.length;
  const viewHref = buildViewHref(wedding.slug, wedding.guests);

  return (
    <TableRow>
      <TableCell>
        {husbandName} & {wifeName}
      </TableCell>
      <TableCell>{formatTableDate(wedding.date.ddmmyyyy)}</TableCell>
      <TableCell className="capitalize">{wedding.template}</TableCell>
      <TableCell className="font-mono">{wedding.slug}</TableCell>
      <TableCell>{guestsCount ? guestsCount : "—"}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <a
                href={viewHref}
                target="_blank"
                rel="noopener noreferrer"
                title="View invitation"
              />
            }
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/${wedding.slug}/edit`} />}
          >
            Edit
          </Button>
          <ConfirmDeleteDialog
            slug={wedding.slug}
            husbandName={husbandName}
            wifeName={wifeName}
            onDeleted={onDeleted}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function resolveDisplayName(value: LocalizedString): string {
  if (value.en.trim().length > 0) {
    return value.en;
  }

  const fallback = LOCALES.map((locale) => value[locale]).find((text) => text.trim().length > 0);
  return fallback ?? "";
}

function formatTableDate(ddmmyyyy: string): string {
  return ddmmyyyy.replaceAll("-", ".");
}

function buildViewHref(slug: string, guests: string[] | undefined): string {
  if (!guests || guests.length === 0) {
    return `/event/${slug}`;
  }

  return `/event/${slug}?guest=${encodeURIComponent(guests[0])}`;
}

interface EventsTableProps {
  weddings: EventsTableRowData[];
}

interface EventsTableRowProps {
  wedding: EventsTableRowData;
  onDeleted: () => void;
}
