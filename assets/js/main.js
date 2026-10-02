/* Adoo landing — vídeo da demo e entrada suave das seções. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Demo: corte horizontal ou vertical conforme a tela ---------- */
  const video = $('#reel-video');
  const soundBtn = $('#reel-sound');
  if (video) {
    const tall = matchMedia('(max-width: 767px)').matches;
    video.poster = tall ? video.dataset.posterTall : video.dataset.posterWide;
    video.src = tall ? video.dataset.srcTall : video.dataset.srcWide;
    if (tall) { $('#reel').classList.add('tall'); $('#reel').style.maxWidth = '420px'; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !reduce) video.play().catch(() => {}); else video.pause();
    }, { threshold: 0.35 }).observe(video);
    soundBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted) { video.currentTime = 0; video.play().catch(() => {}); }
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      $('.lbl', soundBtn).textContent = video.muted ? 'Ativar som' : 'Som ativado';
    });
  }

  /* ---------- Seções aparecem com um fade curto ---------- */
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();
