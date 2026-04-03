/* ============================================================
   veille.js — Scroll reveal + animated counters
   Denys Portfolio — Veille Informatique page
   ============================================================ */

// ── 1. SCROLL REVEAL ────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add('visible');

        // Trigger reveal-child elements inside
        el.querySelectorAll('.reveal-child').forEach(child => {
            child.classList.add('visible');
        });

        revealObserver.unobserve(el);
    });
}, {
    rootMargin: '-8% 0px -8% 0px',
    threshold: 0.05
});

document.querySelectorAll('.reveal, .reveal-child').forEach(el => {
    revealObserver.observe(el);
});

// ── 2. ANIMATED COUNTERS ────────────────────────────────────
function animateCounter(el, target, duration = 1400) {
    let start = null;
    const from = 0;

    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (target - from) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) animateCounter(el, target);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.4 });

document.querySelectorAll('.vp-metric-value[data-target]').forEach(el => {
    counterObserver.observe(el);
});
