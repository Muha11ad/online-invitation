"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { isLocale, type Locale } from "@/shared/i18n";

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider(props: LocaleProviderProps): React.JSX.Element {
  const { slug, availableLocales, initialLocale, children } = props;
  // Seeded from the server-computed `initialLocale` so the very first client
  // render matches the server-rendered markup exactly — reading localStorage
  // here (during render) would make the two diverge and trigger a hydration
  // mismatch.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const stored = readStoredLocale(slug);
    if (stored && isLocale(stored) && availableLocales.includes(stored)) {
      // One-time sync from an external system (localStorage) after the
      // hydration-safe first paint — exactly the case the lint rule's own
      // guidance calls out as legitimate, not the cascading-render anti-pattern
      // it otherwise guards against.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
    // Only run once, right after hydration — availableLocales/slug are fixed
    // for the lifetime of this page. This is only safe because each
    // invitation is a fresh full page load, so this provider is re-mounted
    // (not just re-rendered) per slug. If client-side navigation between two
    // invitation slugs is ever introduced without a remount here, this effect
    // would never re-run and the new slug's stored locale would go unread.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLocale(next: Locale): void {
    setLocaleState(next);
    writeStoredLocale(slug, next);
  }

  return (
    <LocaleContext.Provider value={{ availableLocales, locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}

function storageKey(slug: string): string {
  return `invitation-locale:${slug}`;
}

// localStorage throws in private-mode / blocked-storage browsers — an
// invitation must never white-screen because a guest disabled storage.
function readStoredLocale(slug: string): string | null {
  try {
    return window.localStorage.getItem(storageKey(slug));
  } catch {
    return null;
  }
}

function writeStoredLocale(slug: string, locale: Locale): void {
  try {
    window.localStorage.setItem(storageKey(slug), locale);
  } catch {
    // ignore — the guest just won't get their choice remembered
  }
}

interface LocaleProviderProps {
  slug: string;
  availableLocales: Locale[];
  initialLocale: Locale;
  children: React.ReactNode;
}

interface LocaleContextValue {
  availableLocales: Locale[];
  locale: Locale;
  setLocale: (locale: Locale) => void;
}
