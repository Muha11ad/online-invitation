'use client';

import { useEffect, useRef, useState } from 'react';

/* Procedural ambient music via Web Audio API — I-vi-IV-V in C major */
const PROG: readonly [number, number, number, number][] = [
  [130.81, 196.0, 261.63, 329.63],
  [110.0, 164.81, 220.0, 329.63],
  [87.31, 130.81, 174.61, 261.63],
  [98.0, 146.83, 196.0, 293.66],
];
const BAR = 4.5;
const STEP = 0.58;

function NoteIcon(): React.JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M6 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM13 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
        fill="currentColor"
      />
      <path
        d="M6 11.5V3l7-2v8.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M6 6l7-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PauseIcon(): React.JSX.Element {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="4" height="12" rx="1.5" fill="currentColor" />
      <rect x="8" y="1" width="4" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function MusicButton(): React.JSX.Element {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const runningRef = useRef(false);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function init(): void {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
  }

  function tone(freq: number, t0: number, dur: number, vol: number): void {
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const atk = Math.min(0.4, dur * 0.2);
    const rel = Math.min(0.9, dur * 0.4);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vol, t0 + atk);
    env.gain.setValueAtTime(vol * 0.75, t0 + dur - rel);
    env.gain.linearRampToValueAtTime(0, t0 + dur);
    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function scheduleLoop(): void {
    if (!runningRef.current || !ctxRef.current) return;
    const now = ctxRef.current.currentTime;
    PROG.forEach((chord, i) => {
      const cs = now + i * BAR;
      tone(chord[0], cs, BAR + 0.9, 0.09);
      chord.slice(1).forEach((f, j) => {
        tone(f, cs + j * STEP, BAR - j * STEP, 0.055);
      });
    });
    loopTimerRef.current = setTimeout(scheduleLoop, (PROG.length * BAR - 0.5) * 1000);
  }

  function startMusic(): void {
    init();
    const ctx = ctxRef.current!;
    const master = masterRef.current!;
    if (ctx.state === 'suspended') void ctx.resume();
    if (!runningRef.current) {
      runningRef.current = true;
      scheduleLoop();
    }
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1.5);
  }

  function stopMusic(): void {
    if (!ctxRef.current || !masterRef.current) return;
    runningRef.current = false;
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    const ctx = ctxRef.current;
    const master = masterRef.current;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  }

  useEffect(() => {
    return () => {
      stopMusic();
      ctxRef.current?.close();
    };
  }, []);

  function handleClick(): void {
    if (playing) {
      stopMusic();
    } else {
      startMusic();
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
