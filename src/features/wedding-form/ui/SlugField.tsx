"use client";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import type { WeddingFormMode } from "../lib/formState";

export function SlugField(props: SlugFieldProps): React.JSX.Element {
  const { mode, slug, storedSlug, slugWillChange, slugError, inputRef, onChange } = props;

  return (
    <section className="flex flex-col gap-1.5">
      <Label htmlFor="slug">Slug</Label>
      <Input
        id="slug"
        ref={inputRef}
        value={slug}
        readOnly={mode === "edit"}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={slugError ? true : undefined}
      />
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

function SlugHint(props: SlugHintProps): React.JSX.Element {
  const { mode, slug, storedSlug, slugWillChange, slugError } = props;

  if (mode === "edit") {
    if (slugWillChange) {
      return (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Changing the template regenerates this URL. Links already sent to guests (/event/
          {storedSlug}) will keep working.
        </p>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">
        The slug follows the template and cannot be edited directly
      </p>
    );
  }

  if (slugError) {
    return <p className="text-sm text-destructive">{slugError}</p>;
  }

  return (
    <p className="text-sm text-muted-foreground">Your invitation will be live at /event/{slug}</p>
  );
}

interface SlugHintProps {
  mode: WeddingFormMode;
  slug: string;
  storedSlug: string | undefined;
  slugWillChange: boolean;
  slugError: string | null;
}

interface SlugFieldProps extends SlugHintProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}
