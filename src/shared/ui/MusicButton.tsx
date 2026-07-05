'use client';

import { useEffect, useRef, useState } from 'react';

import { NoteIcon } from '@/shared/ui/NoteIcon';
import { PauseIcon } from '@/shared/ui/PauseIcon';

interface Props {
  src: string;
  /** Set to false when a gate (e.g. EnvelopeGate) controls playback via the 'wedding:autoplay' event instead. */
  autoplayOnMount?: boolean;
}

export function MusicButton({ src, autoplayOnMount = true }: Props): React.JSX.Element {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audioRef.current = audio;

    if (autoplayOnMount) {
      void audio.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        // browser blocked autoplay — user must tap the button
      });
    }

    // Allow other components (e.g. EnvelopeGate) to trigger play via a user-gesture-adjacent event
    function handleAutoplay() {
      void audio.play().then(() => setPlaying(true)).catch(() => {});
    }
    document.addEventListener('wedding:autoplay', handleAutoplay);

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener('wedding:autoplay', handleAutoplay);
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
      aria-label={playing ? 'Mute music' : 'Play music'}
      className={[
        'fixed bottom-7 right-7 z-[200]',
        'w-11 h-11 rounded-full border outline-none cursor-pointer',
        'flex items-center justify-center',
        'transition-colors duration-[240ms] ease-[ease]',
        playing
          ? 'bg-sage border-sage text-warm-white'
          : 'bg-warm-white border-sage text-sage hover:bg-sage hover:text-warm-white',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-sage focus-visible:outline-offset-[3px]',
      ].join(' ')}
      style={{ position: 'fixed' }}
    >
      {playing && (
        <span
          className="absolute inset-[-5px] rounded-full border border-sage pointer-events-none"
          style={{ animation: 'pulse-ring 2.4s ease-out infinite' }}
          aria-hidden="true"
        />
      )}
      {playing ? <PauseIcon /> : <NoteIcon />}
    </button>
  );
}
