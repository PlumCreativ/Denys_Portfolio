import { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';

/* ═══════════════════════════════════════
   SLIDES DATA
═══════════════════════════════════════ */

const SLIDES = [
  {
    src:     '../img/NoteDeFrais/Menu.png',
    label:   'Menu principal',
    caption: 'Interface de navigation — accès à la saisie, l\'historique, le profil et l\'export PDF.',
  },
  {
    src:     '../img/NoteDeFrais/Formulaire_NoteDeFrais.png',
    label:   'Formulaire de saisie',
    caption: 'Saisie d\'une note de frais — catégorie, date, description, montants HT/TTC et justificatif.',
  },
  {
    src:     '../img/NoteDeFrais/Vue_PDF.png',
    label:   'Aperçu PDF',
    caption: 'Document PDF généré via dompdf — récapitulatif professionnel formaté A4, prêt à l\'impression.',
  },
  {
    src:     '../img/NoteDeFrais/MPD.jpg',
    label:   'Modèle Physique de Données',
    caption: 'MPD conçu avec la méthode Merise — tables, clés primaires, clés étrangères et contraintes d\'intégrité.',
  },
];

const AUTOPLAY_DELAY = 4500;

/* ═══════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════ */

function Carousel() {
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState(null);
  const [dir,     setDir]     = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const [paused,  setPaused]  = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((next, direction) => {
    if (next === current) return;
    setPrev(current);
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
      aria-label="Captures d'écran Note de Frais"
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

      <button
        className="cv-car-btn cv-car-btn--prev"
        onClick=${goPrev}
        aria-label="Image précédente"
      >
        <i className="bx bx-chevron-left" aria-hidden="true"></i>
      </button>
      <button
        className="cv-car-btn cv-car-btn--next"
        onClick=${goNext}
        aria-label="Image suivante"
      >
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

const el = document.getElementById('ndf-gallery');
if (el) createRoot(el).render(html`<${Carousel} />`);
