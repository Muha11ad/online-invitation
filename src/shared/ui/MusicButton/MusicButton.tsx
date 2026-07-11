"use client";

import { useEffect, useRef, useState } from "react";

import { NoteIcon } from "@/shared/ui/MusicButton/NoteIcon";
import { PauseIcon } from "@/shared/ui/MusicButton/PauseIcon";

export function MusicButton(params: MusicButtonParams): React.JSX.Element {
  const { src, autoplayOnMount = true } = params;
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    if (autoplayOnMount) {
      playAudio(audio, () => setPlaying(true));
    }

    // Allow other components (e.g. EnvelopeGate) to trigger play via a user-gesture-adjacent event
    function handleAutoplay() {
      playAudio(audio, () => setPlaying(true));
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
    if (!audio) {
      return;
    }

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
      className={getButtonClassName(playing)}
      style={{ position: "fixed" }}
    >
      {getButtonContent(playing)}
    </button>
  );
}

function playAudio(audio: HTMLAudioElement, onPlaying: () => void): void {
  void audio
    .play()
    .then(() => {
      onPlaying();
    })
    .catch(() => {
      // browser blocked autoplay — user must tap the button
    });
}

function getButtonClassName(playing: boolean): string {
  return [
    "fixed right-7 bottom-7 z-[200]",
    "h-11 w-11 cursor-pointer rounded-full border outline-none",
    "flex items-center justify-center",
    "transition-colors duration-[240ms] ease-[ease]",
    playing
      ? "border-sage bg-sage text-warm-white"
      : "border-sage bg-warm-white text-sage hover:bg-sage hover:text-warm-white",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-sage",
  ].join(" ");
}

function getButtonContent(playing: boolean): React.ReactNode {
  return (
    <>
      {playing && (
        <span
          className="pointer-events-none absolute inset-[-5px] rounded-full border border-sage"
          style={{ animation: "pulse-ring 2.4s ease-out infinite" }}
          aria-hidden="true"
        />
      )}
      {playing ? <PauseIcon /> : <NoteIcon />}
    </>
  );
}

interface MusicButtonParams {
  src: string;
  /** Set to false when a gate (e.g. EnvelopeGate) controls playback via the 'wedding:autoplay' event instead. */
  autoplayOnMount?: boolean;
}
