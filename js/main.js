/**
 * Main — scroll observer, TOC, navigation
 */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initTOC();
  initSmoothScroll();
});

/* ---- Scroll Reveal (IntersectionObserver) ---- */
function initScrollReveal() {
  const reveals = document.querySelectorAll(
    '.reveal, .reveal-stagger, .benchmark-card, .benchmark-bar, .timeline, .section__header'
  );

  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Don't unobserve — allows re-entry if we want
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ---- Table of Contents active tracking ---- */
function initTOC() {
  const tocLinks = document.querySelectorAll('.toc__link');
  const sections = [];

  tocLinks.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    const section = id && document.getElementById(id);
    if (section) sections.push({ el: section, link });
  });

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const match = sections.find((s) => s.el === entry.target);
        if (match) {
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove('active'));
            match.link.classList.add('active');
          }
        }
      });
    },
    { threshold: 0.2, rootMargin: '-80px 0px -50% 0px' }
  );

  sections.forEach((s) => observer.observe(s.el));
}

/* ---- Smooth scroll for anchor links ---- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80; // header height
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });
}
