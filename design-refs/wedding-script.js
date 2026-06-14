/* ─── Reduced-motion gate ─── */
const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Hero entrance sequence ─── */
function runHeroEntrance() {
  const els = [
    document.querySelector('.hero-monogram'),
    document.querySelector('.hero-rule'),
    document.querySelector('.hero-eyebrow'),
    document.querySelector('.hero-names'),
    document.querySelector('.hero-meta'),
    document.querySelector('.scroll-cue'),
  ];

  if (noMotion) return; /* CSS handles static state */

  els.forEach(el => { if (el) el.classList.add('hero-enter'); });

  const delays = [80, 400, 500, 650, 820, 1100];
  els.forEach((el, i) => {
    if (!el) return;
    setTimeout(() => el.classList.add('visible'), delays[i]);
  });
}

/* ─── Scroll reveals (IntersectionObserver) ─── */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (noMotion) {
    reveals.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ─── Stagger reveal delays for groups ─── */
function initStagger() {
  /* Detail rows */
  document.querySelectorAll('.detail-row').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${i * 100}ms`);
  });

  /* Gallery items */
  document.querySelectorAll('.gallery-item').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', `${i * 90}ms`);
  });
}

/* ─── Music button ─── */
function svgNote() {
  return `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <path d="M6 11.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM13 9.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" fill="currentColor"/>
    <path d="M6 11.5V3l7-2v8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" fill="none"/>
    <path d="M6 6l7-2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`;
}

function svgPause() {
  return `<svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
    <rect x="1" y="1" width="4" height="12" rx="1.5" fill="currentColor"/>
    <rect x="8" y="1" width="4" height="12" rx="1.5" fill="currentColor"/>
  </svg>`;
}

function initMusic() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;

  let playing = false;

  function render() {
    btn.innerHTML = playing ? svgPause() : svgNote();
    btn.setAttribute('aria-label', playing ? 'Mute music' : 'Play music');
    btn.classList.toggle('playing', playing);
  }

  btn.addEventListener('click', () => {
    playing = !playing;
    if (window.weddingMusic) {
      playing ? window.weddingMusic.play() : window.weddingMusic.pause();
    }
    render();
  });

  render();
}

/* ─── Init ─── */
document.addEventListener('DOMContentLoaded', () => {
  runHeroEntrance();
  initStagger();
  initReveal();
  initMusic();
});
