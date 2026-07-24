"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import type { LocalizedString, RawWeddingDoc, WeddingInputValue } from "@/entities/wedding";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

import { ddmmyyyyToInputDate, inputDateToDdmmyyyy } from "../lib/date";
import { guestsToText, parseGuestsInput } from "../lib/guests";
import { emptyLocalizedString } from "../lib/localizedString";
import { SLUG_PATTERN, buildAutoSlug } from "../lib/slug";
import { LocalizedInput } from "./LocalizedInput";
import { MediaUploadSlot } from "./MediaUploadSlot";

const TEMPLATE_OPTIONS: ReadonlyArray<{ value: RawWeddingDoc["template"]; label: string }> = [
  { value: "first", label: "First" },
  { value: "second", label: "Second" },
  { value: "third", label: "Third" },
];

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function WeddingForm({ initialValue, mode }: WeddingFormProps): React.JSX.Element {
  const router = useRouter();
  const slugInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<RawWeddingDoc["template"]>(
    initialValue?.template ?? "first",
  );
  const [husband, setHusband] = useState<LocalizedString>(
    initialValue?.names.husband ?? emptyLocalizedString(),
  );
  const [wife, setWife] = useState<LocalizedString>(
    initialValue?.names.wife ?? emptyLocalizedString(),
  );
  const [ddmmyyyy, setDdmmyyyy] = useState(initialValue?.date.ddmmyyyy ?? "");
  const [time, setTime] = useState(initialValue?.date.time ?? "");
  const [city, setCity] = useState<LocalizedString>(
    initialValue?.location.city ?? emptyLocalizedString(),
  );
  const [venue, setVenue] = useState<LocalizedString>(
    initialValue?.location.venue ?? emptyLocalizedString(),
  );
  const [address, setAddress] = useState<LocalizedString>(
    initialValue?.location.address ?? emptyLocalizedString(),
  );
  const [lat, setLat] = useState(initialValue ? String(initialValue.location.coords.lat) : "");
  const [lon, setLon] = useState(initialValue ? String(initialValue.location.coords.lon) : "");
  const [message, setMessage] = useState<LocalizedString>(
    initialValue?.message ?? emptyLocalizedString(),
  );
  const [guestsText, setGuestsText] = useState(guestsToText(initialValue?.guests));
  const [music, setMusic] = useState(initialValue?.music);
  const [coupleMainImage, setCoupleMainImage] = useState(initialValue?.coupleMainImage);
  const [manualSlug, setManualSlug] = useState(initialValue?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [slugServerError, setSlugServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const slug =
    mode === "create" && !slugTouched ? buildAutoSlug(husband.en, wife.en, ddmmyyyy) : manualSlug;

  const guestsCount = parseGuestsInput(guestsText)?.length ?? 0;
  const mediaSlug = mode === "edit" ? initialValue!.slug : slug;

  const dateValid = ddmmyyyy.trim().length > 0 && time.trim().length > 0;
  const latValid = lat.trim().length > 0 && !Number.isNaN(Number(lat));
  const lonValid = lon.trim().length > 0 && !Number.isNaN(Number(lon));
  const slugPatternError =
    mode === "create" && slug.length > 0 && !SLUG_PATTERN.test(slug)
      ? "Slug can only contain lowercase letters, numbers, and hyphens."
      : null;
  const slugError = slugServerError ?? slugPatternError;
  const slugValid = mode === "edit" || (slug.trim().length > 0 && SLUG_PATTERN.test(slug));

  const submitDisabled = !dateValid || !latValid || !lonValid || !slugValid || submitting;

  function handleSlugChange(value: string): void {
    setSlugTouched(true);
    setManualSlug(value);
    setSlugServerError(null);
  }

  function buildPatch(): WeddingInputValue {
    // In edit mode, an emptied field must be sent as `null` so the PATCH
    // handler can $unset it — `undefined` is dropped by JSON.stringify and
    // would silently no-op instead of clearing the stored value.
    const clearedValue = mode === "edit" ? null : undefined;

    return {
      template,
      names: { husband, wife },
      date: { time, ddmmyyyy },
      location: {
        city,
        venue,
        address,
        coords: { lat: Number(lat), lon: Number(lon) },
      },
      message,
      guests: parseGuestsInput(guestsText) ?? clearedValue,
      music: music || clearedValue,
      coupleMainImage: template === "third" ? coupleMainImage || clearedValue : undefined,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (mode === "create") {
        await submitCreate();
      } else {
        await submitEdit();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCreate(): Promise<void> {
    const response = await fetch("/api/admin/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buildPatch(), slug }),
    });

    if (response.status === 409) {
      setSlugServerError("This URL is already taken.");
      slugInputRef.current?.focus();
      return;
    }

    if (!response.ok) {
      toast.error("Failed to create the invitation.");
      return;
    }

    toast.success("Invitation created.");
    router.push("/admin");
  }

  async function submitEdit(): Promise<void> {
    const response = await fetch(`/api/admin/weddings/${initialValue!.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPatch()),
    });

    if (!response.ok) {
      toast.error("Failed to save changes.");
      return;
    }

    toast.success("Changes saved.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template">Template</Label>
          <Select
            value={template}
            onValueChange={(value) => setTemplate(value as RawWeddingDoc["template"])}
          >
            <SelectTrigger id="template" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {template === "third" && (
          <div className="flex flex-col gap-1.5">
            <Label>Couple main image</Label>
            <MediaUploadSlot
              slug={mediaSlug}
              kind="images"
              accept="image/*"
              maxBytes={MAX_IMAGE_BYTES}
              value={coupleMainImage}
              onChange={setCoupleMainImage}
            />
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <LocalizedInput label="Husband name" value={husband} onChange={setHusband} />
        <LocalizedInput label="Wife name" value={wife} onChange={setWife} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={ddmmyyyyToInputDate(ddmmyyyy)}
            onChange={(event) => setDdmmyyyy(inputDateToDdmmyyyy(event.target.value))}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            placeholder="e.g. 3:30 pm"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <LocalizedInput label="City" value={city} onChange={setCity} />
        <LocalizedInput label="Venue" value={venue} onChange={setVenue} />
        <LocalizedInput label="Address" value={address} onChange={setAddress} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lon">Longitude</Label>
            <Input
              id="lon"
              type="number"
              step="any"
              value={lon}
              onChange={(event) => setLon(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section>
        <LocalizedInput label="Message" value={message} onChange={setMessage} variant="textarea" />
      </section>

      <section className="flex flex-col gap-1.5">
        <Label htmlFor="guests">Guests</Label>
        <Textarea
          id="guests"
          rows={4}
          placeholder="Comma-separated guest names"
          value={guestsText}
          onChange={(event) => setGuestsText(event.target.value)}
        />
        <p className="text-sm text-muted-foreground">{guestsCount} guests</p>
      </section>

      <section className="flex flex-col gap-1.5">
        <Label>Music</Label>
        <MediaUploadSlot
          slug={mediaSlug}
          kind="audios"
          accept="audio/*"
          maxBytes={MAX_AUDIO_BYTES}
          value={music}
          onChange={setMusic}
        />
      </section>

      <section className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          ref={slugInputRef}
          value={slug}
          readOnly={mode === "edit"}
          onChange={(event) => handleSlugChange(event.target.value)}
          aria-invalid={slugError ? true : undefined}
        />
        {mode === "edit" ? (
          <p className="text-sm text-muted-foreground">Slug cannot be changed after creation</p>
        ) : slugError ? (
          <p className="text-sm text-destructive">{slugError}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your invitation will be live at /event/{slug}
          </p>
        )}
      </section>

      <Button type="submit" disabled={submitDisabled}>
        {mode === "create"
          ? submitting
            ? "Creating…"
            : "Create Invitation"
          : submitting
            ? "Saving…"
            : "Save Changes"}
      </Button>
    </form>
  );
}

interface WeddingFormProps {
  initialValue?: RawWeddingDoc;
  mode: "create" | "edit";
}
