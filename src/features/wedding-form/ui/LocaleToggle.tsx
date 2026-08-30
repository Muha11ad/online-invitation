"use client";

import { useRef } from "react";

import { getAvailableLocales } from "@/entities/wedding/lib/localization";

import { LOCALES, LOCALE_LABELS, type Locale } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";

import {
  getLocaleCompleteness,
  type LocaleCompleteness,
  type LocaleCompletenessInput,
} from "../lib/localeCompleteness";

export function LocaleToggle(props: LocaleToggleProps): React.JSX.Element {
  const { activeLocale, onActiveLocaleChange, completeness } = props;
  const chipRefs = useRef<Array<HTMLElement | null>>([]);
  const availableLocales = getAvailableLocales(completeness);

  // Roving-tabindex radiogroup: arrow keys move focus between the chips
  // themselves and select as they go, matching native radiogroup behaviour.
  // Focus never leaves this row — it must not land on the field below,
  // which would steal focus out from under someone mid-typing.
  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>, index: number): void {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + LOCALES.length) % LOCALES.length;

    onActiveLocaleChange(LOCALES[nextIndex]);
    chipRefs.current[nextIndex]?.focus();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Form language</Label>
      <div role="radiogroup" aria-label="Form language" className="flex flex-wrap gap-2">
        {LOCALES.map((locale, index) => {
          const isActive = locale === activeLocale;
          const state = getLocaleCompleteness(completeness, locale);

          return (
            <Button
              key={locale}
              type="button"
              role="radio"
              aria-checked={isActive}
              // The dot below is decorative (aria-hidden) — this is the only
              // place the empty/partial/complete signal reaches a screen
              // reader, so it has to be in the accessible name, not just colour.
              aria-label={`${LOCALE_LABELS[locale]} — ${getCompletenessWord(state)}`}
              tabIndex={isActive ? 0 : -1}
              variant={isActive ? "secondary" : "outline"}
              ref={(node) => {
                chipRefs.current[index] = node;
              }}
              onClick={() => onActiveLocaleChange(locale)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className="gap-2"
            >
              {LOCALE_LABELS[locale]}
              <span aria-hidden="true" className={getDotClassName(state)} />
            </Button>
          );
        })}
      </div>
      <p
        className={cn(
          "text-sm",
          availableLocales.length === 0 ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {getPublishedLine(availableLocales)}
      </p>
    </div>
  );
}

interface LocaleToggleProps {
  activeLocale: Locale;
  onActiveLocaleChange: (locale: Locale) => void;
  completeness: LocaleCompletenessInput;
}

function getDotClassName(state: LocaleCompleteness): string {
  switch (state) {
    case "complete": {
      return "size-1.5 rounded-full bg-primary";
    }
    case "partial": {
      return "size-1.5 rounded-full border border-primary bg-transparent";
    }
    case "empty": {
      return "size-1.5 rounded-full bg-destructive";
    }
  }
}

function getCompletenessWord(state: LocaleCompleteness): string {
  switch (state) {
    case "complete": {
      return "complete";
    }
    case "partial": {
      return "partly filled";
    }
    case "empty": {
      return "empty";
    }
  }
}

function getPublishedLine(availableLocales: Locale[]): string {
  if (availableLocales.length === 0) {
    return "Will be published in: none yet — fill in at least one language.";
  }

  const labels = availableLocales.map((locale) => LOCALE_LABELS[locale]);
  return `Will be published in: ${labels.join(", ")}.`;
}
