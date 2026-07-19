"use client";

import { useEffect, useState } from "react";

import { getDictionary, type Locale } from "@/shared/i18n";

export function EnvelopeGate(params: EnvelopeGateParams): React.JSX.Element | null {
  const { husbandName, wifeName, locale } = params;
  const dict = getDictionary(locale).secondTemplate;
  const [phase, setPhase] = useState<"closed" | "opening" | "gone">("closed");

  useEffect(() => {
    try {
      document.body.style.overflow = "hidden";
    } catch {}
    return () => {
      try {
        document.body.style.overflow = "";
      } catch {}
    };
  }, []);

  function open() {
    if (phase !== "closed") return;
    setPhase("opening");
    document.dispatchEvent(new CustomEvent("wedding:autoplay"));
    setTimeout(() => {
      setPhase("gone");
      try {
        document.body.style.overflow = "";
      } catch {}
    }, 1850);
  }

  if (phase === "gone") return null;

  const isOpening = phase === "opening";
  const initials = `${husbandName.charAt(0).toUpperCase()} & ${wifeName.charAt(0).toUpperCase()}`;

  return (
    <>
      {/* SVG filter defs — zero layout footprint */}
      <svg
        width="0"
        height="0"
        style={{ position: "absolute", overflow: "hidden" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="eg-waxEdge">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.024"
              numOctaves="3"
              seed="11"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="21"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter id="eg-waxGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.55"
              numOctaves="3"
              seed="7"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"
              result="grain"
            />
            <feComposite in="grain" in2="SourceAlpha" operator="in" result="clippedGrain" />
            <feBlend in="SourceGraphic" in2="clippedGrain" mode="multiply" />
          </filter>
          <filter id="eg-paperGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
              result="g"
            />
            <feColorMatrix
              in="g"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0"
            />
          </filter>
        </defs>
      </svg>

      <div
        aria-modal="true"
        role="dialog"
        aria-label="Wedding invitation envelope"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "34px",
          perspective: "1700px",
          background: "radial-gradient(circle at 38% 30%, #faf6ea, #e9e0c9)",
          opacity: isOpening ? 0 : 1,
          transition: "opacity .75s ease 1.05s",
        }}
      >
        {/* Envelope wrapper — sized positioning context; the seal button lives outside the preserve-3d child (see below) because
            iOS Safari breaks touch hit-testing on buttons nested inside a transform-style:preserve-3d ancestor */}
        <div style={{ position: "relative", width: "min(80vw, 560px)", aspectRatio: "7 / 5" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: isOpening ? "scale(1.12) translateY(-16px)" : "scale(1)",
              opacity: isOpening ? 0 : 1,
              transition: "transform .85s cubic-bezier(.22,.61,.36,1) .9s, opacity .85s ease .95s",
            }}
          >
            {/* Back panel */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                borderRadius: "7px",
                background: "linear-gradient(150deg,#2a3720,#1a2313)",
                boxShadow: "0 34px 60px rgba(38,28,10,.42),0 6px 14px rgba(38,28,10,.3)",
                overflow: "hidden",
                pointerEvents: "none",
              }}
            />

            {/* Left flap */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                clipPath: "polygon(0 0,50% 50%,0 100%)",
                background:
                  "radial-gradient(140% 90% at 0% 50%,rgba(255,241,210,.13),transparent 55%),linear-gradient(96deg,#3a4a26 0%,#313f22 45%,#242e19 100%)",
                filter: "drop-shadow(2px 0 2.5px rgba(15,11,4,.4))",
                pointerEvents: "none",
              }}
            />
            {/* Right flap */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                clipPath: "polygon(100% 0,50% 50%,100% 100%)",
                background:
                  "radial-gradient(140% 90% at 100% 50%,rgba(255,241,210,.1),transparent 55%),linear-gradient(264deg,#2e3b21 0%,#28331c 45%,#202918 100%)",
                filter: "drop-shadow(-2px 0 2.5px rgba(15,11,4,.4))",
                pointerEvents: "none",
              }}
            />
            {/* Bottom flap */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 3,
                clipPath: "polygon(0 100%,100% 100%,50% 50%)",
                background:
                  "radial-gradient(120% 80% at 50% 100%,rgba(255,241,210,.08),transparent 55%),linear-gradient(180deg,#2b3820 0%,#232e19 55%,#1c2414 100%)",
                filter: "drop-shadow(0 -2px 3px rgba(15,11,4,.42))",
                pointerEvents: "none",
              }}
            />

            {/* Top flap — opens on click */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                transform: isOpening ? "rotateX(178deg)" : "rotateX(0deg)",
                transition: "transform .8s cubic-bezier(.45,0,.25,1) .3s",
                clipPath: "polygon(0 0, 100% 0, 50% 50%)",
                background:
                  "radial-gradient(120% 140% at 50% 0%,rgba(255,244,218,.16),transparent 46%),linear-gradient(168deg,#46572f 0%,#394827 46%,#2c3920 78%,#232d19 100%)",
                backfaceVisibility: "visible",
                willChange: "transform",
                pointerEvents: "none",
                filter: "drop-shadow(0 3px 5px rgba(12,9,3,.48))",
              }}
            />

            {/* Paper grain overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                borderRadius: "7px",
                filter: "url(#eg-paperGrain)",
                opacity: 0.16,
                mixBlendMode: "overlay",
              }}
            />
            {/* Light sheen */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                borderRadius: "7px",
                background:
                  "radial-gradient(120% 120% at 22% 12%,rgba(255,244,222,.30),rgba(255,244,222,.06) 38%,transparent 60%)",
                mixBlendMode: "soft-light",
              }}
            />
            {/* Vignette */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 4,
                pointerEvents: "none",
                borderRadius: "7px",
                background:
                  "radial-gradient(125% 110% at 50% 46%,transparent 52%,rgba(0,0,0,.16) 80%,rgba(0,0,0,.34))",
              }}
            />
          </div>

          {/* Wax seal — the clickable trigger. Sibling of the preserve-3d envelope, not a child of it. */}
          <button
            type="button"
            onClick={open}
            aria-label="Open invitation"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 6,
              width: "132px",
              height: "132px",
              marginLeft: "-66px",
              marginTop: "-66px",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              touchAction: "manipulation",
              opacity: isOpening ? 0 : 1,
              transform: isOpening ? "scale(.5)" : "scale(1)",
              transition: "opacity .42s ease, transform .46s cubic-bezier(.4,0,.2,1)",
            }}
          >
            {/* Wax clump with drips */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                filter: "url(#eg-waxEdge) drop-shadow(2px 4px 4px rgba(30,10,4,.55))",
              }}
            >
              {/* Drips — elongated, dripping from the lower edge of the disc */}
              <div
                style={{
                  position: "absolute",
                  width: "15px",
                  height: "30px",
                  left: "30%",
                  bottom: "-16px",
                  borderRadius: "48% 52% 42% 58% / 30% 30% 70% 70%",
                  background: "linear-gradient(180deg,#6e2015,#4a140b)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: "11px",
                  height: "19px",
                  right: "18%",
                  bottom: "-10px",
                  borderRadius: "52% 48% 46% 54% / 32% 32% 68% 68%",
                  background: "linear-gradient(180deg,#681e13,#46130a)",
                }}
              />
              {/* Wax disc — organic blob, not a perfect circle */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "46% 54% 51% 49% / 53% 46% 54% 47%",
                  background:
                    "radial-gradient(115% 115% at 34% 26%,#823227 0%,#6c2419 42%,#571a10 68%,#3f1108 100%)",
                  boxShadow:
                    "inset 4px 5px 9px rgba(255,206,182,.14),inset -6px -8px 14px rgba(30,6,3,.55),inset 0 0 0 1px rgba(46,10,5,.5)",
                  filter: "url(#eg-waxGrain)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "46% 54% 51% 49% / 53% 46% 54% 47%",
                  background:
                    "radial-gradient(46% 38% at 32% 24%,rgba(255,226,204,.22),transparent 68%)",
                }}
              />
            </div>
            {/* Embossed monogram */}
            <span
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display), serif",
                fontSize: "20px",
                fontWeight: 500,
                letterSpacing: ".03em",
                color: "rgba(66,16,10,.82)",
                textShadow: "0 -1px 1px rgba(20,4,2,.6),0 1.5px 0.5px rgba(255,206,180,.32)",
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
            transition: "opacity .3s ease",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "34px",
              height: "1px",
              background: "#C8612E",
              opacity: 0.6,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: ".4em",
              fontSize: "11px",
              color: "#C8612E",
            }}
          >
            {dict.envelopeClickToOpen}
          </span>
          <span
            style={{
              display: "inline-block",
              width: "34px",
              height: "1px",
              background: "#C8612E",
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    </>
  );
}

interface EnvelopeGateParams {
  husbandName: string;
  wifeName: string;
  locale: Locale;
}
