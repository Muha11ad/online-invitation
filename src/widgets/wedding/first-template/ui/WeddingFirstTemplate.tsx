import type { RawWeddingDoc } from '@/entities/wedding';

import { VenueMap } from '@/shared/ui/VenueMap';
import { MusicButton } from './MusicButton';
import { CountdownTimer } from './CountdownTimer';
import { RevealObserver } from './RevealObserver';


export function WeddingFirstTemplate( wedding: RawWeddingDoc ): React.JSX.Element {
  const initialA = wedding.names.a.charAt(0).toUpperCase();
  const initialB = wedding.names.b.charAt(0).toUpperCase();

  return (
    <main className="bg-warm-white text-ink font-sans font-light leading-[1.65] antialiased min-h-screen">
      <RevealObserver />

      {/* ══ HERO ══ */}
      <section
        aria-label="Hero"
        className="relative min-h-[100svh] flex flex-col items-center justify-center px-8 pt-20 pb-[120px] text-center overflow-hidden"
      >
        {/* Monogram */}
        <div
		  aria-hidden="true"
          data-hero="monogram"
		  style={{ fontSize: 'clamp(88px, 20vw, 260px)' }}
          className="font-display font-light leading-none tracking-[-0.02em] text-ink mb-9 select-none"
        >
          {initialA} <span className="italic text-sage">&amp;</span> {initialB}
        </div>

        {/* Sage rule */}
        <div
          data-hero="rule"
          aria-hidden="true"
          className="w-8 h-px bg-sage mx-auto mb-7"
		/>

        {/* Names */}
        <h1
          data-hero="names"
          style={{ fontSize: 'clamp(32px, 5.5vw, 72px)' }}
		  className="font-display font-light leading-[1.1] tracking-[-0.01em] mb-[18px]"
        >
          {wedding.names.a} <span className="italic text-sage">&amp;</span> {wedding.names.b}
        </h1>

        {/* Date · City */}
        <p
          data-hero="meta"
          className="font-sans text-[0.75rem] font-light tracking-[0.18em] uppercase text-ink-soft"
        >
          {wedding.date.short}&nbsp;·&nbsp;{wedding.location.city}
        </p>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
		  data-hero="scroll-cue"
          className="absolute bottom-11 left-1/2 -translate-x-1/2 w-px h-12 bg-hairline overflow-hidden"
        >
          <div
            className="absolute w-full h-full bg-sage"
            style={{ animation: 'scroll-travel 2.2s cubic-bezier(.4,0,.2,1) infinite' }}
          />
        </div>
      </section>

      {/* ══ MESSAGE ══ */}
      <section aria-label="Message" className="px-8 py-24">
        <div className="max-w-[600px] mx-auto">
          <p
		    style={{ fontSize: 'clamp(20px, 3vw, 30px)' }}
            className="reveal font-display italic font-light leading-[1.7] text-center text-ink"
          >
            &ldquo;{wedding.message}&rdquo;
          </p>
        </div>
      </section>

      {/* ══ DETAILS ══ */}
      <section aria-label="Event details" className="px-8 py-[108px]">
        <div className="max-w-[900px] mx-auto">
          <p className="reveal text-center mb-[52px] font-sans text-[0.625rem] font-normal tracking-[0.22em] uppercase text-ink-soft">
            The Day
          </p>

          <div className="border-t border-hairline mb-[52px]">
            {/* When */}
            <div
              className="reveal grid py-7 border-b border-hairline items-start"
              style={
                {
                  gridTemplateColumns: '72px 1px 1fr',
                  gap: '0 28px',
                  '--reveal-delay': '0ms',
                } as React.CSSProperties
              }
            >
              <span className="font-sans text-[0.5625rem] font-normal tracking-[0.22em] uppercase text-ink-soft pt-[5px]">
                When
              </span>
              <span className="w-px bg-hairline self-stretch" aria-hidden="true" />
              <div className="flex flex-col gap-[5px]">
                <span className="font-display text-[1.2rem] font-normal leading-[1.3]">
                  {wedding.date.full}
                </span>
                <span className="text-[0.75rem] tracking-[0.06em] text-ink-soft">
                  Ceremony at {wedding.location.ceremonyTime}&nbsp;·&nbsp;Reception to follow
                </span>
              </div>
            </div>

            {/* Where */}
            <div
              className="reveal grid py-7 border-b border-hairline items-start"
              style={
                {
                  gridTemplateColumns: '72px 1px 1fr',
                  gap: '0 28px',
                  '--reveal-delay': '100ms',
                } as React.CSSProperties
              }
            >
              <span className="font-sans text-[0.5625rem] font-normal tracking-[0.22em] uppercase text-ink-soft pt-[5px]">
                Where
              </span>
              <span className="w-px bg-hairline self-stretch" aria-hidden="true" />
              <div className="flex flex-col gap-[5px]">
                <span className="font-display text-[1.2rem] font-normal leading-[1.3]">
                  {wedding.location.venue}
                </span>
                <span className="text-[0.75rem] tracking-[0.06em] text-ink-soft">
                  {wedding.location.address}
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          {wedding.location.coords && (
            <div className="reveal aspect-video overflow-hidden bg-hairline">
              <VenueMap
                lat={wedding.location.coords.lat}
                lon={wedding.location.coords.lon}
              />
            </div>
          )}
        </div>
      </section>

      {/* ══ SCENE (birds + rings) ══ */}
      <section aria-label="Decorative scene" className="border-t border-b border-hairline">
        <div
          className="relative w-full overflow-hidden bg-warm-white h-[380px] max-[600px]:h-[260px]"
          aria-hidden="true"
        >
          {/* Interlocked rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] pointer-events-none">
            <svg width="200" height="96" viewBox="10 5 150 82" fill="none">
              <defs>
                <clipPath id="ca-right">
                  <rect x="80" y="-200" width="600" height="600" />
                </clipPath>
                <clipPath id="ca-left">
                  <rect x="-600" y="-200" width="680" height="600" />
                </clipPath>
              </defs>
              <circle cx="80" cy="46" r="35" stroke="#8A9A82" strokeWidth="1.5" clipPath="url(#ca-right)" />
              <circle cx="120" cy="46" r="35" stroke="#8A9A82" strokeWidth="1.5" />
              <circle cx="80" cy="46" r="35" stroke="#8A9A82" strokeWidth="1.5" clipPath="url(#ca-left)" />
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
                color: '#6B6862',
                opacity: bird.opacity,
                animation: `bird-fly ${bird.duration} linear ${bird.delay} infinite`,
                willChange: 'transform',
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
      <footer className="px-8 py-[72px] text-center border-t border-hairline flex flex-col items-center gap-[14px]">
        <div
          className="font-display font-light tracking-[-0.01em] text-ink"
          style={{ fontSize: 'clamp(24px, 4vw, 44px)' }}
          aria-hidden="true"
        >
          {initialA} <span className="italic text-sage">&amp;</span> {initialB}
        </div>

        <div className="reveal">
          <CountdownTimer dateDDMMYYYY={wedding.date.ddmmyyyy} />
        </div>

        <p className="font-sans text-[0.625rem] font-normal tracking-[0.22em] uppercase text-ink-soft">
          {wedding.date.formatted}
        </p>
      </footer>

      {/* ══ MUSIC BUTTON ══ */}
      {wedding.music && <MusicButton src={wedding.music} />}
    </main>
  );
}


const BIRDS = [
  { size: 38, top: '20%', opacity: 0.5,  duration: '16s', delay: '-2s'  },
  { size: 24, top: '11%', opacity: 0.32, duration: '23s', delay: '-9s'  },
  { size: 46, top: '56%', opacity: 0.55, duration: '13s', delay: '-5s'  },
  { size: 30, top: '34%', opacity: 0.38, duration: '19s', delay: '-14s' },
  { size: 18, top: '17%', opacity: 0.28, duration: '28s', delay: '-20s' },
  { size: 34, top: '70%', opacity: 0.45, duration: '14s', delay: '-7s'  },
  { size: 22, top:  '6%', opacity: 0.3,  duration: '21s', delay: '-3s'  },
  { size: 42, top: '80%', opacity: 0.42, duration: '17s', delay: '-11s' },
] as const;
