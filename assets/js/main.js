/* Adoo landing — motion layer (GSAP + ScrollTrigger + Lenis). */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const fmt = (v, d = 0) => v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* ---------- Demo reel: wide or vertical cut depending on the viewport ---------- */
  const video = $('#reel-video');
  const soundBtn = $('#reel-sound');
  if (video) {
    const tall = matchMedia('(max-width: 767px)').matches;
    video.poster = tall ? video.dataset.posterTall : video.dataset.posterWide;
    video.src = tall ? video.dataset.srcTall : video.dataset.srcWide;
    if (tall) { $('#reel').classList.add('tall'); $('#reel').style.maxWidth = '420px'; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {}); else video.pause();
    }, { threshold: 0.35 }).observe(video);
    soundBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) { video.currentTime = 0; video.play().catch(() => {}); }
      soundBtn.classList.toggle('on', !video.muted);
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      $('.lbl', soundBtn).textContent = video.muted ? 'Ativar som' : 'Som ativado';
    });
  }

  /* ---------- FAQ: animated open/close ---------- */
  $$('#faq details').forEach(d => {
    const summary = $('summary', d), answer = $('.answer', d);
    summary.addEventListener('click', e => {
      if (reduce || !window.gsap) return;
      e.preventDefault();
      if (d.open) {
        gsap.to(answer, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(answer, { clearProps: 'all' }); } });
        $('.chev', d).style.transform = 'rotate(0deg)';
      } else {
        d.open = true;
        gsap.fromTo(answer, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.55, ease: 'expo.out' });
      }
    });
  });

  const hideLoader = () => { const l = $('#loader'); if (l) l.remove(); };

  if (reduce || !window.gsap || !window.ScrollTrigger) { hideLoader(); root.classList.remove('motion'); return; }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.15, anchors: { offset: -72 } });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Scroll progress + hide-on-scroll header ---------- */
  gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  const header = $('header.site');
  ScrollTrigger.create({
    start: 120, end: 'max',
    onUpdate: s => header.classList.toggle('is-hidden', s.direction === 1 && s.scroll() > 400),
    onLeaveBack: () => header.classList.remove('is-hidden'),
  });

  /* ---------- Hero: initial states ---------- */
  const heroWords = $$('#hero h1 .wi');
  gsap.set(heroWords, { yPercent: 115, rotate: 7, transformOrigin: '0% 100%' });
  gsap.set('[data-hero="badge"]', { scale: 0.6, opacity: 0, filter: 'blur(10px)' });
  gsap.set('[data-hero="fade"]', { y: 34, opacity: 0, filter: 'blur(10px)' });
  gsap.set('.hero-visual', { y: 120, rotateX: 24, scale: 0.88, opacity: 0, transformPerspective: 1200 });
  gsap.set('.hero-row', { x: 40, opacity: 0 });
  gsap.set('.hero-chip', { scale: 0, opacity: 0 });
  const line = $('#spark-line'), len = line.getTotalLength();
  gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('#spark-area', { opacity: 0 });
  root.classList.remove('motion'); // states are owned by GSAP from here on

  function countUp(el, delay = 0) {
    const to = parseFloat(el.dataset.count), d = +(el.dataset.decimals || 0), o = { v: 0 };
    el.textContent = fmt(0, d);
    return gsap.to(o, { v: to, duration: 1.8, delay, ease: 'expo.out', onUpdate: () => { el.textContent = fmt(o.v, d); } });
  }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('[data-hero="badge"]', { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.8, ease: 'back.out(2)' }, 0)
      .to(heroWords, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.08 }, 0.05)
      .to('[data-hero="fade"]', { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.1 }, 0.45)
      .to('.hero-visual', { y: 0, rotateX: 0, scale: 1, opacity: 1, duration: 1.4 }, 0.25)
      .to(line, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.8)
      .to('#spark-area', { opacity: 1, duration: 1 }, 1.4)
      .to('.hero-row', { x: 0, opacity: 1, duration: 0.7, stagger: 0.12 }, 1.0)
      .to('.hero-chip', { scale: 1, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'back.out(2.2)' }, 1.3);
    $$('#hero-card [data-count]').forEach((el, i) => tl.add(countUp(el), 0.7 + i * 0.1));
  }

  /* ---------- Intro loader ---------- */
  const loader = $('#loader');
  if (loader && getComputedStyle(loader).display !== 'none') {
    try { sessionStorage.setItem('adoo-intro', '1'); } catch (e) {}
    loader.style.animation = 'none';
    const lt = gsap.timeline({ onComplete: hideLoader });
    lt.from('#loader .mark img', { scale: 0, rotate: -120, duration: 0.8, ease: 'back.out(1.8)' })
      .from('#loader .mark span', { yPercent: 120, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'expo.out' }, 0.2)
      .to('#loader .bar i', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, 0.1)
      .to('#loader .mark, #loader .bar', { scale: 1.15, opacity: 0, filter: 'blur(12px)', duration: 0.45, ease: 'power3.in' }, 1.05)
      .to('#loader .panel.top', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 1.3)
      .to('#loader .panel.bot', { yPercent: 100, duration: 0.9, ease: 'expo.inOut' }, 1.3)
      .add(heroIntro, 1.55);
  } else {
    hideLoader();
    heroIntro();
  }

  /* ---------- Hero: cursor spotlight, 3D tilt, scroll-out parallax ---------- */
  const hero = $('#hero');
  const card = $('#hero-card');
  if (finePointer) {
    const rx = gsap.quickTo(card, 'rotateX', { duration: 0.8, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotateY', { duration: 0.8, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
      hero.style.setProperty('--my', `${e.clientY - r.top}px`);
      const nx = (e.clientX / innerWidth) - 0.5, ny = (e.clientY / innerHeight) - 0.5;
      rx(-ny * 16); ry(nx * 20);
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }
  gsap.to('.hero-copy', { y: -140, opacity: 0.15, filter: 'blur(6px)', ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-visual .float', { y: -60, scale: 0.92, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    $$('.magnetic').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.45);
      });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* ---------- Spotlight cards (cursor-tracked border glow + tilt) ---------- */
  $$('.spot').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--x', `${e.clientX - r.left}px`);
      el.style.setProperty('--y', `${e.clientY - r.top}px`);
    });
  });
  if (finePointer) {
    $$('.feature-grid .spot').forEach(el => {
      const rx = gsap.quickTo(el, 'rotateX', { duration: 0.6, ease: 'power3' });
      const ry = gsap.quickTo(el, 'rotateY', { duration: 0.6, ease: 'power3' });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10); ry(((e.clientX - r.left) / r.width - 0.5) * 12);
      });
      el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- Marquee: skew with scroll velocity ---------- */
  const skewers = $$('[data-velocity-skew] .marquee-track');
  skewers.forEach(t => t.append(...[...t.children].map(n => n.cloneNode(true))));
  const skew = skewers.map(t => gsap.quickTo(t, 'skewX', { duration: 0.5, ease: 'power3' }));
  ScrollTrigger.create({ onUpdate: s => { const v = gsap.utils.clamp(-14, 14, s.getVelocity() / -250); skew.forEach(q => q(v)); } });
  ScrollTrigger.addEventListener('scrollEnd', () => skew.forEach(q => q(0)));

  /* ---------- Headings: words light up as you scroll ---------- */
  $$('[data-scrub]').forEach(h => {
    const words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map(w => `<span class="sw" style="display:inline-block">${w}</span>`).join(' ');
    gsap.fromTo($$('.sw', h), { opacity: 0.12, y: 18, filter: 'blur(6px)' }, {
      opacity: 1, y: 0, filter: 'blur(0px)', stagger: 0.12, ease: 'none',
      scrollTrigger: { trigger: h, start: 'top 88%', end: 'top 45%', scrub: 0.6 },
    });
  });

  /* ---------- Generic reveals ---------- */
  $$('[data-reveal]').forEach(el => gsap.from(el, {
    y: 40, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 90%' },
  }));

  /* ---------- Demo reel: tilted screen that straightens and grows ---------- */
  gsap.fromTo('#reel', { scale: 0.72, rotateX: 32, y: 80, borderRadius: 56, opacity: 0.4 }, {
    scale: 1, rotateX: 0, y: 0, borderRadius: 28, opacity: 1, ease: 'none',
    scrollTrigger: { trigger: '.reel-stage', start: 'top 95%', end: 'top 15%', scrub: 1 },
  });

  /* ---------- Features: cards flip up in a wave ---------- */
  gsap.from('.feature-grid > *', {
    y: 120, rotateX: -40, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%',
    duration: 1.1, ease: 'expo.out', stagger: { each: 0.1, grid: 'auto', from: 'start' },
    scrollTrigger: { trigger: '.feature-grid', start: 'top 85%' },
  });

  /* ---------- Contrast sections unfold from an inset card ---------- */
  ['#seguranca', '#planos'].forEach(sel => gsap.fromTo(sel,
    { clipPath: 'inset(6% 5% 6% 5% round 48px)' },
    { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: sel, start: 'top 95%', end: 'top 25%', scrub: true } }));

  /* ---------- Security ---------- */
  gsap.from('.sec-list li', { x: -60, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.sec-list', start: 'top 85%' } });
  gsap.from('.sec-visual', { rotateY: -35, x: 120, opacity: 0, transformPerspective: 1200, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.sec-visual', start: 'top 85%' } });
  gsap.from('.sync-row', { x: 40, opacity: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: 'expo.out', scrollTrigger: { trigger: '.sec-visual', start: 'top 85%' } });

  /* ---------- Testimonials: tossed onto the table ---------- */
  $$('.testi-grid > *').forEach((el, i) => gsap.from(el, {
    y: 140, rotate: [-8, 5, -4][i % 3], opacity: 0, duration: 1.2, delay: i * 0.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.testi-grid', start: 'top 85%' },
  }));

  /* ---------- Pricing ---------- */
  gsap.from('.price-grid > *', { y: 100, scale: 0.9, opacity: 0, duration: 1.1, stagger: 0.15, ease: 'expo.out', scrollTrigger: { trigger: '.price-grid', start: 'top 85%' } });
  $$('.price-grid [data-count]').forEach(el => ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => countUp(el, 0.3) }));

  /* ---------- FAQ ---------- */
  gsap.from('.faq-list > *', { y: 50, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: '.faq-list', start: 'top 88%' } });

  /* ---------- CTA: giant word slides, card zooms in ---------- */
  gsap.fromTo('#giant', { xPercent: 5 }, { xPercent: -45, ease: 'none', scrollTrigger: { trigger: '#download', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.cta-card', { scale: 0.8, y: 80, opacity: 0, filter: 'blur(14px)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.cta-card', start: 'top 85%' } });
  gsap.from('.cta-icon', { scale: 0, rotate: -180, duration: 1.1, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.cta-card', start: 'top 80%' } });
  gsap.from('.cta-buttons > *', { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, delay: 0.4, ease: 'expo.out', scrollTrigger: { trigger: '.cta-card', start: 'top 80%' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
