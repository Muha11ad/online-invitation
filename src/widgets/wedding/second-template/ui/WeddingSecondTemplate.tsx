import type { RawWeddingDoc } from '@/entities/wedding';
import { VenueMap } from '@/shared/ui/VenueMap';
import { MusicButton } from '@/shared/ui/MusicButton';
import { RevealObserver } from '@/shared/ui/RevealObserver';
import { CountdownTimer } from '@/shared/ui/CountdownTimer';
import { EnvelopeGate } from './EnvelopeGate';

export function WeddingSecondTemplate(wedding: RawWeddingDoc): React.JSX.Element {
  return (
    <main className="bg-amber-warm text-forest font-sans font-light leading-[1.65] antialiased min-h-screen">
      <RevealObserver />
      <EnvelopeGate nameA={wedding.names.a} nameB={wedding.names.b} />

      {/* HERO */}
      <section aria-label="Hero" style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Animated ambient background */}
        <div
          data-hero-bg=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'linear-gradient(165deg,#f2e9d4 0%,#e7d7bb 46%,#c9b893 100%)',
            animation: 'heroPan 30s ease-in-out infinite',
            willChange: 'transform',
          }}
        >
          <div style={{ position: 'absolute', width: '48vw', height: '48vw', left: '-7vw', top: '-9vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,211,188,.9),transparent 70%)', filter: 'blur(42px)', animation: 'blobA 24s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '42vw', height: '42vw', right: '-9vw', top: '6vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,248,233,.82),transparent 70%)', filter: 'blur(48px)', animation: 'blobB 30s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', width: '44vw', height: '44vw', left: '16vw', bottom: '-16vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,138,92,.42),transparent 70%)', filter: 'blur(56px)', animation: 'blobA 34s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', width: '26vw', height: '26vw', right: '20vw', bottom: '4vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,97,46,.26),transparent 70%)', filter: 'blur(46px)', animation: 'blobB 26s ease-in-out infinite' }} />
        </div>

        {/* Legibility overlay */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(120% 110% at 50% 40%,rgba(248,243,230,.55) 0%,rgba(244,238,222,.18) 38%,transparent 60%),radial-gradient(135% 120% at 50% 44%,transparent 50%,rgba(45,58,35,.22))' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }} className="text-center px-6">
          <p className="font-sans text-[13px] font-medium tracking-[0.46em] uppercase text-terracotta">
            We&apos;re getting married
          </p>
          <h1
            className="font-script text-forest"
            style={{ fontSize: 'clamp(72px,13vw,168px)', lineHeight: .95, margin: '16px 0 0', textShadow: '0 2px 22px rgba(255,250,240,.6),0 1px 0 rgba(255,255,255,.45)' }}
          >
            {wedding.names.a} &amp; {wedding.names.b}
          </h1>

          {/* Diamond divider */}
          <div className="flex items-center justify-center gap-[14px] my-[28px]" aria-hidden="true">
            <span style={{ display: 'block', width: '84px', height: '1px', background: 'linear-gradient(90deg,transparent,#C8612E)' }} />
            <span style={{ display: 'block', width: '9px', height: '9px', background: '#C8612E', transform: 'rotate(45deg)', boxShadow: '0 0 0 4px rgba(200,97,46,.12)' }} />
            <span style={{ display: 'block', width: '84px', height: '1px', background: 'linear-gradient(90deg,#C8612E,transparent)' }} />
          </div>

          <p className="font-sans text-[15px] font-medium tracking-[0.4em] uppercase text-ink">
            {wedding.date.full}
          </p>
        </div>

        {/* Scroll cue */}
        <div aria-hidden="true" style={{ position: 'absolute', zIndex: 2, left: '50%', bottom: '30px', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span className="font-sans text-[10px] tracking-[0.34em] uppercase opacity-60" style={{ color: '#2D3A23' }}>Scroll</span>
          <span style={{ position: 'relative', display: 'block', width: '1px', height: '44px', background: 'linear-gradient(#2D3A23,transparent)', opacity: .5 }}>
            <span style={{ position: 'absolute', left: '-2px', top: 0, width: '5px', height: '5px', borderRadius: '50%', background: '#C8612E', animation: 'scrollDot 2s ease-in-out infinite' }} />
          </span>
        </div>
      </section>

      {/* EVENT DETAILS */}
      <section aria-label="Event details" className="bg-cream py-[clamp(84px,13vh,150px)] px-6 font-sans text-ink">
        <div className="max-w-[680px] mx-auto text-center">
          <p className="font-sans text-[12px] font-medium tracking-[0.42em] uppercase text-terracotta">The Celebration</p>
          <h2
            className="font-display font-medium text-forest"
            style={{ fontSize: 'clamp(40px,6vw,68px)', lineHeight: 1.04, margin: '14px 0 0' }}
          >
            Event Details
          </h2>
          <p className="reveal text-[16px] leading-[1.8] text-ink opacity-80 max-w-[450px] mx-auto mt-[18px]">
            {wedding.message}
          </p>

          {/* Diamond divider */}
          <div className="reveal flex items-center justify-center gap-[14px] my-[42px] max-w-[240px] mx-auto" aria-hidden="true">
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,#C8612E)' }} />
            <span style={{ width: '9px', height: '9px', background: '#C8612E', transform: 'rotate(45deg)', boxShadow: '0 0 0 4px rgba(200,97,46,.10)' }} />
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#C8612E,transparent)' }} />
          </div>

          {/* Details card */}
          <div
            className="reveal bg-biscuit text-center rounded-[6px]"
            style={{ padding: 'clamp(38px,5vw,58px) clamp(28px,5vw,52px)', boxShadow: '0 34px 64px rgba(120,80,40,.16),0 4px 12px rgba(120,80,40,.08)' }}
          >
            {/* Rings icon */}
            <div className="flex items-center justify-center mb-[22px]" aria-hidden="true">
              <span style={{ display: 'block', width: '30px', height: '30px', border: '2px solid #C8612E', borderRadius: '50%' }} />
              <span style={{ display: 'block', width: '30px', height: '30px', border: '2px solid #C8612E', borderRadius: '50%', marginLeft: '-11px' }} />
            </div>

            <h3
              className="font-display font-semibold text-forest"
              style={{ fontSize: 'clamp(26px,3.4vw,36px)', margin: 0 }}
            >
              Wedding Ceremony
            </h3>
            <p className="font-sans text-[12.5px] tracking-[0.32em] uppercase text-terracotta mt-[12px]">
              {wedding.location.ceremonyTime}
            </p>

            <div style={{ width: '40px', height: '1px', background: 'rgba(45,58,35,.22)', margin: '26px auto' }} aria-hidden="true" />

            <p className="font-display text-forest font-medium" style={{ fontSize: 'clamp(22px,2.6vw,28px)' }}>
              {wedding.location.venue}
            </p>
            <p className="font-sans text-[15px] leading-[1.7] text-ink opacity-80 mt-[8px]">
              {wedding.location.address}
            </p>

            {/* Map */}
            {wedding.location.coords && (
              <div className="mt-[30px] h-[230px] rounded-[5px] overflow-hidden">
                <VenueMap lat={wedding.location.coords.lat} lon={wedding.location.coords.lon} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-forest text-cream text-center py-[clamp(76px,12vh,128px)] px-6">
        <div className="max-w-[640px] mx-auto">
          <div
            className="font-script text-cream"
            style={{ fontSize: 'clamp(58px,9vw,108px)', lineHeight: 1 }}
            aria-hidden="true"
          >
            {wedding.names.a} &amp; {wedding.names.b}
          </div>
          <p className="font-sans text-[13px] tracking-[0.4em] uppercase text-biscuit mt-[18px]">
            {wedding.date.short}
          </p>

          {/* Diamond divider */}
          <div className="reveal flex items-center justify-center gap-[14px] my-[42px] max-w-[220px] mx-auto" aria-hidden="true">
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,#C8612E)' }} />
            <span style={{ width: '8px', height: '8px', background: '#C8612E', transform: 'rotate(45deg)', boxShadow: '0 0 0 4px rgba(200,97,46,.12)' }} />
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,#C8612E,transparent)' }} />
          </div>

          <div className="reveal">
            <CountdownTimer dateDDMMYYYY={wedding.date.ddmmyyyy} variant="light" />
          </div>

          <p className="font-sans text-[13px] tracking-[0.05em] mt-[14px]" style={{ color: 'rgba(245,240,225,.72)' }}>
            Made with <span className="text-terracotta">&#9829;</span> for our family &amp; friends
          </p>
        </div>
      </footer>

      {wedding.music && <MusicButton src={wedding.music} autoplayOnMount={false} />}
    </main>
  );
}
