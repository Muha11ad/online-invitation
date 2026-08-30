"use client";

import type { Locale, LocalizedString } from "@/shared/i18n";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

export function LocalizedInput({
  label,
  value,
  onChange,
  activeLocale,
  variant = "input",
  id,
}: LocalizedInputProps): React.JSX.Element {
  const text = value[activeLocale];

  function handleChange(nextText: string): void {
    onChange({ ...value, [activeLocale]: nextText });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {variant === "textarea" ? (
        <Textarea
          id={id}
          rows={4}
          value={text}
          onChange={(event) => handleChange(event.target.value)}
        />
      ) : (
        <Input id={id} value={text} onChange={(event) => handleChange(event.target.value)} />
      )}
    </div>
  );
}

interface LocalizedInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  activeLocale: Locale;
  variant?: "input" | "textarea";
  id?: string;
}
