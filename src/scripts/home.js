/* Home page only: preloader, hero, section reveals, scroll strips. */
import { gsap, ScrollTrigger, FINE, REDUCE, lenis, scrollToTarget } from './core.js';

/* ── Side-dot active on scroll ── */
['#hero','#about','#education','#skills','#projects','#certs'].forEach((id, i) => {
  ScrollTrigger.create({
    trigger: id, start: 'top 55%', end: 'bottom 55%',
    onEnter:     () => activeDot(i),
    onEnterBack: () => activeDot(i),
  });
});
const navAnchors = document.querySelectorAll('.n-links a');
function activeDot(i) {
  document.querySelectorAll('.snd').forEach((d, j) => d.classList.toggle('act', j === i));
  /* nav links skip #hero, so they're offset by one */
  navAnchors.forEach((a, j) => a.classList.toggle('act', j === i - 1));
}

/* ── Scramble ── */
function scramble(el, delay) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const orig = el.textContent;
  let frame = 0;
  setTimeout(() => {
    const id = setInterval(() => {
      el.textContent = orig.split('').map((c, i) => {
        if (c === ' ') return ' ';
        return i < (frame / 24) * orig.length ? c : chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (++frame > 24) { clearInterval(id); el.textContent = orig; }
    }, 36);
  }, delay || 0);
}

/* ── Preloader (once per visit — coming back from a project page skips it) ── */
let seen = false;
try { seen = sessionStorage.getItem('ikm-pl') === '1'; sessionStorage.setItem('ikm-pl', '1'); } catch (e) {}
/* arriving at /#projects from another page: land on the section once the hero is ready */
const jumpToHash = () => {
  const el = location.hash && document.querySelector(location.hash);
  if (el) requestAnimationFrame(() => scrollToTarget(el));
};
if (REDUCE) {
  gsap.set('#preloader', { display: 'none' });
  heroEntrance().progress(1);
  jumpToHash();
} else if (seen) {
  gsap.set('#preloader', { display: 'none' });
  heroEntrance();
  jumpToHash();
} else {
  document.body.style.overflow = 'hidden';
  if (lenis) lenis.stop();

  /* gentle float while bar loads */
  const plFloat = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut' } });
  plFloat
    .to('#plI', { y: -10, duration: 1.9 }, 0)
    .to('#plK', { y: -15, duration: 2.3 }, 0.4)
    .to('#plM', { y: -10, duration: 1.7 }, 0.75);

  gsap.timeline({
    onComplete() { document.body.style.overflow = ''; if (lenis) lenis.start(); heroEntrance(); jumpToHash(); }
  })
  .to('#plFill', { width: '100%', duration: 1.15, ease: 'power2.inOut' })
  .call(() => { plFloat.kill(); })
  .to('.pl-inner', { opacity: 0, y: -18, duration: 0.55, ease: 'power2.inOut' }, '+=0.15')
  .to('#preloader', { opacity: 0, duration: 0.45, ease: 'power2.in' }, '+=0.05')
  .set('#preloader', { display: 'none' });
}

/* ── HERO entrance (fires after preloader) ── */
function heroEntrance() {
  return gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo('#hPhoto',     { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0)
    .from('.h-photo img',  { scale: 1.18, duration: 2.2, ease: 'power3.out' }, .1)
    .from('#nav',          { y: -42, opacity: 0, duration: .85 }, 0)
    .from('#snav',         { opacity: 0, x: 12, duration: .7 }, .4)
    .from('.h-avail',      { y: 14, opacity: 0, duration: .9 }, .2)
    .from('.h-hello-i',    { yPercent: 115, duration: .9 }, .3)
    .from('.h-fill-i',     { yPercent: 108, duration: 1.1 }, .44)
    .from('.h-stroke-i',   { yPercent: -108, duration: 1.1 }, .54)
    .from('.h-sub-name-i', { yPercent: 130, duration: .85 }, .64)
    .to('.h-rule',         { scaleX: 1, duration: .95, ease: 'power3.inOut' }, .85)
    .from('.h-subtitle',   { opacity: 0, y: 16, duration: .7 }, 1.0)
    .from('.h-tag',        { opacity: 0, y: 10, stagger: .06, duration: .5 }, 1.05)
    .from('.h-vert',       { opacity: 0, y: 14, duration: .6 }, .5)
    .from('.h-scrollhint', { opacity: 0, y: 10, duration: .6 }, 1.45);
}

/* ── Horizontal scroll strips (GSAP scrub) ── */
[
  { id: '#hs1', dir:  1 },
  { id: '#hs2', dir: -1 },
  { id: '#hs3', dir:  1 },
  { id: '#hs4', dir: -1 },
].forEach(({ id, dir }) => {
  const el = document.querySelector(id);
  if (!el) return;
  /* function values re-measure on refresh, so web-font swaps don't leave stale widths */
  gsap.fromTo(el,
    { x: () => dir * el.scrollWidth * 0.12 },
    {
      x: () => dir * -el.scrollWidth * 0.12,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('.hscroll'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.4,
        invalidateOnRefresh: true,
      },
    }
  );
});

/* ── About ── */
ScrollTrigger.create({
  trigger: '#about', start: 'top 75%', once: true,
  onEnter() {
    scramble(document.querySelector('#about .sl'));
    gsap.from('#about .st-i',   { yPercent: 100, stagger: .12, duration: 1, ease: 'expo.out', delay: .1 });
    gsap.from('.a-row',         { x: -28, opacity: 0, stagger: .1, duration: .7, ease: 'power3.out', delay: .28 });
    gsap.from('.a-p',           { y: 26, opacity: 0, stagger: .12, duration: .8, ease: 'power3.out', delay: .32 });
  },
});

/* ── Education ── */
ScrollTrigger.create({
  trigger: '#education', start: 'top 76%', once: true,
  onEnter() {
    scramble(document.querySelector('#education .sl'));
    gsap.from('#education .st-i', { yPercent: 100, duration: 1.05, ease: 'expo.out', delay: .1 });
  },
});
/* timeline: today's position on the 2021 → 2027 rail, and how far through the degree Ian is.
   Both are computed from the real date, so the section stays accurate without edits. */
const edProg = document.getElementById('edProg');
if (edProg) {
  const now = new Date();
  const yearFrac = now.getFullYear() + (now - new Date(now.getFullYear(), 0, 1)) / 31557600000;
  const railPct = Math.min(100, Math.max(0, ((yearFrac - 2021) / 6) * 100));
  const start = new Date(edProg.dataset.start), end = new Date(edProg.dataset.end);
  const degPct = Math.round(Math.min(1, Math.max(0, (now - start) / (end - start))) * 100);

  gsap.set('#edNow', { left: railPct + '%' });
  gsap.fromTo('#edFill', { width: '0%' }, {
    width: railPct + '%', ease: 'none',
    scrollTrigger: { trigger: '#ed', start: 'top 85%', end: 'top 35%', scrub: 1 },
  });
  gsap.from('#edNow', { scale: 0, opacity: 0, duration: .6, ease: 'back.out(2)', scrollTrigger: { trigger: '#ed', start: 'top 40%', once: true } });
  gsap.from('.ed-card', {
    scrollTrigger: { trigger: '.ed-grid', start: 'top 85%', once: true },
    y: 60, opacity: 0, duration: 1, stagger: .15, ease: 'power3.out',
  });
  ScrollTrigger.create({
    trigger: edProg, start: 'top 90%', once: true,
    onEnter() {
      gsap.to('#edBar', { width: degPct + '%', duration: 1.6, ease: 'power3.out', delay: .3 });
      gsap.to({ v: 0 }, { v: degPct, duration: 1.6, ease: 'power3.out', delay: .3,
        onUpdate() { document.getElementById('edPct').textContent = Math.round(this.targets()[0].v); } });
    },
  });
}
/* cursor spotlight on the education cards */
if (FINE) document.querySelectorAll('.ed-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ── Skills ── */
ScrollTrigger.create({
  trigger: '#skills', start: 'top 76%', once: true,
  onEnter() {
    scramble(document.querySelector('#skills .sl'));
    gsap.from('#skills .st-i', { yPercent: 100, duration: 1, ease: 'expo.out', delay: .1 });
  },
});
document.querySelectorAll('.sk-card').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    y: 44, opacity: 0, duration: .7, delay: i * .07, ease: 'power3.out',
  });
});

