import { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';

/* ═══════════════════════════════════════
   SCREENSHOTS DATA
═══════════════════════════════════════ */

const SLIDES = [
  {
    src:     '../img/CryptoVault/coffreFort.png',
    label:   'Tableau de bord',
    caption: 'Interface principale — liste des fichiers chiffrés, barre de quota et arborescence de dossiers.',
  },
  {
    src:     '../img/CryptoVault/menu_coffrefort.png',
    label:   'Menu & Navigation',
    caption: 'Menu de navigation latéral — accès aux dossiers, actions rapides et panneau de paramètres.',
  },
  {
    src:     '../img/CryptoVault/choix_fichier_coffrefort.png',
    label:   'Upload de fichier',
    caption: 'Dialogue de sélection et upload — barre de progression en temps réel, support des fichiers volumineux.',
  },
  {
    src:     '../img/CryptoVault/choix_quotas_coffrefort.png',
    label:   'Gestion des quotas',
    caption: 'Panneau d\'administration — ajustement des quotas par utilisateur avec alertes visuelles à 80 % et 90 %.',
  },
  {
    src:     '../img/CryptoVault/19FB025E-BE13-4D23-B86F-92B838296B5D.png',
    label:   'Gestion des versions',
    caption: 'Historique de versions — checksum SHA-256, date d\'upload, téléchargement sélectif de n\'importe quelle révision.',
  },
  {
    src:     '../img/CryptoVault/D77FB0F3-6042-4420-A874-D0FD3D605A53.png',
    label:   'Partage sécurisé',
    caption: 'Interface de partage — génération de tokens base64url signés avec expiration, limitation d\'usages et révocation.',
  },
];

const AUTOPLAY_DELAY = 4500;

/* ═══════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════ */

function Carousel() {
  const [current, setCurrent]   = useState(0);
  const [prev,    setPrev]      = useState(null);   // index leaving
  const [dir,     setDir]       = useState(1);      // +1 = forward, -1 = backward
  const [animKey, setAnimKey]   = useState(0);      // forces re-trigger
  const [paused,  setPaused]    = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((next, direction) => {
    if (next === current) return;
    setPrev(current);
    setDir(direction);
    setCurrent(next);
    setAnimKey(k => k + 1);
  }, [current]);

  const goNext = useCallback(() => {
    const next = (current + 1) % SLIDES.length;
    goTo(next, 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    const next = (current - 1 + SLIDES.length) % SLIDES.length;
    goTo(next, -1);
  }, [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(goNext, AUTOPLAY_DELAY);
    return () => clearTimeout(timerRef.current);
  }, [current, paused, goNext]);

  // Keyboard
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
      aria-label="Captures d'écran CryptoVault"
    >
      <!-- Slide area -->
      <div className="cv-carousel-stage" aria-live="polite">
        <img
          key=${animKey}
          className=${'cv-carousel-img cv-carousel-img--' + (dir > 0 ? 'next' : 'prev')}
          src=${slide.src}
          alt=${slide.label}
          loading="eager"
        />
      </div>

      <!-- Prev / Next -->
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

      <!-- Caption bar -->
      <div className="cv-car-caption">
        <span className="cv-car-label">${slide.label}</span>
        <span className="cv-car-text">${slide.caption}</span>
        <span className="cv-car-counter">${current + 1} / ${SLIDES.length}</span>
      </div>

      <!-- Dot indicators -->
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

      <!-- Progress bar -->
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

const el = document.getElementById('cv-gallery');
if (el) createRoot(el).render(html`<${Carousel} />`);
