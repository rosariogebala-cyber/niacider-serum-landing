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

  // Entrada del hero. El texto ya está pintado (LCP) y solo se desplaza; los frascos
  // tampoco arrancan invisibles. La ola se "dibuja" y el resto se apoya en el podio.
  const intro = gsap.timeline({ delay: 0.1 });
  const waves = document.querySelector('.hero__waves');
  intro
    .from('[data-hero]', { y: 24, duration: 0.9, stagger: 0.06 }, 0)
    .to(waves, {
      maskPosition: '0% 0%', WebkitMaskPosition: '0% 0%', duration: 1.9, ease: 'power2.inOut',
      onComplete: () => { waves.style.maskImage = 'none'; waves.style.webkitMaskImage = 'none'; },
    }, 0)
    .from(waves, { scale: 1.08, duration: 2.6, ease: 'power2.out' }, 0)
    .to('.scene__gel', {
      maskPosition: '0% 0%', WebkitMaskPosition: '0% 0%', scale: 1, duration: 1.7, ease: 'power2.inOut',
      onComplete: () => { const g = document.querySelector('.scene__gel'); g.style.maskImage = 'none'; g.style.webkitMaskImage = 'none'; },
    }, 0.45)
    .to('.scene__floor', { opacity: 1, duration: 0.8 }, 0.3)
    .to('.scene__podium', { opacity: 1, y: 0, duration: 0.9 }, 0.3)
    .to('.scene__product', { y: 0, duration: 1, ease: 'bounce.out', stagger: 0.15 }, 0.6)
    .to('.scene__bubble', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, 1.1);


  const hero = document.querySelector('.hero');
  if (hero) {
    // Profundidad al scrollear: cada capa a su velocidad (yPercent, para no pisar la entrada).
    const range = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.7 };
    gsap.to('.scene__product', { yPercent: -10, ease: 'none', scrollTrigger: { ...range } });
    gsap.to('.scene__bubble', { yPercent: (i) => -120 - i * 40, ease: 'none', scrollTrigger: { ...range } });
  }

  // Ciclo del gel: ya abierto, se mantiene unos segundos, se esparce hasta desaparecer y vuelve a
  // aparecer. Ocurre una sola vez y termina con el gel visible (sin movimiento continuo).
  const gel = document.querySelector('.scene__gel');
  const gelImg = gel && gel.querySelector('img');
  if (gel && gelImg) {
    gsap.timeline({ delay: 5.2 })
      .to(gel, { scaleX: 1.22, scaleY: 1.08, opacity: 0, duration: 1.5, ease: 'power2.in', transformOrigin: '50% 60%' })
      .to(gelImg, { filter: 'blur(14px)', duration: 1.5, ease: 'power2.in' }, '<')
      .set(gel, { scaleX: 0.86, scaleY: 0.94, transformOrigin: '0% 60%' }, '+=1.6')
      .to(gel, { scaleX: 1, scaleY: 1, opacity: 1, duration: 1.8, ease: 'power3.out' })
      .to(gelImg, { filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }, '<');
  }

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

  // Producto: el frasco gira apenas mientras se recorre la sección (solo si la sección existe)
  if (document.querySelector('.product .product__figure img')) {
    gsap.fromTo('.product__figure img', { rotate: -5, y: 30 }, {
      rotate: 3, y: -20, ease: 'none',
      scrollTrigger: { trigger: '.product', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  gsap.fromTo('.tx__figure img', { y: 28 }, {
    y: -28, ease: 'none',
    scrollTrigger: { trigger: '.tx', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  gsap.fromTo('.tx__bg img', { yPercent: -7 }, {
    yPercent: 7, ease: 'none',
    scrollTrigger: { trigger: '.tx', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Rutina: el frasco "aterriza" en el centro del cielo
  gsap.from('.routine__bottles img', {
    y: -80, opacity: 0, duration: 1.1, ease: 'back.out(1.6)',
    scrollTrigger: { trigger: '.routine__art', start: 'top 80%', once: true },
  });

  // Recalcular posiciones cuando cargan las fuentes
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