/* ── Projects ── */
ScrollTrigger.create({
  trigger: '#projects', start: 'top 76%', once: true,
  onEnter() {
    scramble(document.querySelector('#projects .sl'));
    gsap.from('#projects .st-i', { yPercent: 100, duration: 1, ease: 'expo.out', delay: .1 });
  },
});
document.querySelectorAll('.proj-item').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    x: -40, opacity: 0, duration: .9, ease: 'power3.out',
  });
});

/* ── Certificates ── */
ScrollTrigger.create({
  trigger: '#certs', start: 'top 76%', once: true,
  onEnter() {
    scramble(document.querySelector('#certs .sl'));
    gsap.from('#certs .st-i', { yPercent: 100, duration: 1, ease: 'expo.out', delay: .1 });
  },
});
document.querySelectorAll('.cert-card').forEach((el, i) => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    y: 52, opacity: 0, rotation: (i % 3 - 1) * 1.2,
    duration: .85, delay: (i % 3) * .13, ease: 'power3.out',
  });
});

/* ── Background number parallax ── */
document.querySelectorAll('.bnum').forEach(n => {
  gsap.to(n, {
    scrollTrigger: { trigger: n.closest('section'), scrub: 1.8 },
    y: -70, ease: 'none',
  });
});

/* ── Skill card number scrub (depth layer) ── */
document.querySelectorAll('.sk-num').forEach(n => {
  gsap.to(n, {
    y: -12,
    ease: 'none',
    scrollTrigger: { trigger: n.closest('.sk-card'), start: 'top bottom', end: 'bottom top', scrub: 1 },
  });
});

