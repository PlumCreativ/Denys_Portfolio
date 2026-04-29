/**
 * Typewriter — machine à écrire en boucle infinie
 * Cible : .home-content .text-animate h3
 */
(function () {
  'use strict';

  /* ── Config ── */
  const TEXTS        = ['Spécialiste Odoo', 'Concepteur logiciel', 'Développeur web'];
  const TYPE_SPEED   = 85;   // ms par caractère à l'écriture
  const ERASE_SPEED  = 45;   // ms par caractère à l'effacement
  const PAUSE_TYPED  = 4800; // ms d'attente texte complet
  const PAUSE_ERASED = 350;  // ms d'attente avant texte suivant
  const START_DELAY  = 1000; // ms avant le premier caractère (laisse le temps aux animations CSS d'entrée)

  /* ── Cibler le h3 ── */
  const h3 = document.querySelector('.home-content .text-animate h3');
  if (!h3) return;

  /* ── Injecter les spans (texte + curseur) ── */
  h3.innerHTML = '<span class="tw-text"></span><span class="tw-cursor" aria-hidden="true"></span>';
  const textSpan = h3.querySelector('.tw-text');

  /* ── État ── */
  let textIndex = 0;
  let charIndex  = 0;
  let isErasing  = false;
  let timer      = null;

  /* ── Boucle principale ── */
  function tick() {
    const current = TEXTS[textIndex];

    if (!isErasing) {
      /* Écriture */
      charIndex++;
      textSpan.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        /* Texte complet : déclencher le remplissage, puis attendre */
        h3.classList.add('tw-filled');
        timer = setTimeout(() => {
          /* Supprimer le remplissage sans transition */
          h3.style.transition = 'none';
          h3.classList.remove('tw-filled');
          /* Forcer le reflow avant de rétablir la transition */
          void h3.offsetHeight;
          h3.style.transition = '';

          isErasing = true;
          tick();
        }, PAUSE_TYPED);
        return;
      }
      timer = setTimeout(tick, TYPE_SPEED);

    } else {
      /* Effacement */
      charIndex--;
      textSpan.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        /* Texte effacé : passer au suivant */
        isErasing  = false;
        textIndex  = (textIndex + 1) % TEXTS.length;
        timer = setTimeout(tick, PAUSE_ERASED);
        return;
      }
      timer = setTimeout(tick, ERASE_SPEED);
    }
  }

  /* ── Démarrage différé ── */
  setTimeout(tick, START_DELAY);
})();
