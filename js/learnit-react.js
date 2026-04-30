import { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';

/* ═══════════════════════════════════════
   SLIDES DATA
═══════════════════════════════════════ */

const SLIDES = [
  {
    src:     '../img/LearnIt/Connexion.png',
    label:   'Connexion',
    caption: 'Écran de connexion — authentification multi-rôles (Étudiant, Formateur, Administrateur) en mode console.',
  },
  {
    src:     '../img/LearnIt/Module.png',
    label:   'Gestion des modules',
    caption: 'Interface de gestion des modules — création, structuration et suivi des contenus pédagogiques.',
  },
  {
    src:     '../img/LearnIt/LearnIt_MPD.jpg',
    label:   'Modèle Physique de Données',
    caption: 'MPD complet — modélisation Merise avec toutes les relations, contraintes et clés étrangères MySQL.',
  },
];

const AUTOPLAY_DELAY = 4500;

/* ═══════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════ */

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [dir,     setDir]     = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((next, direction) => {
    if (next === current) return;
    setDir(direction);
    setCurrent(next);
    setAnimKey(k => k + 1);
  }, [current]);

  const goNext = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1);
  }, [current, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_DELAY);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, goNext]);

  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [goNext, goPrev]);

  const slide = SLIDES[current];

  return html`
    <div
      className="cv-carousel"
      onMouseEnter=${() => setPaused(true)}
      onMouseLeave=${() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Captures d'écran LearnIt"
    >
      <div className="cv-carousel-stage" aria-live="polite">
        <img
          key=${animKey}
          className=${'cv-carousel-img cv-carousel-img--' + (dir > 0 ? 'next' : 'prev')}
          src=${slide.src}
          alt=${slide.label}
          loading="eager"
        />
      </div>

      <button className="cv-car-btn cv-car-btn--prev" onClick=${goPrev} aria-label="Image précédente">
        <i className="bx bx-chevron-left" aria-hidden="true"></i>
      </button>
      <button className="cv-car-btn cv-car-btn--next" onClick=${goNext} aria-label="Image suivante">
        <i className="bx bx-chevron-right" aria-hidden="true"></i>
      </button>

      <div className="cv-car-caption">
        <span className="cv-car-label">${slide.label}</span>
        <span className="cv-car-text">${slide.caption}</span>
        <span className="cv-car-counter">${current + 1} / ${SLIDES.length}</span>
      </div>

      <div className="cv-car-dots" role="tablist">
        ${SLIDES.map((s, i) => html`
          <button
            key=${i}
            role="tab"
            aria-selected=${i === current}
            aria-label=${'Capture ' + (i + 1) + ' : ' + s.label}
            className=${'cv-car-dot' + (i === current ? ' cv-car-dot--active' : '')}
            onClick=${() => goTo(i, i > current ? 1 : -1)}
          ></button>
        `)}
      </div>

      <div
        className=${'cv-car-progress' + (paused ? ' cv-car-progress--paused' : '')}
        key=${'p' + animKey}
        style=${{ '--dur': AUTOPLAY_DELAY + 'ms' }}
      ></div>
    </div>
  `;
}

/* ═══════════════════════════════════════
   MOUNT
═══════════════════════════════════════ */

const el = document.getElementById('learnit-gallery');
if (el) createRoot(el).render(html`<${Carousel} />`);
