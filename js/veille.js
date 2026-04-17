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

// ── 3. TOC ACTIVE LINK ──────────────────────────────────────
const tocLinks = document.querySelectorAll('.vp-toc-link');

if (tocLinks.length) {
    const sectionIds = [...tocLinks].map(a => a.getAttribute('href').slice(1));
    const sections   = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

    const tocObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            tocLinks.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === '#' + id);
            });
        });
    }, { rootMargin: '-15% 0px -75% 0px', threshold: 0 });

    sections.forEach(s => tocObserver.observe(s));
}