/* ── Cert hex scrub (float up as you scroll past) ── */
document.querySelectorAll('.cert-hex').forEach(h => {
  gsap.to(h, {
    y: -20,
    ease: 'none',
    scrollTrigger: { trigger: h.closest('.cert-card'), start: 'top bottom', end: 'bottom top', scrub: 1 },
  });
});

/* ── Hero photo parallax scrub (inner layer is oversized, so no edge is exposed) ── */
gsap.to('.h-photo-in', {
  yPercent: 6,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
});

/* ── Hero colour spotlight: cursor reveals the full-colour photo through the greyscale ── */
const hPhoto = document.getElementById('hPhoto');
const hColor = document.querySelector('.h-photo-color');
if (FINE && hPhoto && hColor) {
  const spot = { r: 0 };
  const paintR = () => hColor.style.setProperty('--r', spot.r + 'px');
  document.getElementById('hero').addEventListener('mousemove', e => {
    const r = hColor.getBoundingClientRect();
    hColor.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    hColor.style.setProperty('--my', (e.clientY - r.top) + 'px');
    const over = e.clientX >= hPhoto.getBoundingClientRect().left - 120;
    gsap.to(spot, { r: over ? 230 : 0, duration: over ? .7 : .5, ease: 'power3.out', overwrite: true, onUpdate: paintR });
  });
  document.getElementById('hero').addEventListener('mouseleave', () => {
    gsap.to(spot, { r: 0, duration: .5, ease: 'power3.out', overwrite: true, onUpdate: paintR });
  });
}

/* ── Hero fill text subtle scrub (pulls away as you scroll off) ── */
gsap.to('.h-fill-i', {
  y: -60,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
});
gsap.to('.h-stroke-i', {
  y: -30,
  ease: 'none',
  scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
});

/* ── 3D card tilt (mouse only — on touch it left cards stuck tilted) ── */
if (FINE) document.querySelectorAll('.sk-card, .cert-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const mx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const my = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    gsap.to(card, { rotationY: mx * 7, rotationX: -my * 7, transformPerspective: 900, duration: .4, ease: 'power2.out' });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: .6, ease: 'power3.out' });
  });
});

