/* wedding-music.js — Procedural ambient music via Web Audio API
   I-vi-IV-V in C major, soft sine arpeggios, loops forever.           */
(function () {
  'use strict';

  let ctx, master;
  let running = false, loopTimer;

  /* Chord tones: [bass, mid-low, mid, high] */
  const PROG = [
    [130.81, 196.00, 261.63, 329.63],   /* C  maj */
    [110.00, 164.81, 220.00, 329.63],   /* A  min */
    [ 87.31, 130.81, 174.61, 261.63],   /* F  maj */
    [ 98.00, 146.83, 196.00, 293.66],   /* G  maj */
  ];
  const BAR  = 4.5;   /* seconds per chord */
  const STEP = 0.58;  /* seconds between arpeggio notes */

  function init() {
    if (ctx) return;
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }

  function tone(freq, t0, dur, vol) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const atk = Math.min(0.4, dur * 0.2);
    const rel = Math.min(0.9, dur * 0.4);
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(vol,       t0 + atk);
    env.gain.setValueAtTime(vol * 0.75,         t0 + dur - rel);
    env.gain.linearRampToValueAtTime(0,         t0 + dur);
    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function scheduleLoop() {
    if (!running) return;
    const now = ctx.currentTime;
    PROG.forEach(function (chord, i) {
      var cs = now + i * BAR;
      tone(chord[0], cs, BAR + 0.9, 0.09);                          /* sustained bass */
      chord.slice(1).forEach(function (f, j) {
        tone(f, cs + j * STEP, BAR - j * STEP, 0.055);              /* arpeggio        */
      });
    });
    loopTimer = setTimeout(scheduleLoop, (PROG.length * BAR - 0.5) * 1000);
  }

  window.weddingMusic = {
    play: function () {
      init();
      if (ctx.state === 'suspended') ctx.resume();
      if (!running) { running = true; scheduleLoop(); }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.30, ctx.currentTime + 1.5);
    },
    pause: function () {
      if (!ctx) return;
      running = false;
      clearTimeout(loopTimer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
    },
  };
}());
