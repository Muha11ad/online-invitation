"use client";

import { LOCALES } from "@/shared/i18n";
import type { LocalizedString } from "@/shared/i18n";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Textarea } from "@/shared/ui/textarea";

const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
  kiril: "KIRIL",
};

export function LocalizedInput({
  label,
  value,
  onChange,
  variant = "input",
  id,
}: LocalizedInputProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Tabs defaultValue="en">
        <TabsList>
          {LOCALES.map((locale) => (
            <TabsTrigger key={locale} value={locale} className="relative">
              {LOCALE_LABELS[locale]}
              {value[locale].trim().length === 0 && (
                <span
                  aria-hidden="true"
                  className={cn("absolute top-0.5 right-0.5 size-1.5 rounded-full bg-destructive")}
                />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {LOCALES.map((locale) =>
          variant === "textarea" ? (
            <TabsContent key={locale} value={locale}>
              <Textarea
                id={id ? `${id}-${locale}` : undefined}
                rows={4}
                value={value[locale]}
                onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
              />
            </TabsContent>
          ) : (
            <TabsContent key={locale} value={locale}>
              <Input
                id={id ? `${id}-${locale}` : undefined}
                value={value[locale]}
                onChange={(event) => onChange({ ...value, [locale]: event.target.value })}
              />
            </TabsContent>
          ),
        )}
      </Tabs>
    </div>
  );
}

interface LocalizedInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  variant?: "input" | "textarea";
  id?: string;
}
