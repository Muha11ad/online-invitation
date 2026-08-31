"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { getAvailableLocales } from "@/entities/wedding/lib/localization";
import type { LocaleCompletenessInput } from "@/entities/wedding/lib/localization";
import type { LocalizedString, RawWeddingDoc, WeddingInputValue } from "@/entities/wedding";

import { LOCALES, type Locale } from "@/shared/i18n";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { TemplateType } from "@/shared/types/templates";

import { ddmmyyyyToInputDate, inputDateToDdmmyyyy } from "../lib/date";
import { getSlug, isSlugValid, willSlugChange } from "../lib/formSlug";
import { getInitialFormState } from "../lib/formState";
import type { WeddingFormMode, WeddingFormValue } from "../lib/formState";
import { LocaleToggle } from "./LocaleToggle";
import { LocalizedInput } from "./LocalizedInput";
import { MediaUploadSlot } from "./MediaUploadSlot";
import { SlugField } from "./SlugField";

// Derived from the TemplateType enum so adding a template there is the only
// change needed to surface it in the picker. Label is the value capitalized.
const TEMPLATE_OPTIONS: ReadonlyArray<{ value: TemplateType; label: string }> = Object.values(
  TemplateType,
).map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function WeddingForm({ initialValue, mode }: WeddingFormProps): React.JSX.Element {
  const router = useRouter();
  const initial = getInitialFormState(initialValue);

  const [template, setTemplate] = useState(initial.template);
  const [activeLocale, setActiveLocale] = useState<Locale>(LOCALES[0]);
  const [husband, setHusband] = useState<LocalizedString>(initial.husband);
  const [wife, setWife] = useState<LocalizedString>(initial.wife);
  const [ddmmyyyy, setDdmmyyyy] = useState(initial.ddmmyyyy);
  const [time, setTime] = useState(initial.time);
  const [city, setCity] = useState<LocalizedString>(initial.city);
  const [venue, setVenue] = useState<LocalizedString>(initial.venue);
  const [address, setAddress] = useState<LocalizedString>(initial.address);
  const [lat, setLat] = useState(initial.lat);
  const [lon, setLon] = useState(initial.lon);
  const [message, setMessage] = useState<LocalizedString>(initial.message);
  const [music, setMusic] = useState(initial.music);
  const [coupleMainImage, setCoupleMainImage] = useState(initial.coupleMainImage);
  const [slugServerError, setSlugServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fixed for the lifetime of the form: media is filed under this id, so the
  // slug can be regenerated without moving anything in storage.
  const [mediaId] = useState(() => initial.mediaId || crypto.randomUUID());

  const slug = getSlug({
    mode,
    storedValue: initialValue,
    template,
    husbandEn: husband.en,
    wifeEn: wife.en,
    ddmmyyyy,
  });

  const slugWillChange = willSlugChange(initialValue, slug);

  // Shaped so it can be handed straight to getAvailableLocales — the same
  // completeness rule the guest side and the server already use, not a
  // reimplementation of it.
  const localeCompleteness: LocaleCompletenessInput = {
    names: { husband, wife },
    location: { city, venue, address },
    message,
  };

  const submitDisabled = !isFormValid() || submitting;

  function isFormValid(): boolean {
    const dateValid = ddmmyyyy.trim().length > 0 && time.trim().length > 0;
    const coordsValid = isCoordinate(lat) && isCoordinate(lon);
    const hasCompleteLocale = getAvailableLocales(localeCompleteness).length > 0;

    return dateValid && coordsValid && isSlugValid(mode, slug) && hasCompleteLocale;
  }

  // Every identifying field rewrites the derived slug, so a "taken" verdict
  // from the server no longer applies to what is on screen.
  function handleTemplateChange(value: RawWeddingDoc["template"] | null): void {
    if (value === null) {
      return;
    }

    setTemplate(value);
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
      music: music || clearedValue,
      coupleMainImage:
        template === TemplateType.THIRD ? coupleMainImage || clearedValue : undefined,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (initialValue) {
        await submitEdit(initialValue);
      } else {
        await submitCreate();
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCreate(): Promise<void> {
    const response = await fetch("/api/admin/weddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...buildPatch(), slug, mediaId }),
    });

    if (response.status === 409) {
      // The slug cannot be edited by hand, so the way out is to change what it
      // is built from. Retired URLs count as taken too: they stay reserved so
      // old guest links keep resolving to the invitation that owned them.
      setSlugServerError(
        "An invitation already uses this URL. Change the template, the names or the date.",
      );
      return;
    }

    if (!response.ok) {
      toast.error("Failed to create the invitation.");
      return;
    }

    toast.success("Invitation created.");
    router.push("/admin");
  }

  // Takes the stored document rather than reaching for `initialValue`, so edit
  // mode never needs a non-null assertion to reach its own slug.
  async function submitEdit(storedValue: WeddingFormValue): Promise<void> {
    const response = await fetch(`/api/admin/weddings/${storedValue.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPatch()),
    });

    if (response.status === 409) {
      toast.error("Another invitation already uses the URL this template would generate.");
      return;
    }

    if (!response.ok) {
      toast.error("Failed to save changes.");
      return;
    }

    toast.success(getSaveMessage(slugWillChange));
    router.push("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <LocaleToggle
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          completeness={localeCompleteness}
        />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="template">Template</Label>
          <Select value={template} onValueChange={handleTemplateChange}>
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

        {template === TemplateType.THIRD && (
          <div className="flex flex-col gap-1.5">
            <Label>Couple main image</Label>
            <MediaUploadSlot
              mediaId={mediaId}
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
        <LocalizedInput
          label="Husband name"
          value={husband}
          onChange={setHusband}
          activeLocale={activeLocale}
        />
        <LocalizedInput
          label="Wife name"
          value={wife}
          onChange={setWife}
          activeLocale={activeLocale}
        />
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
        <LocalizedInput label="City" value={city} onChange={setCity} activeLocale={activeLocale} />
        <LocalizedInput
          label="Venue"
          value={venue}
          onChange={setVenue}
          activeLocale={activeLocale}
        />
        <LocalizedInput
          label="Address"
          value={address}
          onChange={setAddress}
          activeLocale={activeLocale}
        />

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
        <LocalizedInput
          label="Message"
          value={message}
          onChange={setMessage}
          activeLocale={activeLocale}
          variant="textarea"
        />
      </section>

      <section className="flex flex-col gap-1.5">
        <Label>Music</Label>
        <MediaUploadSlot
          mediaId={mediaId}
          kind="audios"
          accept="audio/*"
          maxBytes={MAX_AUDIO_BYTES}
          value={music}
          onChange={setMusic}
        />
      </section>

      <SlugField
        mode={mode}
        slug={slug}
        storedSlug={initial.slug}
        slugWillChange={slugWillChange}
        slugError={slugServerError}
      />

      <Button type="submit" disabled={submitDisabled}>
        {getSubmitLabel(mode, submitting)}
      </Button>
    </form>
  );
}

function isCoordinate(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Number(value));
}

function getSubmitLabel(mode: WeddingFormMode, submitting: boolean): string {
  if (mode === "create") {
    return submitting ? "Creating…" : "Create Invitation";
  }

  return submitting ? "Saving…" : "Save Changes";
}

function getSaveMessage(slugWillChange: boolean): string {
  if (slugWillChange) {
    return "Changes saved. The invitation URL changed.";
  }

  return "Changes saved.";
}

// A discriminated union rather than an optional `initialValue`: edit mode
// always has a stored document, which is what removes the non-null assertions
// the previous shape needed throughout.
export type WeddingFormProps =
  { mode: "create"; initialValue?: undefined } | { mode: "edit"; initialValue: WeddingFormValue };