/* ── Magnetic cursor on small elements ── */
if (FINE) document.querySelectorAll('.h-tag, .proj-badge, .e-badge, .cert-link').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.3;
    const y = (e.clientY - r.top - r.height / 2) * 0.3;
    gsap.to(el, { x, y, duration: .35, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: .55, ease: 'elastic.out(1.1,.4)' });
  });
});

/* ── Typewriter role cycle ── */
const roles = ['Web Developer','Systems Developer','Mobile Engineer','UI / UX Design','Visual Artist'];
let ri = 0, ci = 0, del = false;
const roleEl = document.getElementById('hRole');
function typeRole() {
  if (!roleEl) return;
  const word = roles[ri];
  if (!del) {
    roleEl.textContent = word.slice(0, ++ci);
    if (ci === word.length) { del = true; setTimeout(typeRole, 1900); return; }
  } else {
    roleEl.textContent = word.slice(0, --ci);
    if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typeRole, del ? 42 : 82);
}
setTimeout(typeRole, 2800);

/* ── About stats counters ── */
document.querySelectorAll('.a-stat-n').forEach(el => {
  const target = +el.dataset.count;
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter() {
      gsap.to({ v: 0 }, {
        v: target, duration: 1.5, ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(this.targets()[0].v); },
      });
    },
  });
});

/* ── Lightbox for cert images ── */
const lb   = document.getElementById('lightbox');
const lbIm = document.getElementById('lbImg');
function closeLb() {
  gsap.to('.lb-inner', { scale: .88, opacity: 0, duration: .26, ease: 'power3.in',
    onComplete() { lb.style.display = 'none'; gsap.set('.lb-inner', { clearProps: 'all' }); }
  });
}
document.querySelectorAll('.cert-img-wrap img').forEach(img => {
  img.parentElement.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lbIm.src = img.src; lbIm.alt = img.alt;
    lb.style.display = 'flex';
    gsap.fromTo('.lb-inner', { scale: .86, opacity: 0 }, { scale: 1, opacity: 1, duration: .42, ease: 'back.out(1.5)' });
  });
});
document.getElementById('lbClose').addEventListener('click', closeLb);
document.getElementById('lbBackdrop').addEventListener('click', closeLb);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lb.style.display === 'flex') closeLb();
});


/* ── About photo parallax ── */
gsap.to('.a-photo', {
  y: -30, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
});

/* ── Skill level bars ── */
document.querySelectorAll('.sk-bar-fill').forEach(fill => {
  ScrollTrigger.create({
    trigger: fill.closest('.sk-card'), start: 'top 88%', once: true,
    onEnter() {
      gsap.to(fill, { width: fill.dataset.pct + '%', duration: 1.2, ease: 'power2.out', delay: .1 });
    },
  });
});


/* ── Project logo hover reveal ── */
if (FINE) document.querySelectorAll('.proj-item').forEach(projItem => {
  const projLogo = projItem.querySelector('.proj-logo');
  if (!projLogo) return;
  gsap.set(projLogo, { opacity: 0, scale: 0.3, rotation: -40, x: 60 });
  projItem.addEventListener('mouseenter', () => {
    gsap.killTweensOf([projLogo, projItem]);
    const pad = projLogo.offsetWidth + 28;
    gsap.to(projItem, { paddingRight: pad, duration: 0.6, ease: 'power3.out' });
    gsap.to(projLogo, { opacity: 1, scale: 1, rotation: 0, x: 0, duration: 0.78, ease: 'back.out(1.6)' });
  });
  projItem.addEventListener('mouseleave', () => {
    gsap.killTweensOf([projLogo, projItem]);
    gsap.to(projItem, { paddingRight: 0, duration: 0.52, ease: 'power3.inOut' });
    gsap.to(projLogo, { opacity: 0, scale: 0.3, rotation: 30, x: 60, duration: 0.38, ease: 'power3.in' });
  });
});


