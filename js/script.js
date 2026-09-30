/* ═══════════════════════════════════════════════════
   DECOR BY PEARLS — VANILLA JS
   Scroll interactions · menus · counters · reveals
   No libraries. Slow, elegant, expensive motion.
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIO = 'IntersectionObserver' in window;

  /* ──────────────────────────────────────────────
     1 · NAVIGATION — blurred ivory on scroll
  ────────────────────────────────────────────── */
  const nav = document.getElementById('siteNav');
  const onNavScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();

  /* ──────────────────────────────────────────────
     2 · MOBILE MENU — full-screen overlay
  ────────────────────────────────────────────── */
  const burger = document.getElementById('navBurger');
  const overlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');

  function openMenu() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    menuClose.focus();
  }
  function closeMenu() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
  }
  burger.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  overlay.querySelectorAll('.menu-links a').forEach(a =>
    a.addEventListener('click', () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    })
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
  });

  /* ──────────────────────────────────────────────
     3 · HERO ENTRANCE — staggered line reveals
  ────────────────────────────────────────────── */
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => document.body.classList.add('hero-in'));
  });

  /* ──────────────────────────────────────────────
     4 · SCROLL REVEAL (.rv via IntersectionObserver)
  ────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.rv');
  if (reduceMotion || !supportsIO) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ──────────────────────────────────────────────
     5 · SIGNATURE NUMBERS — count up on scroll
  ────────────────────────────────────────────── */
  const counters = document.querySelectorAll('.count');

  function runCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);          // easeOutQuart — elegant deceleration
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!supportsIO) {
    counters.forEach(runCounter);
  } else {
    const countIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          countIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(c => countIO.observe(c));
  }

  /* ──────────────────────────────────────────────
     6 · SERVICES — hover-swapped sticky visual
  ────────────────────────────────────────────── */
  const serviceRows = document.querySelectorAll('.service-row');
  const visualImg   = document.getElementById('serviceVisualImg');
  const visualCap   = document.getElementById('serviceVisualCap');
  const visualWrap  = visualImg ? visualImg.closest('.service-visual') : null;

  if (visualImg && serviceRows.length) {
    const preloaded = {};
    const swapTo = (row) => {
      const src = row.dataset.full;
      if (!src || visualImg.src === src) return;

      serviceRows.forEach(r => r.classList.remove('is-active'));
      row.classList.add('is-active');

      // preload, then fade-swap so there is no flicker
      const apply = () => {
        visualImg.src = src;
        visualCap.textContent = row.querySelector('h3').textContent;
        visualWrap.classList.remove('is-swapping');
      };
      visualWrap.classList.add('is-swapping');
      if (preloaded[src]) { setTimeout(apply, 120); return; }
      const img = new Image();
      img.onload = () => { preloaded[src] = true; setTimeout(apply, 120); };
      img.onerror = apply;
      img.src = src;
    };

    serviceRows.forEach(row => {
      row.addEventListener('mouseenter', () => swapTo(row));
      row.addEventListener('focusin', () => swapTo(row));
      row.addEventListener('click', () => swapTo(row));
    });
    serviceRows[0].classList.add('is-active');
  }

  /* ──────────────────────────────────────────────
     7 · PROCESS — scroll-driven step switching
  ────────────────────────────────────────────── */
  const steps  = document.querySelectorAll('.pstep');
  const pvImgs = document.querySelectorAll('.pv-img');
  const pvCap  = document.getElementById('pvCap');
  const stepNames = [
    '01 — Initial Consultation',
    '02 — Concept Design',
    '03 — Vendor Curation',
    '04 — Event Execution',
    '05 — Post-Event Care'
  ];

  function setProcessStep(index) {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === index));
    pvImgs.forEach((img, i) => img.classList.toggle('is-active', i === index));
    if (pvCap) pvCap.textContent = stepNames[index];
  }

  if (steps.length && supportsIO) {
    if (reduceMotion) {
      setProcessStep(0);
    } else {
      const stepIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setProcessStep(parseInt(entry.target.dataset.step, 10));
          }
        });
      }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
      steps.forEach(s => stepIO.observe(s));
      setProcessStep(0);
    }
  } else {
    setProcessStep(0);
  }

  /* ──────────────────────────────────────────────
     8 · TESTIMONIALS — minimal fade slider
  ────────────────────────────────────────────── */
  const tstItems = document.querySelectorAll('.tst-item');
  const tstPrev  = document.getElementById('tstPrev');
  const tstNext  = document.getElementById('tstNext');
  const tstCount = document.getElementById('tstCount');
  let tstIndex = 0;
  let tstTimer = null;

  function showTst(i) {
    tstIndex = (i + tstItems.length) % tstItems.length;
    tstItems.forEach((t, k) => t.classList.toggle('is-active', k === tstIndex));
    if (tstCount) tstCount.textContent = (tstIndex + 1) + ' / ' + tstItems.length;
  }
  function autoTst() {
    if (reduceMotion || !tstItems.length) return;
    clearInterval(tstTimer);
    tstTimer = setInterval(() => showTst(tstIndex + 1), 8000);
  }
  if (tstItems.length) {
    tstPrev.addEventListener('click', () => { showTst(tstIndex - 1); autoTst(); });
    tstNext.addEventListener('click', () => { showTst(tstIndex + 1); autoTst(); });
    showTst(0);
    autoTst();
  }

  /* ──────────────────────────────────────────────
     9 · SCROLLSPY — active nav link
  ────────────────────────────────────────────── */
  const navAnchors = document.querySelectorAll('.nav-links a');
  const spySections = ['about', 'services', 'experiences', 'work', 'destinations', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (supportsIO && spySections.length) {
    const spyIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-38% 0px -56% 0px' });
    spySections.forEach(s => spyIO.observe(s));
  }

  /* ──────────────────────────────────────────────
     10 · HERO PARALLAX — gentle image drift on scroll
  ────────────────────────────────────────────── */
  if (!reduceMotion) {
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      let ticking = false;
      const parallax = () => {
        const y = Math.min(window.scrollY * 0.22, 260);
        heroImg.style.transform = 'scale(1.04) translateY(' + y + 'px)';
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking && window.scrollY < window.innerHeight * 1.2) {
          requestAnimationFrame(parallax);
          ticking = true;
        }
      }, { passive: true });
    }
  }

  /* ──────────────────────────────────────────────
     11 · FOOTER YEAR
  ────────────────────────────────────────────── */
  const yearEl = document.getElementById('yearNow');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
