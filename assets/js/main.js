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

  /* ---------- Cenas dos mockups ----------
     O HTML já traz o estado final (é o que aparece sem JS ou com menos movimento).
     Cada cena reinicia esse estado, anima e repete enquanto estiver na tela. */
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const brl = v => 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const countTo = (el, from, to, ms = 700) => new Promise(done => {
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = brl(from + (to - from) * e);
      k < 1 ? requestAnimationFrame(step) : done();
    };
    requestAnimationFrame(step);
  });

  function scene(id, play) {
    const box = document.getElementById(id);
    if (!box || reduce || !('IntersectionObserver' in window)) return;
    const el = name => box.querySelector(`[data-el="${name}"]`);
    let visible = false, running = false;
    const loop = async () => {
      if (running) return;
      running = true;
      while (visible) { await play(el); await sleep(2600); }
      running = false;
    };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); }, { threshold: 0.5 }).observe(box);
  }

  // Hero: digita o valor como num app de banco, escolhe a categoria, salva e o total do mês sobe.
  scene('scene-entry', async el => {
    const value = el('value'), chip = el('chip'), save = el('save'), toast = el('toast'), total = el('total');
    const typer = value.parentElement;
    value.textContent = brl(0); chip.classList.remove('on'); save.classList.add('idle');
    toast.classList.add('off'); total.textContent = brl(+total.dataset.from);
    await sleep(700);
    typer.classList.add('typing');
    let cents = '';
    for (const d of '3290') { cents += d; value.textContent = brl(+cents / 100); await sleep(260); }
    typer.classList.remove('typing');
    await sleep(400);
    chip.classList.add('on');
    await sleep(500);
    save.classList.remove('idle');
    await sleep(350);
    save.classList.add('down'); await sleep(160); save.classList.remove('down');
    toast.classList.remove('off');
    await countTo(total, +total.dataset.from, +total.dataset.to);
    await sleep(1800);
  });

  // Notificação do banco vira lançamento para confirmar; depois um CSV é importado.
  scene('scene-auto', async el => {
    const notif = el('notif'), draft = el('draft'), confirm = el('confirm'), csv = el('csv'), bar = el('csvbar'), txt = el('csvtxt');
    [notif, draft, csv].forEach(n => n.classList.add('off'));
    confirm.textContent = 'Confirmar'; bar.classList.add('off'); txt.textContent = 'Importando…';
    await sleep(600);
    notif.classList.remove('off');
    await sleep(1300);
    draft.classList.remove('off');
    await sleep(1200);
    confirm.classList.add('down'); await sleep(160); confirm.classList.remove('down');
    confirm.textContent = '✓ Salvo';
    await sleep(1100);
    csv.classList.remove('off');
    await sleep(450);
    bar.classList.remove('off');
    await sleep(1450);
    txt.textContent = '38 lançamentos';
    await sleep(1600);
  });

  // Conta do casal: o gasto da Ana aparece na hora e o total da casa atualiza; depois ela sinaliza um lançamento.
  scene('scene-couple', async el => {
    const row = el('newrow'), inner = el('newrow-inner'), flag = el('flag'), total = el('total');
    row.classList.add('off'); flag.classList.add('off'); inner.classList.remove('flash');
    total.textContent = brl(+total.dataset.from);
    await sleep(1000);
    row.classList.remove('off');
    void inner.offsetWidth; inner.classList.add('flash');
    await countTo(total, +total.dataset.from, +total.dataset.to);
    await sleep(1500);
    flag.classList.remove('off');
    await sleep(2400);
  });

  /* ---------- Seções aparecem com um fade curto ---------- */
  const items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach(el => io.observe(el));
})();
