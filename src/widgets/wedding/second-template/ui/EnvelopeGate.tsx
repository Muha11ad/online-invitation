'use client';

import { useEffect, useState } from 'react';

interface Props {
  nameA: string;
  nameB: string;
}

export function EnvelopeGate({ nameA, nameB }: Props): React.JSX.Element | null {
  const [phase, setPhase] = useState<'closed' | 'opening' | 'gone'>('closed');

  useEffect(() => {
    try { document.body.style.overflow = 'hidden'; } catch (_) {}
    return () => {
      try { document.body.style.overflow = ''; } catch (_) {}
    };
  }, []);

  function open() {
    if (phase !== 'closed') return;
    setPhase('opening');
    document.dispatchEvent(new CustomEvent('wedding:autoplay'));
    setTimeout(() => {
      setPhase('gone');
      try { document.body.style.overflow = ''; } catch (_) {}
    }, 1850);
  }

  if (phase === 'gone') return null;

  const isOpening = phase === 'opening';
  const initials = `${nameA.charAt(0).toUpperCase()} & ${nameB.charAt(0).toUpperCase()}`;

  return (
    <>
      {/* SVG filter defs — zero layout footprint */}
      <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <filter id="eg-waxEdge">
            <feTurbulence type="fractalNoise" baseFrequency="0.014 0.016" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="13" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="eg-paperGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="g" />
            <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0" />
          </filter>
        </defs>
      </svg>

      <div
        aria-modal="true"
        role="dialog"
        aria-label="Wedding invitation envelope"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '34px', perspective: '1700px',
          background: 'radial-gradient(circle at 38% 30%, #faf6ea, #e9e0c9)',
          opacity: isOpening ? 0 : 1,
          transition: 'opacity .75s ease 1.05s',
        }}
      >
        {/* Envelope wrapper — sized positioning context; the seal button lives outside the preserve-3d child (see below) because
            iOS Safari breaks touch hit-testing on buttons nested inside a transform-style:preserve-3d ancestor */}
        <div style={{ position: 'relative', width: 'min(80vw, 560px)', aspectRatio: '7 / 5' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transform: isOpening ? 'scale(1.12) translateY(-16px)' : 'scale(1)',
              opacity: isOpening ? 0 : 1,
              transition: 'transform .85s cubic-bezier(.22,.61,.36,1) .9s, opacity .85s ease .95s',
            }}
          >
          {/* Back panel */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, borderRadius: '7px', background: 'linear-gradient(150deg,#293620,#1d2615)', boxShadow: '0 34px 60px rgba(38,28,10,.42),0 6px 14px rgba(38,28,10,.3)', overflow: 'hidden', pointerEvents: 'none' }} />

          {/* Left flap */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, clipPath: 'polygon(0 0,50% 50%,0 100%)', background: 'linear-gradient(95deg,#3b4b27,#2e3b21)', pointerEvents: 'none' }} />
          {/* Right flap */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 2, clipPath: 'polygon(100% 0,50% 50%,100% 100%)', background: 'linear-gradient(265deg,#2f3c22,#252f1a)', pointerEvents: 'none' }} />
          {/* Bottom flap */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 3, clipPath: 'polygon(0 100%,100% 100%,50% 50%)', background: 'linear-gradient(180deg,#2c3820,#222d18)', pointerEvents: 'none' }} />

          {/* Top flap — opens on click */}
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 5,
              transformOrigin: 'top center', transformStyle: 'preserve-3d',
              transform: isOpening ? 'rotateX(178deg)' : 'rotateX(0deg)',
              transition: 'transform .8s cubic-bezier(.45,0,.25,1) .3s',
              clipPath: 'polygon(0 0, 100% 0, 50% 50%)',
              background: 'linear-gradient(168deg,#44552d 0%,#384726 55%,#2d3a21 100%)',
              backfaceVisibility: 'visible',
              willChange: 'transform',
              pointerEvents: 'none',
            }}
          />

          {/* Paper grain overlay */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', borderRadius: '7px', filter: 'url(#eg-paperGrain)', opacity: .16, mixBlendMode: 'overlay' }} />
          {/* Light sheen */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', borderRadius: '7px', background: 'radial-gradient(120% 120% at 22% 12%,rgba(255,244,222,.30),rgba(255,244,222,.06) 38%,transparent 60%)', mixBlendMode: 'soft-light' }} />
          {/* Vignette */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', borderRadius: '7px', background: 'radial-gradient(125% 110% at 50% 46%,transparent 52%,rgba(0,0,0,.16) 80%,rgba(0,0,0,.34))' }} />
        </div>

          {/* Wax seal — the clickable trigger. Sibling of the preserve-3d envelope, not a child of it. */}
          <button
            type="button"
            onClick={open}
            aria-label="Open invitation"
            style={{
              position: 'absolute', top: '50%', left: '50%', zIndex: 6,
              width: '132px', height: '132px', marginLeft: '-66px', marginTop: '-66px',
              cursor: 'pointer', background: 'none', border: 'none', padding: 0, touchAction: 'manipulation',
              opacity: isOpening ? 0 : 1,
              transform: isOpening ? 'scale(.5)' : 'scale(1)',
              transition: 'opacity .42s ease, transform .46s cubic-bezier(.4,0,.2,1)',
            }}
          >
            {/* Wax clump with drips */}
            <div style={{ position: 'absolute', inset: 0, filter: 'url(#eg-waxEdge) drop-shadow(3px 5px 5px rgba(35,12,4,.5))' }}>
              <div style={{ position: 'absolute', width: '22px', height: '26px', left: '58%', bottom: '-9px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%,#8f3329,#601a12)' }} />
              <div style={{ position: 'absolute', width: '18px', height: '16px', right: '-6px', top: '56%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%,#8a3026,#5b1810)' }} />
              <div style={{ position: 'absolute', width: '14px', height: '14px', left: '-5px', top: '42%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 30%,#883026,#581710)' }} />
              {/* Wax disc */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(120% 120% at 36% 28%,#a8453a 0%,#8c3227 46%,#74251c 72%,#5a160c 100%)', boxShadow: 'inset 5px 6px 11px rgba(255,206,182,.26),inset -7px -9px 16px rgba(42,9,4,.5),inset 0 0 0 1px rgba(58,13,7,.45)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 0 9px 3px rgba(46,10,5,.4)' }} />
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(60% 50% at 33% 26%,rgba(255,236,216,.38),rgba(255,236,216,.07) 48%,transparent 72%)' }} />
            </div>
            {/* Embossed monogram */}
            <span
              style={{
                position: 'absolute', inset: 0, zIndex: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display), serif',
                fontSize: '20px', fontWeight: 500, letterSpacing: '.03em',
                color: 'rgba(66,16,10,.82)',
                textShadow: '0 -1px 1px rgba(20,4,2,.6),0 1.5px 0.5px rgba(255,206,180,.32)',
              }}
            >
              {initials}
            </span>
          </button>
        </div>

        {/* Click cue */}
        <div
          style={{
            opacity: isOpening ? 0 : 1,
            transition: 'opacity .3s ease',
            textAlign: 'center',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}
        >
          <span style={{ display: 'inline-block', width: '34px', height: '1px', background: '#C8612E', opacity: .6 }} />
          <span style={{ fontFamily: 'var(--font-sans)', textTransform: 'uppercase', letterSpacing: '.4em', fontSize: '11px', color: '#C8612E' }}>
            Click the seal to open
          </span>
          <span style={{ display: 'inline-block', width: '34px', height: '1px', background: '#C8612E', opacity: .6 }} />
        </div>
      </div>
    </>
  );
}
