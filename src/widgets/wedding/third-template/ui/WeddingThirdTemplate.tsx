import Image from "next/image";

import type { WeddingTemplateProps } from "@/entities/wedding";

import { Map } from "@/shared/ui/Map/Map";
import { RevealObserver } from "@/shared/ui/RevealObserver";
import { CountdownTimer } from "@/shared/ui/CountdownTimer";
import { MusicButton } from "@/shared/ui/MusicButton/MusicButton";

import { PhotoSlot } from "./PhotoSlot";

export function WeddingThirdTemplate(props: WeddingTemplateProps): React.JSX.Element {
  const { guestName, ...wedding } = props;

  return (
    <main
      id="top"
      className="min-h-screen bg-parchment font-typewriter leading-[1.7] text-charcoal antialiased"
    >
      <RevealObserver />

      {/* HERO */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[100svh] flex-col items-center justify-between overflow-hidden px-6 text-center"
        style={{ padding: "clamp(38px,6vh,74px) 24px" }}
      >
        <PhotoSlot
          src="/images/p2-t3-hero-image.jpg"
          gradient="linear-gradient(165deg,#4a4534,#2d2b25)"
          className="absolute inset-0 z-0"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(45,43,37,.30) 0%, rgba(45,43,37,.04) 26%, rgba(45,43,37,.10) 66%, rgba(45,43,37,.44) 100%)",
          }}
        />

        <div className="relative z-[2] flex w-full flex-1 flex-col items-center justify-between">
          {/* Monogram */}
          <div className="reveal relative h-[118px] w-[92px]">
            <Image
              src="/images/p2-t3-couples-name-border.png"
              alt=""
              aria-hidden="true"
              width={92}
              height={118}
              className="h-full w-full object-contain"
            />
            <span
              className="absolute inset-0 flex flex-col items-center justify-center gap-[1px] pb-[6px] font-script text-[#fbf7ef]"
              style={{ textShadow: "0 1px 6px rgba(45,43,37,.4)" }}
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>
                {wedding.names.a.charAt(0).toUpperCase()}
              </span>
              <span style={{ fontSize: "11px", lineHeight: 1, opacity: 0.85 }}>&amp;</span>
              <span style={{ fontSize: "20px", lineHeight: 1 }}>
                {wedding.names.b.charAt(0).toUpperCase()}
              </span>
            </span>
          </div>

          <div className="flex flex-col items-center">
            <p
              className="reveal mt-[24px] font-display font-light tracking-[0.36em] text-[#f4ecdd] uppercase"
              style={{ fontSize: "clamp(20px,2.6vw,32px)" }}
            >
              The Wedding Of
            </p>
            <h1
              className="reveal mt-[10px] font-script text-[#fbf7ef]"
              style={{
                fontSize: "clamp(60px,9.5vw,132px)",
                lineHeight: 1.02,
                textShadow: "0 2px 22px rgba(45,43,37,.35)",
              }}
            >
              {wedding.names.a} &amp; {wedding.names.b}
            </h1>
          </div>

          <p className="reveal font-typewriter text-[12px] leading-[2.2] tracking-[0.34em] text-[#e8ddca] uppercase">
            {wedding.date.full}
            <br />
            {wedding.location.city}
          </p>
        </div>
      </section>

      {/* OUR FOREVER BEGINS */}
      <section aria-label="Welcome message" className="bg-greige px-6 py-[clamp(84px,11vw,148px)]">
        <div className="mx-auto flex max-w-[820px] flex-col items-center text-center">
          <div className="reveal mb-[clamp(56px,8vw,96px)] flex items-center justify-center gap-[14px]">
            <span
              className="font-display font-normal tracking-[0.16em] text-gold uppercase"
              style={{ fontSize: "clamp(26px,3.4vw,42px)" }}
            >
              Our Forever
            </span>
            <span
              className="-ml-[6px] font-script text-gold"
              style={{ fontSize: "clamp(56px,8vw,104px)", lineHeight: 0.9 }}
            >
              Begins
            </span>
          </div>

          {guestName && (
            <p className="reveal mb-6 font-typewriter text-[12px] tracking-[0.42em] text-gold uppercase">
              Dear {guestName},
            </p>
          )}
          <p className="reveal max-w-[640px] text-[15px] leading-[2]">{wedding.message}</p>

          <div className="reveal mt-[clamp(64px,9vw,120px)] mr-[clamp(10px,6vw,80px)] self-end text-center">
            <div
              className="font-script text-gold"
              style={{ fontSize: "clamp(34px,4vw,46px)", lineHeight: 1.1 }}
            >
              With love,
            </div>
            <div
              className="font-script text-gold"
              style={{ fontSize: "clamp(34px,4vw,46px)", lineHeight: 1.2 }}
            >
              {wedding.names.a} and {wedding.names.b}
            </div>
          </div>
        </div>
      </section>

      {/* FRAMED COUPLE PHOTO */}
      <section aria-label="The couple" className="bg-greige px-6 py-[clamp(76px,10vw,140px)]">
        <div className="mx-auto grid max-w-[1040px] grid-cols-1 items-center justify-items-center gap-[clamp(20px,4vw,52px)] text-center sm:grid-cols-[1fr_auto_1fr] sm:text-inherit">
          <p
            className="reveal font-display font-normal tracking-[0.26em] text-gold uppercase sm:text-right"
            style={{ fontSize: "clamp(17px,2vw,23px)", lineHeight: 1.7 }}
          >
            Rooted in
            <br />
            friendship,
          </p>

          <div className="reveal relative" style={{ width: "clamp(240px,30vw,360px)" }}>
            <div
              className="absolute overflow-hidden rounded-full"
              style={{ top: "21%", left: "21%", right: "21%", bottom: "22%" }}
            >
              <PhotoSlot
                src={wedding.coupleMainImage ?? "/images/third-template/couple.jpg"}
                alt={`${wedding.names.a} and ${wedding.names.b}`}
                gradient="linear-gradient(160deg,#d9cfba,#e6e4dd)"
                className="h-full w-full"
              />
            </div>
            <Image
              src="/images/p2-t3-couple-border-image.png"
              alt=""
              aria-hidden="true"
              width={1024}
              height={1536}
              className="pointer-events-none relative block h-auto w-full select-none"
            />
          </div>

          <p
            className="reveal font-display font-normal tracking-[0.26em] text-gold uppercase sm:text-left"
            style={{ fontSize: "clamp(17px,2vw,23px)", lineHeight: 1.7 }}
          >
            blossoming
            <br />
            into forever.
          </p>
        </div>
      </section>

      {/* WEDDING DETAILS TEASER */}
      <section
        aria-label="Ceremony and reception"
        className="relative flex items-center justify-center overflow-hidden bg-greige"
        style={{ minHeight: "clamp(640px,92vh,920px)" }}
      >
        <PhotoSlot
          src="/images/p2-t3-wd-back.jpg"
          gradient="linear-gradient(165deg,#4a4534,#2d2b25)"
          className="absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "rgba(45,43,37,.42)" }}
        />

        <div
          className="relative z-10 text-center text-parchment"
          style={{ width: "min(450px,62vw)", padding: "24px 0" }}
        >
          <p className="reveal font-display text-[14px] tracking-[0.4em] text-[#efe7d9] uppercase">
            Ceremony &amp; Reception
          </p>
          <h2
            className="reveal mt-[18px] font-display font-light tracking-[0.05em] text-[#fbf7ef] uppercase"
            style={{ fontSize: "clamp(26px,3.4vw,44px)" }}
          >
            Wedding Details
          </h2>
          <p className="reveal mt-[22px] text-[11px] leading-[2.1] tracking-[0.18em] text-[#f0e9dc] uppercase">
            {wedding.date.full}
            <br />
            {wedding.location.ceremonyTime}
            <br />
            {wedding.location.venue} &middot; {wedding.location.city}
          </p>
          <p
            className="reveal mx-auto mt-[20px] mb-[26px] text-[12px] leading-[1.9] text-[#ece2d0]"
            style={{ maxWidth: "320px" }}
          >
            An evening of dinner, dancing, and stories under the string lights — stay late, we
            insist.
          </p>
          <a
            href="#venue"
            className="reveal border-b border-parchment/50 pb-[5px] text-[12px] tracking-[0.28em] text-parchment uppercase transition-colors hover:border-parchment"
          >
            Tap here to view details
          </a>
        </div>
      </section>

      {/* THE VENUE */}
      <section
        id="venue"
        aria-label="The venue"
        className="bg-parchment px-6 py-[clamp(84px,11vw,148px)]"
      >
        <div className="mx-auto max-w-[1080px]">
          <h2
            className="reveal mb-[clamp(40px,5vw,60px)] text-center font-display font-light tracking-[0.14em] text-gold uppercase"
            style={{ fontSize: "clamp(34px,5vw,60px)" }}
          >
            The Venue
          </h2>
          <div className="reveal grid grid-cols-1 items-center gap-[clamp(40px,6vw,72px)] md:grid-cols-[1.4fr_1fr]">
            <div
              className="overflow-hidden bg-parchment p-[5px]"
              style={{ aspectRatio: "3 / 2", border: "1px solid #715436" }}
            >
              {wedding.location.coords && (
                <Map
                  lat={wedding.location.coords.lat}
                  lon={wedding.location.coords.lon}
                  palette={{
                    land: "#faf7f2",
                    water: "#715436",
                    road: "#efe9dd",
                    roadCasing: "#e6e4dd",
                    label: "#2d2b25",
                    labelHalo: "#faf7f2",
                    pin: "#82643b",
                  }}
                />
              )}
            </div>
            <div>
              <div className="font-script text-gold" style={{ fontSize: "64px", lineHeight: 1 }}>
                {wedding.location.venue}
              </div>
              <div className="mt-[14px] text-[14px] leading-[2] tracking-[0.04em]">
                {wedding.location.address}
              </div>
              <div className="my-[22px] h-px w-[48px] bg-gold" aria-hidden="true" />
              <p className="text-[13.5px] leading-[2]">
                Arrive a little before {wedding.location.ceremonyTime} to find your seat before the
                ceremony begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER + COUNTDOWN */}
      <footer className="bg-greige px-6 py-[clamp(52px,6vw,76px)] pb-[clamp(44px,5vw,60px)] text-center">
        <div className="mx-auto max-w-[820px]">
          <div
            className="mb-[clamp(40px,5vw,56px)] border-t border-dashed border-gold-dark"
            aria-hidden="true"
          />

          <div className="reveal font-script text-gold" style={{ fontSize: "46px", lineHeight: 1 }}>
            {wedding.names.a} &amp; {wedding.names.b}
          </div>
          <p className="reveal mt-[16px] mb-[clamp(38px,5vw,52px)] text-[11px] tracking-[0.3em] text-gold-dark uppercase">
            {wedding.date.full} &middot; {wedding.location.city}
          </p>

          <div className="reveal mb-[clamp(38px,5vw,52px)]">
            <CountdownTimer dateDDMMYYYY={wedding.date.ddmmyyyy} variant="dark" />
          </div>

          <a
            href="#top"
            className="reveal border-b border-transparent pb-[4px] text-[11px] tracking-[0.3em] text-gold uppercase transition-colors hover:border-gold"
          >
            Back to top
          </a>
        </div>
      </footer>

      {wedding.music && <MusicButton src={wedding.music} />}
    </main>
  );
}
