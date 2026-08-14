"use client";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import type { WeddingFormMode } from "../lib/formState";

// The slug is always derived and never typed: it describes the template, the
// couple and the date, so the way to change it is to change one of those.
export function SlugField(props: SlugFieldProps): React.JSX.Element {
  const { mode, slug, storedSlug, slugWillChange, slugError } = props;

  return (
    <section className="flex flex-col gap-1.5">
      <Label htmlFor="slug">Slug</Label>
      <Input id="slug" value={slug} readOnly aria-invalid={slugError ? true : undefined} />
      <SlugHint
        mode={mode}
        slug={slug}
        storedSlug={storedSlug}
        slugWillChange={slugWillChange}
        slugError={slugError}
      />
    </section>
  );
}

function SlugHint(props: SlugFieldProps): React.JSX.Element {
  const { mode, slug, storedSlug, slugWillChange, slugError } = props;

  if (slugError) {
    return <p className="text-sm text-destructive">{slugError}</p>;
  }

  if (mode === "edit") {
    if (slugWillChange) {
      return (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This changes the invitation URL. Links already sent to guests (/event/
          {storedSlug}) will keep working.
        </p>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">
        Built from the template, names and date — edit those to change it
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">Your invitation will be live at /event/{slug}</p>
  );
}

interface SlugFieldProps {
  mode: WeddingFormMode;
  slug: string;
  storedSlug: string | undefined;
  slugWillChange: boolean;
  slugError: string | null;
}
