/**
 * NIACIDER Serum · Landing
 * - Header: estado al hacer scroll, cierre del menú mobile y etiquetas accesibles.
 * - Navegación: aria-current según la sección visible.
 * - Motion: GSAP + ScrollTrigger (solo si el usuario no pidió menos movimiento).
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const header = document.getElementById('site-header');
  const menu = document.getElementById('menu-principal');
  const toggler = document.querySelector('.site-header__toggler');
  const mqDesktop = window.matchMedia('(min-width: 992px)');

  /* ---------- Año del footer ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Header con fondo al scrollear ---------- */
  let ticking = false;
  const updateHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
  updateHeader();

  /* ---------- Menú mobile (Bootstrap Collapse) ---------- */
  if (menu && toggler) {
    menu.addEventListener('show.bs.collapse', () => {
      header.classList.add('is-open');
      toggler.setAttribute('aria-label', 'Cerrar menú');
    });
    menu.addEventListener('hidden.bs.collapse', () => {
      header.classList.remove('is-open');
      toggler.setAttribute('aria-label', 'Abrir menú');
    });

    const closeMenu = () => {
      if (!mqDesktop.matches && menu.classList.contains('show') && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
      }
    };
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    // Escape cierra el menú y devuelve el foco al botón
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('show')) {
        closeMenu();
        toggler.focus();
      }
    });
  }

  /* ---------- Enlaces internos: mover el foco al destino ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      window.setTimeout(() => target.focus({ preventScroll: true }), 0);
    });
  });

  /* ---------- Sección activa en la navegación ---------- */
  const navLinks = [...document.querySelectorAll('.site-nav .nav-link')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => spy.observe(section));
  }

  /* ---------- Tabs de la fórmula: orientación según viewport ---------- */
  const tabList = document.getElementById('formula-tabs');
  const syncOrientation = () => {
    if (tabList) tabList.setAttribute('aria-orientation', mqDesktop.matches ? 'vertical' : 'horizontal');
  };
  syncOrientation();
  mqDesktop.addEventListener('change', syncOrientation);

  /* ---------- Motion ---------- */
  const motionOk = root.classList.contains('motion-ok');
  const { gsap, ScrollTrigger } = window;

  if (!motionOk) return;
  if (!gsap || !ScrollTrigger) {
    // Sin GSAP: mostrar todo de inmediato.
    root.classList.remove('motion-ok');
    return;
  }

  root.classList.add('gsap-ready');
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });

  // Entrada del hero (el frasco no arranca en opacity 0 para no demorar el LCP)
  const intro = gsap.timeline();
  intro
    .fromTo('[data-hero]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 })
    .from('[data-hero-bottle]', { y: 60, rotate: -6, duration: 1.3, ease: 'expo.out' }, 0)
    .from('.hero__ghost', { scale: 0.85, opacity: 0, duration: 1.4, ease: 'expo.out' }, 0.1);

  // Parallax suave del "10%" y del frasco
  gsap.to('[data-parallax]', {
    yPercent: -30, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  gsap.to('[data-hero-bottle]', {
    yPercent: 12, rotate: 4, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Reveal genérico por bloque.
  // Solo se anima opacity/transform (nunca visibility): el contenido sigue en el
  // orden de tabulación y en el árbol de accesibilidad antes de aparecer.
  const revealTweens = new Map();
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const isImage = el.dataset.reveal === 'image';
    const tween = gsap.fromTo(el,
      isImage ? { opacity: 0, clipPath: 'inset(18% 0% 0% 0%)', y: 40 } : { opacity: 0, y: 36 },
      {
        opacity: 1, y: 0,
        ...(isImage ? { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' } : {}),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    revealTweens.set(el, tween);
  });

  // Si el foco del teclado llega a un bloque que aún no apareció, se muestra al instante.
  document.addEventListener('focusin', (event) => {
    const block = event.target.closest('[data-reveal]');
    const tween = block && revealTweens.get(block);
    if (tween && tween.progress() < 1) {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.progress(1);
    }
  });

  // Producto: el frasco gira apenas mientras se recorre la sección
  gsap.fromTo('.product__figure img', { rotate: -5, y: 30 }, {
    rotate: 3, y: -20, ease: 'none',
    scrollTrigger: { trigger: '.product', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Rutina: el frasco "aterriza" en el centro del cielo
  gsap.from('.routine__bottle', {
    y: -80, opacity: 0, duration: 1.1, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.routine__art', start: 'top 80%', once: true },
  });

  // Recalcular posiciones cuando cargan las fuentes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
