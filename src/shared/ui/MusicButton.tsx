"use client";

import { useEffect, useRef, useState } from "react";

import { NoteIcon } from "@/shared/ui/NoteIcon";
import { PauseIcon } from "@/shared/ui/PauseIcon";

export function MusicButton(params: MusicButtonParams): React.JSX.Element {
  const { src, autoplayOnMount = true } = params;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    if (autoplayOnMount) {
      void audio
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(() => {
          // browser blocked autoplay — user must tap the button
        });
    }

    // Allow other components (e.g. EnvelopeGate) to trigger play via a user-gesture-adjacent event
    function handleAutoplay() {
      void audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
    document.addEventListener("wedding:autoplay", handleAutoplay);

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener("wedding:autoplay", handleAutoplay);
    };
  }, [src, autoplayOnMount]);

  function handleClick(): void {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying((p) => !p);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={playing ? "Mute music" : "Play music"}
      className={[
        "fixed right-7 bottom-7 z-[200]",
        "h-11 w-11 cursor-pointer rounded-full border outline-none",
        "flex items-center justify-center",
        "transition-colors duration-[240ms] ease-[ease]",
        playing
          ? "border-sage bg-sage text-warm-white"
          : "border-sage bg-warm-white text-sage hover:bg-sage hover:text-warm-white",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-sage",
      ].join(" ")}
      style={{ position: "fixed" }}
    >
      {playing && (
        <span
          className="pointer-events-none absolute inset-[-5px] rounded-full border border-sage"
          style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
          aria-hidden="true"
        />
      )}
      {playing ? <PauseIcon /> : <NoteIcon />}
    </button>
  );
}

interface MusicButtonParams {
  src: string;
  /** Set to false when a gate (e.g. EnvelopeGate) controls playback via the 'wedding:autoplay' event instead. */
  autoplayOnMount?: boolean;
}
