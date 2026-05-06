import { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { html } from 'htm/react';

/* ═══════════════════════════════════════
   SLIDES DATA — 4 desktop + 4 mobile
═══════════════════════════════════════ */

const SLIDES = [
  {
    src:     '../img/MediaStock/Screenshot_20260416-172823.png',
    label:   'Inventaire mobile',
    caption: 'Vue mobile de l\'inventaire — liste du matériel avec statut de disponibilité et accès rapide.',
    mobile:  true,
  },
  {
    src:     '../img/MediaStock/859E7B4C-3569-4E3E-BCAA-5734A8451720.png',
    label:   'Interface principale',
    caption: 'Dashboard principal — inventaire complet avec filtrage par catégorie, état et disponibilité.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/Screenshot_20260416-172936.png',
    label:   'Scan QR Code',
    caption: 'Scan QR Code via caméra smartphone — identification instantanée du matériel pour enregistrer un prêt.',
    mobile:  true,
  },
  {
    src:     '../img/MediaStock/BB545E79-7AEF-48C3-AE68-DFE104D85CBC.png',
    label:   'Liste & filtres',
    caption: 'Tableau de l\'inventaire avec filtres dynamiques — recherche par nom, catégorie et statut de prêt.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/Screenshot_20260416-172949.png',
    label:   'Enregistrement prêt',
    caption: 'Formulaire d\'enregistrement de prêt — saisie de l\'emprunteur, date de retour et validation.',
    mobile:  true,
  },
  {
    src:     '../img/MediaStock/D6D7CCE8-129F-44C9-BB85-4B6EFC24F9BC.png',
    label:   'Fiche matériel',
    caption: 'Fiche détaillée d\'un matériel — état, historique des prêts, QR code imprimable et actions CRUD.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/Screenshot_20260416-173128.png',
    label:   'Détail mobile',
    caption: 'Vue détail sur mobile — accès à l\'historique, au QR code et aux actions depuis smartphone.',
    mobile:  true,
  },
  {
    src:     '../img/MediaStock/D75E5111-FC3E-4C3A-8112-112F8C3970D2.png',
    label:   'Gestion des prêts',
    caption: 'Interface de gestion des prêts actifs — liste des emprunts en cours, retours et clôture automatique.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/MPD.jpg',
    label:   'Modèle Physique de Données',
    caption: 'MPD conçu avec la méthode Merise — tables, clés primaires, clés étrangères et contraintes CASCADE.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/PHOTO-2025-11-12-14-57-40.jpg',
    label:   'Backlog projet (1/2)',
    caption: 'Backlog de gestion de projet — phases 1 & 2 : Préparation, Conception, Développement & Intégration avec priorités MoSCoW.',
    mobile:  false,
  },
  {
    src:     '../img/MediaStock/PHOTO-2025-11-12-14-57-40 2.jpg',
    label:   'Backlog projet (2/2)',
    caption: 'Backlog de gestion de projet — phases 3 & 4 : Tests, Mise en Production et Finalisation.',
    mobile:  false,
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

  // Autoplay
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(goNext, AUTOPLAY_DELAY);
    return () => clearTimeout(t);
  }, [current, paused, goNext]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [goNext, goPrev]);

  const slide = SLIDES[current];

  return html`
    <div
      className=${'cv-carousel' + (slide.mobile ? ' cv-carousel--mobile' : '')}
      onMouseEnter=${() => setPaused(true)}
      onMouseLeave=${() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Captures d'écran MediaStock"
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

      <!-- Badge mobile/desktop -->
      <span className=${'ms-slide-badge' + (slide.mobile ? ' ms-slide-badge--mobile' : ' ms-slide-badge--desktop')}>
        <i className=${'bx ' + (slide.mobile ? 'bx-mobile-alt' : 'bx-desktop')} aria-hidden="true"></i>
        ${slide.mobile ? 'Mobile' : 'Desktop'}
      </span>

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

const el = document.getElementById('ms-gallery');
if (el) createRoot(el).render(html`<${Carousel} />`);
