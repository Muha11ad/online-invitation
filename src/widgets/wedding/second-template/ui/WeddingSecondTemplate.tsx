import Image from "next/image";

import { pick, type WeddingTemplateProps } from "@/entities/wedding";

import { formatWeddingDate, getDictionary } from "@/shared/i18n";
import { MEDIA_LINKS } from "@/shared/lib/mediaLinks";
import { Map } from "@/shared/ui/Map/Map";
import { ContactLink } from "@/shared/ui/ContactLink/ContactLink";
import { RevealObserver } from "@/shared/ui/RevealObserver";
import { CountdownTimer } from "@/shared/ui/CountdownTimer";
import { MusicButton } from "@/shared/ui/MusicButton/MusicButton";

import { EnvelopeGate } from "./EnvelopeGate";

export function WeddingSecondTemplate(wedding: WeddingTemplateProps): React.JSX.Element {
  const { locale } = wedding;
  const dict = getDictionary(locale);
  const husbandName = pick(wedding.names.husband, locale);
  const wifeName = pick(wedding.names.wife, locale);
  const venue = pick(wedding.location.venue, locale);
  const address = pick(wedding.location.address, locale);
  const message = pick(wedding.message, locale);
  const dateFull = formatWeddingDate(wedding.date.ddmmyyyy, locale, "full");
  const dateShort = formatWeddingDate(wedding.date.ddmmyyyy, locale, "short");

  return (
    <main className="min-h-screen bg-amber-warm font-sans leading-[1.65] font-light text-forest antialiased">
      <RevealObserver />
      <EnvelopeGate husbandName={husbandName} wifeName={wifeName} locale={locale} />

      {/* HERO */}
      <section
        aria-label="Hero"
        style={{
          position: "relative",
          minHeight: "100svh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Video background */}
        <video
          aria-hidden="true"
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        >
          <source src={MEDIA_LINKS.secondTemplate.heroVideo} type="video/mp4" />
        </video>

        {/* Legibility overlay */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "rgba(255,255,255,0.42)",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2 }} className="px-6 text-center">
          <p className="font-sans text-[13px] font-medium tracking-[0.46em] text-terracotta uppercase">
            {dict.secondTemplate.heroKicker}
          </p>
          <h1
            className="font-script text-forest"
            style={{
              fontSize: "clamp(72px,13vw,168px)",
              lineHeight: 0.95,
              margin: "16px 0 0",
              textShadow: "0 2px 22px rgba(255,250,240,.6),0 1px 0 rgba(255,255,255,.45)",
            }}
          >
            {husbandName} &amp; {wifeName}
          </h1>

          {/* Diamond divider */}
          <div className="my-[28px] flex items-center justify-center gap-[14px]" aria-hidden="true">
            <span
              style={{
                display: "block",
                width: "84px",
                height: "1px",
                background: "linear-gradient(90deg,transparent,#C8612E)",
              }}
            />
            <span
              style={{
                display: "block",
                width: "9px",
                height: "9px",
                background: "#C8612E",
                transform: "rotate(45deg)",
                boxShadow: "0 0 0 4px rgba(200,97,46,.12)",
              }}
            />
            <span
              style={{
                display: "block",
                width: "84px",
                height: "1px",
                background: "linear-gradient(90deg,#C8612E,transparent)",
              }}
            />
          </div>

          <p className="font-sans text-[15px] font-medium tracking-[0.4em] text-ink uppercase">
            {dateFull}
          </p>
        </div>

        {/* Scroll cue */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            zIndex: 2,
            left: "50%",
            bottom: "30px",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            className="font-sans text-[10px] tracking-[0.34em] uppercase opacity-60"
            style={{ color: "#2D3A23" }}
          >
            {dict.secondTemplate.scroll}
          </span>
          <span
            style={{
              position: "relative",
              display: "block",
              width: "1px",
              height: "44px",
              background: "linear-gradient(#2D3A23,transparent)",
              opacity: 0.5,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "-2px",
                top: 0,
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#C8612E",
                animation: "scrollDot 2s ease-in-out infinite",
              }}
            />
          </span>
        </div>
      </section>

      {/* EVENT DETAILS */}
      <section
        aria-label="Event details"
        className="bg-cream px-6 py-[clamp(84px,13vh,150px)] font-sans text-ink"
      >
        <div className="mx-auto max-w-[680px] text-center">
          <p className="font-sans text-[12px] font-medium tracking-[0.42em] text-terracotta uppercase">
            {dict.secondTemplate.detailsKicker}
          </p>
          <h2
            className="font-display font-medium text-forest"
            style={{ fontSize: "clamp(40px,6vw,68px)", lineHeight: 1.04, margin: "14px 0 0" }}
          >
            {dict.secondTemplate.detailsHeading}
          </h2>
          {wedding.guestName && (
            <p className="reveal mt-[18px] font-sans text-[12px] font-medium tracking-[0.42em] text-terracotta uppercase">
              {dict.common.dearGuest.replace("{name}", wedding.guestName)}
            </p>
          )}
          <p
            className={
              wedding.guestName
                ? "reveal mx-auto mt-2 max-w-[450px] text-[16px] leading-[1.8] text-ink opacity-80"
                : "reveal mx-auto mt-[18px] max-w-[450px] text-[16px] leading-[1.8] text-ink opacity-80"
            }
          >
            {message}
          </p>

          {/* Diamond divider */}
          <div
            className="reveal mx-auto my-[42px] flex max-w-[240px] items-center justify-center gap-[14px]"
            aria-hidden="true"
          >
            <span
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg,transparent,#C8612E)",
              }}
            />
            <span
              style={{
                width: "9px",
                height: "9px",
                background: "#C8612E",
                transform: "rotate(45deg)",
                boxShadow: "0 0 0 4px rgba(200,97,46,.10)",
              }}
            />
            <span
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg,#C8612E,transparent)",
              }}
            />
          </div>

          {/* Fountain */}
          <div
            aria-hidden="true"
            className="reveal reveal-pop relative mx-auto mb-[42px] w-full max-w-[420px]"
          >
            <Image
              src={MEDIA_LINKS.secondTemplate.fountain}
              alt=""
              width={1536}
              height={1024}
              sizes="(min-width: 680px) 420px, 80vw"
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Details card */}
          <div
            className="reveal reveal-pop rounded-[6px] bg-warm-sand text-center"
            style={{
              padding: "clamp(38px,5vw,58px) clamp(28px,5vw,52px)",
              boxShadow: "0 34px 64px rgba(120,80,40,.16),0 4px 12px rgba(120,80,40,.08)",
            }}
          >
            {/* Rings icon */}
            <div className="mb-[22px] flex items-center justify-center" aria-hidden="true">
              <span
                style={{
                  display: "block",
                  width: "30px",
                  height: "30px",
                  border: "2px solid #C8612E",
                  borderRadius: "50%",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: "30px",
                  height: "30px",
                  border: "2px solid #C8612E",
                  borderRadius: "50%",
                  marginLeft: "-11px",
                }}
              />
            </div>

            <h3
              className="font-display font-semibold text-forest"
              style={{ fontSize: "clamp(26px,3.4vw,36px)", margin: 0 }}
            >
              {dict.secondTemplate.ceremonyHeading}
            </h3>
            <p className="mt-[12px] font-sans text-[12.5px] tracking-[0.32em] text-terracotta uppercase">
              {wedding.date.time}
            </p>

            <div
              style={{
                width: "40px",
                height: "1px",
                background: "rgba(45,58,35,.22)",
                margin: "26px auto",
              }}
              aria-hidden="true"
            />

            <p
              className="font-display font-medium text-forest"
              style={{ fontSize: "clamp(22px,2.6vw,28px)" }}
            >
              {venue}
            </p>
            <p className="mt-[8px] font-sans text-[15px] leading-[1.7] text-ink opacity-80">
              {address}
            </p>

            {/* Map */}
            {wedding.location.coords && (
              <div className="mt-[30px] h-[230px] overflow-hidden rounded-[5px]">
                <Map
                  lat={wedding.location.coords.lat}
                  lon={wedding.location.coords.lon}
                  locale={locale}
                  palette={{
                    land: "#efd3bc",
                    water: "#2d3a23",
                    road: "#f5f0e1",
                    roadCasing: "#e9ddc4",
                    label: "#2d3a23",
                    labelHalo: "#f5f0e1",
                    pin: "#c8612e",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-forest px-6 py-[clamp(76px,12vh,128px)] text-center text-cream">
        <div className="mx-auto max-w-[640px]">
          <div
            className="font-script text-cream"
            style={{ fontSize: "clamp(58px,9vw,108px)", lineHeight: 1 }}
            aria-hidden="true"
          >
            {husbandName} &amp; {wifeName}
          </div>
          <p className="mt-[18px] font-sans text-[13px] tracking-[0.4em] text-biscuit uppercase">
            {dateShort}
          </p>

          {/* Diamond divider */}
          <div
            className="reveal mx-auto my-[42px] flex max-w-[220px] items-center justify-center gap-[14px]"
            aria-hidden="true"
          >
            <span
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg,transparent,#C8612E)",
              }}
            />
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "#C8612E",
                transform: "rotate(45deg)",
                boxShadow: "0 0 0 4px rgba(200,97,46,.12)",
              }}
            />
            <span
              style={{
                flex: 1,
                height: "1px",
                background: "linear-gradient(90deg,#C8612E,transparent)",
              }}
            />
          </div>

          <div className="reveal">
            <CountdownTimer dateDDMMYYYY={wedding.date.ddmmyyyy} variant="light" locale={locale} />
          </div>

          <ContactLink className="mt-[44px] text-[rgba(245,240,225,.72)]" />
        </div>
      </footer>

      {wedding.music && <MusicButton src={wedding.music} autoplayOnMount={false} />}
    </main>
  );
}
