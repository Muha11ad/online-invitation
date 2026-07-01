'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  invalid: boolean;
}

function parseDate(ddmmyyyy: string): Date | null {
  const parts = ddmmyyyy.split('-');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(`${yyyy}-${mm}-${dd}T15:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function getTimeLeft(ddmmyyyy: string): TimeLeft {
  const target = parseDate(ddmmyyyy);
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, invalid: true };

  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true, invalid: false };

  return {
    days: Math.floor(diff / 864e5),
    hours: Math.floor((diff % 864e5) / 36e5),
    minutes: Math.floor((diff % 36e5) / 6e4),
    seconds: Math.floor((diff % 6e4) / 1e3),
    expired: false,
    invalid: false,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface CountdownTimerProps {
  dateDDMMYYYY: string;
  variant?: 'dark' | 'light';
}

export function CountdownTimer({ dateDDMMYYYY, variant = 'dark' }: CountdownTimerProps): React.JSX.Element {
  const valueColor = variant === 'light' ? 'text-cream' : 'text-ink';
  const labelColor = variant === 'light' ? 'text-biscuit' : 'text-ink-soft';
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft(dateDDMMYYYY));
    const id = setInterval(() => setTime(getTimeLeft(dateDDMMYYYY)), 1000);
    return () => clearInterval(id);
  }, [dateDDMMYYYY]);

  const units = time
    ? [
        { value: pad(time.days), label: 'Days' },
        { value: pad(time.hours), label: 'Hours' },
        { value: pad(time.minutes), label: 'Min' },
        { value: pad(time.seconds), label: 'Sec' },
      ]
    : [];

  return (
    <div className="flex flex-col items-center gap-0 my-[18px]">
      <div className="w-5 h-px bg-sage opacity-50 mx-auto mb-[22px]" aria-hidden="true" />

      {time === null ? null : time.invalid ? (
        <p className="font-sans text-[0.7rem] tracking-[0.1em] text-ink-soft">Invalid date</p>
      ) : time.expired ? (
        <p className="font-display italic text-sage" style={{ fontSize: 'clamp(18px, 2.5vw, 26px)' }}>
          Today is the day ♡
        </p>
      ) : (
        <div
          role="timer"
          aria-live="off"
          aria-label="Time until the wedding"
          className="flex items-start justify-center gap-[10px]"
        >
          {units.map((u, i) => (
            <div key={u.label} className="flex items-start">
              <div className="flex flex-col items-center gap-[9px]">
                <span
                  style={{ fontSize: 'clamp(26px, 3vw, 40px)' }}
                  className={`font-display font-light ${valueColor} leading-none tracking-[-0.01em] block text-center min-w-[2ch]`}
                >
                  {u.value}
                </span>
                <span className={`font-sans text-[0.5rem] font-normal tracking-[0.24em] uppercase ${labelColor}`}>
                  {u.label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span className="font-sans text-sage text-[1.1rem] leading-none mt-[10px] opacity-70 flex-shrink-0 mx-[10px]" aria-hidden="true">
                  ·
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
