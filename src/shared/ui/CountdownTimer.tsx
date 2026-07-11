"use client";

import { useRef, useSyncExternalStore } from "react";

export function CountdownTimer(params: CountdownTimerParams): React.JSX.Element {
  const time = useTimeLeft(params.dateDDMMYYYY);
  const content: React.ReactNode = getContent(time, params.variant);

  return (
    <div className="my-[18px] flex flex-col items-center gap-0">
      <div className="mx-auto mb-[22px] h-px w-5 bg-sage opacity-50" aria-hidden="true" />
      {content}
    </div>
  );
}

function useTimeLeft(dateDDMMYYYY: string): TimeLeft | null {
  const cacheRef = useRef<{ input: string; output: TimeLeft | null }>({
    input: dateDDMMYYYY,
    output: null,
  });

  function getSnapshot(): TimeLeft | null {
    const cache = cacheRef.current;
    const next = getTimeLeft(dateDDMMYYYY);
    if (cache.input === dateDDMMYYYY && timeLeftEquals(cache.output, next)) {
      return cache.output;
    }
    cacheRef.current = { input: dateDDMMYYYY, output: next };
    return next;
  }

  return useSyncExternalStore(subscribeToClock, getSnapshot, () => null);
}

function timeLeftEquals(a: TimeLeft | null, b: TimeLeft | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  return (
    a.days === b.days &&
    a.hours === b.hours &&
    a.minutes === b.minutes &&
    a.seconds === b.seconds &&
    a.expired === b.expired
  );
}

function subscribeToClock(onStoreChange: () => void): () => void {
  const id = setInterval(onStoreChange, 1000);
  return () => clearInterval(id);
}

function getContent(time: TimeLeft | null, variant: string): React.ReactNode {
  const valueColor = variant === "light" ? "text-cream" : "text-ink";
  const labelColor = variant === "light" ? "text-biscuit" : "text-ink-soft";

  if (time == null) {
    return (
      <p className="font-sans text-[0.7rem] tracking-[0.1em] text-ink-soft">
        Date was not provided or is invalid
      </p>
    );
  } else if (time.expired) {
    return (
      <p className="font-display text-sage italic" style={{ fontSize: "clamp(18px, 2.5vw, 26px)" }}>
        Today is the day ♡
      </p>
    );
  }
  const units = [
    { value: pad(time.days), label: "Days" },
    { value: pad(time.hours), label: "Hours" },
    { value: pad(time.minutes), label: "Min" },
    { value: pad(time.seconds), label: "Sec" },
  ];

  const unitElements = units.map((u, i) => (
    <div key={u.label} className="flex items-start">
      <div className="flex flex-col items-center gap-[9px]">
        <span
          style={{ fontSize: "clamp(26px, 3vw, 40px)" }}
          className={`font-display font-light ${valueColor} block min-w-[2ch] text-center leading-none tracking-[-0.01em]`}
        >
          {u.value}
        </span>
        <span
          className={`font-sans text-[0.5rem] font-normal tracking-[0.24em] uppercase ${labelColor}`}
        >
          {u.label}
        </span>
      </div>
      {i < units.length - 1 && (
        <span
          className="mx-[10px] mt-[10px] flex-shrink-0 font-sans text-[1.1rem] leading-none text-sage opacity-70"
          aria-hidden="true"
        >
          ·
        </span>
      )}
    </div>
  ));

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label="Time until the wedding"
      className="flex items-start justify-center gap-[10px]"
    >
      {unitElements}
    </div>
  );
}

function parseDate(ddmmyyyy: string): Date | null {
  const parts = ddmmyyyy.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const [dd, mm, yyyy] = parts;
  const fullDate = new Date(`${yyyy}-${mm}-${dd}T15:00:00`);
  if (isNaN(fullDate.getTime())) {
    return null;
  }
  return fullDate;
}

function getTimeLeft(ddmmyyyy: string): TimeLeft | null {
  const target = parseDate(ddmmyyyy);
  if (!target) {
    return null;
  }

  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
    minutes: Math.floor((diff % 36e5) / 6e4),
    seconds: Math.floor((diff % 6e4) / 1e3),
    expired: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

interface CountdownTimerParams {
  dateDDMMYYYY: string;
  variant: "dark" | "light";
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}
