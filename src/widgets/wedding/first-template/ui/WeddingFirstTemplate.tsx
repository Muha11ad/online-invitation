import { pick, type WeddingTemplateProps } from "@/entities/wedding";

import { formatWeddingDate, getDictionary } from "@/shared/i18n";
import { Map } from "@/shared/ui/Map/Map";
import { CountdownTimer } from "@/shared/ui/CountdownTimer";
import { MusicButton } from "@/shared/ui/MusicButton/MusicButton";
import { RevealObserver } from "@/shared/ui/RevealObserver";

import { HeroEntranceObserver } from "./HeroEntranceObserver";

export function WeddingFirstTemplate(wedding: WeddingTemplateProps): React.JSX.Element {
  const { locale } = wedding;
  const dict = getDictionary(locale);
  const husbandName = pick(wedding.names.husband, locale);
  const wifeName = pick(wedding.names.wife, locale);
  const city = pick(wedding.location.city, locale);
  const venue = pick(wedding.location.venue, locale);
  const address = pick(wedding.location.address, locale);
  const message = pick(wedding.message, locale);
  const dateShort = formatWeddingDate(wedding.date.ddmmyyyy, locale, "short");
  const dateFull = formatWeddingDate(wedding.date.ddmmyyyy, locale, "full");
  const dateFormatted = formatWeddingDate(wedding.date.ddmmyyyy, locale, "formatted");
  const initialA = husbandName.charAt(0).toUpperCase();
  const initialB = wifeName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-warm-white font-sans leading-[1.65] font-light text-ink antialiased">
      <RevealObserver />
      <HeroEntranceObserver />

      {/* ══ HERO ══ */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-8 pt-20 pb-[120px] text-center"
      >
        {/* Monogram */}
        <div
          aria-hidden="true"
          data-hero="monogram"
          style={{ fontSize: "clamp(88px, 20vw, 260px)" }}
          className="mb-9 font-display leading-none font-light tracking-[-0.02em] text-ink select-none"
        >
          {initialA} <span className="text-sage italic">&amp;</span> {initialB}
        </div>

        {/* Sage rule */}
        <div data-hero="rule" aria-hidden="true" className="mx-auto mb-7 h-px w-8 bg-sage" />

        {/* Names */}
        <h1
          data-hero="names"
          style={{ fontSize: "clamp(32px, 5.5vw, 72px)" }}
          className="mb-[18px] font-display leading-[1.1] font-light tracking-[-0.01em]"
        >
          {husbandName} <span className="text-sage italic">&amp;</span> {wifeName}
        </h1>

        {/* Date · City */}
        <p
          data-hero="meta"
          className="font-sans text-[0.75rem] font-light tracking-[0.18em] text-ink-soft uppercase"
        >
          {dateShort}&nbsp;·&nbsp;{city}
        </p>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
          data-hero="scroll-cue"
          className="absolute bottom-11 left-1/2 h-12 w-px -translate-x-1/2 overflow-hidden bg-hairline"
        >
          <div
            className="absolute h-full w-full bg-sage"
            style={{ animation: "scroll-travel 2.2s cubic-bezier(.4,0,.2,1) infinite" }}
          />
        </div>
      </section>

      {/* ══ MESSAGE ══ */}
      <section aria-label="Message" className="px-8 py-24">
        <div className="mx-auto max-w-[600px]">
          {wedding.guestName && (
            <p className="reveal mb-5 text-center font-sans text-[0.75rem] font-light tracking-[0.18em] text-ink-soft uppercase">
              {dict.common.dearGuest.replace("{name}", wedding.guestName)}
            </p>
          )}
          <p
            style={{ fontSize: "clamp(20px, 3vw, 30px)" }}
            className="reveal text-center font-display leading-[1.7] font-light text-ink italic"
          >
            &ldquo;{message}&rdquo;
          </p>
        </div>
      </section>

      {/* ══ DETAILS ══ */}
      <section aria-label="Event details" className="px-8 py-[108px]">
        <div className="mx-auto max-w-[900px]">
          <p className="reveal mb-[52px] text-center font-sans text-[0.625rem] font-normal tracking-[0.22em] text-ink-soft uppercase">
            {dict.firstTemplate.detailsOverline}
          </p>

          <div className="mb-[52px] border-t border-hairline">
            {/* When */}
            <div
              className="reveal grid items-start border-b border-hairline py-7"
              style={
                {
                  gridTemplateColumns: "72px 1px 1fr",
                  gap: "0 28px",
                  "--reveal-delay": "0ms",
                } as React.CSSProperties
              }
            >
              <span className="pt-[5px] font-sans text-[0.5625rem] font-normal tracking-[0.22em] text-ink-soft uppercase">
                {dict.firstTemplate.when}
              </span>
              <span className="w-px self-stretch bg-hairline" aria-hidden="true" />
              <div className="flex flex-col gap-[5px]">
                <span className="font-display text-[1.2rem] leading-[1.3] font-normal">
                  {dateFull}
                </span>
                <span className="text-[0.75rem] tracking-[0.06em] text-ink-soft">
                  {dict.firstTemplate.ceremonyAt} {wedding.date.time}&nbsp;·&nbsp;
                  {dict.firstTemplate.receptionToFollow}
                </span>
              </div>
            </div>

            {/* Where */}
            <div
              className="reveal grid items-start border-b border-hairline py-7"
              style={
                {
                  gridTemplateColumns: "72px 1px 1fr",
                  gap: "0 28px",
                  "--reveal-delay": "100ms",
                } as React.CSSProperties
              }
            >
              <span className="pt-[5px] font-sans text-[0.5625rem] font-normal tracking-[0.22em] text-ink-soft uppercase">
                {dict.firstTemplate.where}
              </span>
              <span className="w-px self-stretch bg-hairline" aria-hidden="true" />
              <div className="flex flex-col gap-[5px]">
                <span className="font-display text-[1.2rem] leading-[1.3] font-normal">
                  {venue}
                </span>
                <span className="text-[0.75rem] tracking-[0.06em] text-ink-soft">{address}</span>
              </div>
            </div>
          </div>

          {/* Map */}
          {wedding.location.coords && (
            <div className="reveal aspect-video overflow-hidden bg-hairline">
              <Map
                lat={wedding.location.coords.lat}
                lon={wedding.location.coords.lon}
                locale={locale}
                palette={{
                  land: "#f5f0e1",
                  water: "#8a9a82",
                  road: "#fbfaf7",
                  roadCasing: "#e7e3db",
                  label: "#2b2a28",
                  labelHalo: "#fbfaf7",
                  pin: "#8a9a82",
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* ══ SCENE (birds + rings) ══ */}
      <section aria-label="Decorative scene" className="border-t border-b border-hairline">
        <div
          className="relative h-[380px] w-full overflow-hidden bg-warm-white max-[600px]:h-[260px]"
          aria-hidden="true"
        >
          {/* Interlocked rings */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
            <svg width="200" height="96" viewBox="10 5 150 82" fill="none">
              <defs>
                <clipPath id="ca-right">
                  <rect x="80" y="-200" width="600" height="600" />
                </clipPath>
                <clipPath id="ca-left">
                  <rect x="-600" y="-200" width="680" height="600" />
                </clipPath>
              </defs>
              <circle
                cx="80"
                cy="46"
                r="35"
                stroke="#8A9A82"
                strokeWidth="1.5"
                clipPath="url(#ca-right)"
              />
              <circle cx="120" cy="46" r="35" stroke="#8A9A82" strokeWidth="1.5" />
              <circle
                cx="80"
                cy="46"
                r="35"
                stroke="#8A9A82"
                strokeWidth="1.5"
                clipPath="url(#ca-left)"
              />
            </svg>
          </div>

          {/* Birds */}
          {BIRDS.map((bird, i) => (
            <svg
              key={i}
              width={bird.size}
              height={Math.round(bird.size / 2)}
              viewBox="0 0 36 18"
              fill="none"
              className="absolute"
              style={{
                top: bird.top,
                color: "#6B6862",
                opacity: bird.opacity,
                animation: `bird-fly ${bird.duration} linear ${bird.delay} infinite`,
                willChange: "transform",
              }}
            >
              <path
                d="M0 9 C5 2 11 0 18 9 C25 0 31 2 36 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="flex flex-col items-center gap-[14px] border-t border-hairline px-8 py-[72px] text-center">
        <div
          className="font-display font-light tracking-[-0.01em] text-ink"
          style={{ fontSize: "clamp(24px, 4vw, 44px)" }}
          aria-hidden="true"
        >
          {initialA} <span className="text-sage italic">&amp;</span> {initialB}
        </div>

        <div className="reveal">
          <CountdownTimer dateDDMMYYYY={wedding.date.ddmmyyyy} variant="dark" locale={locale} />
        </div>

        <p className="font-sans text-[0.625rem] font-normal tracking-[0.22em] text-ink-soft uppercase">
          {dateFormatted}
        </p>
      </footer>

      {/* ══ MUSIC BUTTON ══ */}
      {wedding.music && <MusicButton src={wedding.music} />}
    </main>
  );
}

const BIRDS = [
  { size: 38, top: "20%", opacity: 0.5, duration: "16s", delay: "-2s" },
  { size: 24, top: "11%", opacity: 0.32, duration: "23s", delay: "-9s" },
  { size: 46, top: "56%", opacity: 0.55, duration: "13s", delay: "-5s" },
  { size: 30, top: "34%", opacity: 0.38, duration: "19s", delay: "-14s" },
  { size: 18, top: "17%", opacity: 0.28, duration: "28s", delay: "-20s" },
  { size: 34, top: "70%", opacity: 0.45, duration: "14s", delay: "-7s" },
  { size: 22, top: "6%", opacity: 0.3, duration: "21s", delay: "-3s" },
  { size: 42, top: "80%", opacity: 0.42, duration: "17s", delay: "-11s" },
] as const;
