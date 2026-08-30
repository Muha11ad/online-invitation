"use client";

import { CheckIcon } from "lucide-react";

import { getDictionary, LOCALE_LABELS, type Locale } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/shared/ui/menu";

import { GlobeIcon } from "./GlobeIcon";
import { useLocale } from "./LocaleProvider";

// BCP-47 tag for each locale, used as the `lang` attribute on its option so
// screen readers pronounce the label correctly. Kiril is Uzbek written in
// Cyrillic script, hence "uz-Cyrl" rather than a made-up "kiril" tag.
const LOCALE_LANG_TAGS: Record<Locale, string> = {
  en: "en",
  ru: "ru",
  uz: "uz",
  kiril: "uz-Cyrl",
};

export function LanguagePicker(): React.JSX.Element | null {
  const { availableLocales, locale, setLocale } = useLocale();
  const dict = getDictionary(locale);

  // Nothing to switch between — a single-locale invitation doesn't need a picker.
  if (availableLocales.length <= 1) {
    return null;
  }

  return (
    <Menu>
      <MenuTrigger aria-label={dict.common.languagePicker} className={getTriggerClassName()}>
        <GlobeIcon />
      </MenuTrigger>
      <MenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        className={getPanelClassName()}
        // Template 2's EnvelopeGate overlay is a non-portaled `position:
        // fixed` element at z-[9999] (see EnvelopeGate.tsx). The Positioner's
        // default z-50 sits inside its own `isolate` stacking context, so a
        // z-index on the Popup alone can never climb above the gate — the
        // Positioner itself must be raised past 9999, or a guest opening the
        // picker on template 2 sees the panel render behind the envelope.
        positionerClassName="z-[10000]"
      >
        <MenuRadioGroup value={locale} onValueChange={(value: Locale) => setLocale(value)}>
          {availableLocales.map((option) => (
            <MenuRadioItem
              key={option}
              value={option}
              lang={LOCALE_LANG_TAGS[option]}
              className={getOptionClassName(option === locale)}
            >
              <span>{LOCALE_LABELS[option]}</span>
              {option === locale && <CheckIcon className="size-4 shrink-0 text-sage" />}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}

function getTriggerClassName(): string {
  return [
    "fixed right-7 top-7 z-[10000]",
    "h-11 w-11 cursor-pointer rounded-full border outline-none",
    "flex items-center justify-center",
    "transition-colors duration-[240ms] ease-[ease]",
    "border-sage bg-warm-white text-sage hover:bg-sage hover:text-warm-white",
    "shadow-[0_1px_6px_rgba(0,0,0,0.12)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-sage",
  ].join(" ");
}

function getPanelClassName(): string {
  return [
    "z-[10000] min-w-[168px] overflow-hidden rounded-lg p-1",
    "bg-warm-white text-ink",
    "ring-1 ring-sage/30 shadow-lg",
    "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
    "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
  ].join(" ");
}

function getOptionClassName(selected: boolean): string {
  return cn(
    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm",
    "cursor-pointer select-none outline-none text-ink",
    "hover:bg-sage/10 data-[highlighted]:bg-sage/10",
    selected && "font-medium text-sage",
  );
}
