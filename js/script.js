/* ============================================================
   script.js — Denys Portfolio
   Scroll animations via IntersectionObserver (modern & reliable)
   ============================================================ */

// ── 1. MOBILE MENU ──────────────────────────────────────────
const menuIcon = document.querySelector('#menu-icon');
const navbar   = document.querySelector('.navbar');

menuIcon.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('active');
    menuIcon.classList.toggle('bx-x', isOpen);
    menuIcon.setAttribute('aria-expanded', isOpen);
});

// ── 2. STICKY HEADER + CLOSE MENU ON SCROLL ─────────────────
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    header.classList.toggle('sticky', window.scrollY > 100);

    // Close mobile menu when user scrolls
    if (navbar.classList.contains('active')) {
        navbar.classList.remove('active');
        menuIcon.classList.remove('bx-x');
        menuIcon.setAttribute('aria-expanded', 'false');
    }
}, { passive: true });

// ── 3. SECTION REVEAL + NAV HIGHLIGHT ───────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('header nav a');

// Trigger home animation immediately (no observer delay, avoids overlay flash)
const homeSection = document.querySelector('section.home');
if (homeSection) homeSection.classList.add('show-animate');

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const sec = entry.target;

        if (entry.isIntersecting) {
            sec.classList.add('show-animate');

            // Highlight matching nav link
            const id = sec.getAttribute('id');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        } else {
            // Home keeps show-animate (initial page-load reveal animation)
            if (!sec.classList.contains('home')) {
                sec.classList.remove('show-animate');
            }
        }
    });
}, {
    // Section considered visible when 15% inside the viewport
    rootMargin: '-15% 0px -15% 0px',
    threshold: 0
});

sections.forEach(sec => sectionObserver.observe(sec));

// ── 4. FOOTER ANIMATION ─────────────────────────────────────
const footer = document.querySelector('footer');

if (footer) {
    const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            footer.classList.toggle('show-animate', entry.isIntersecting);
        });
    }, {
        // Trigger as soon as 20% of the footer enters the viewport
        threshold: 0.2
    });

    footerObserver.observe(footer);
}
