/* Shared by every page: smooth scroll, cursor, nav, progress bar, toast, back-to-top. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger };
export const FINE   = !document.documentElement.classList.contains('touch');
export const REDUCE = document.documentElement.classList.contains('reduce');

/* ── Smooth scroll (Lenis drives the wheel, GSAP's ticker drives Lenis) ── */
export const lenis = REDUCE ? null : new Lenis({ duration: 1.15, smoothWheel: true });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
export function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -62, duration: 1.3 });
  else gsap.to(window, { scrollTo: { y: target, offsetY: 62 }, duration: REDUCE ? 0 : 1.1, ease: 'power3.inOut' });
}

/* ── Cursor (mouse only) ── */
const $cur  = document.getElementById('cur');
const $cdot = document.getElementById('cdot');
if (FINE && $cur && $cdot) {
  const curX = gsap.quickTo($cur, 'x', { duration: .28, ease: 'power2.out' });
  const curY = gsap.quickTo($cur, 'y', { duration: .28, ease: 'power2.out' });
  const dotX = gsap.quickTo($cdot, 'x', { duration: .07, ease: 'none' });
  const dotY = gsap.quickTo($cdot, 'y', { duration: .07, ease: 'none' });
  document.addEventListener('mousemove', e => {
    curX(e.clientX); curY(e.clientY); dotX(e.clientX); dotY(e.clientY);
    if (!$cur.classList.contains('live')) {
      gsap.set([$cur, $cdot], { x: e.clientX, y: e.clientY });
      $cur.classList.add('live'); $cdot.classList.add('live');
    }
  });
  document.documentElement.addEventListener('mouseleave', () => { $cur.classList.remove('live'); $cdot.classList.remove('live'); });
  /* delegated, so elements the demos create later get the hover ring too */
  const HOV = 'a, button, input, select, textarea, .h-tag, .sk-card, .ed-card, .cert-card, .proj-item, [data-hov]';
  document.addEventListener('mouseover', e => $cur.classList.toggle('hov', !!e.target.closest(HOV)));
}

/* ── Scroll progress bar ── */
ScrollTrigger.create({
  start: 'top top', end: 'max',
  onUpdate: s => gsap.set('#prog', { scaleX: s.progress }),
});

/* ── Nav glass ── */
ScrollTrigger.create({
  start: 'top -60',
  onEnter:     () => document.getElementById('nav').classList.add('on'),
  onLeaveBack: () => document.getElementById('nav').classList.remove('on'),
});

/* ── In-page anchors smooth-scroll; "/#about" from another page navigates normally ── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href*="#"]');
  if (!a || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const el = document.querySelector(url.hash);
  if (!el) return;
  e.preventDefault();
  scrollToTarget(url.hash === '#hero' ? 0 : el);
});

/* ── Copy email to clipboard + toast ── */
const toast = document.getElementById('toast');
export function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  gsap.killTweensOf(toast);
  gsap.timeline()
    .to(toast, { opacity: 1, y: 0, duration: .3, ease: 'power2.out' })
    .to(toast, { opacity: 0, y: 20, duration: .3, ease: 'power2.in', delay: 2.4 });
}
gsap.set('#toast', { xPercent: -50, y: 20, opacity: 0 });
document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const email = a.getAttribute('href').replace('mailto:', '');
    /* clipboard is blocked on some mobile browsers — fall back to opening the mail app */
    if (!navigator.clipboard) { window.location.href = a.href; return; }
    navigator.clipboard.writeText(email)
      .then(() => showToast('Copied — ' + email))
      .catch(() => { window.location.href = a.href; });
  });
});

/* ── Scroll to top ── */
gsap.set('#totop', { opacity: 0, y: 10, pointerEvents: 'none' });
ScrollTrigger.create({
  start: 'top -50%',
  onEnter:     () => gsap.to('#totop', { opacity: 1, y: 0, pointerEvents: 'auto', duration: .4, ease: 'power2.out' }),
  onLeaveBack: () => gsap.to('#totop', { opacity: 0, y: 10, pointerEvents: 'none', duration: .3 }),
});
document.getElementById('totop')?.addEventListener('click', () => scrollToTarget(0));

/* ── Mobile hamburger ── */
const ham = document.getElementById('ham');
const navLinks = document.getElementById('navLinks');
export function toggleMenu(open) {
  if (!ham || !navLinks) return;
  ham.classList.toggle('open', open);
  navLinks.classList.toggle('open', open);
  ham.setAttribute('aria-expanded', open);
  /* the glass bar must be on while the menu is open, even at the very top of the page */
  document.getElementById('nav').classList.toggle('menu', open);
  if (open) gsap.fromTo(navLinks.querySelectorAll('li'), { y: -14, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .45, ease: 'power3.out', delay: .08 });
}
if (ham && navLinks) {
  ham.setAttribute('aria-expanded', 'false');
  ham.setAttribute('aria-controls', 'navLinks');
  ham.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('open')));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && navLinks.classList.contains('open')) toggleMenu(false); });
}

/* ── Aurora: each [data-glow="#a,#b,#c"] region re-tints the background light as it scrolls in ── */
const aurora = document.getElementById('aurora');
if (aurora) {
  const tint = (el) => {
    const [a1, a2, a3] = el.dataset.glow.split(',');
    gsap.to(aurora, { '--a1': a1, '--a2': a2, '--a3': a3, duration: 1.6, ease: 'power2.out', overwrite: 'auto' });
  };
  document.querySelectorAll('[data-glow]').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onEnter: () => tint(el), onEnterBack: () => tint(el) });
  });
  const auCur = document.getElementById('auCur');
  if (FINE && !REDUCE && auCur) {
    const ax = gsap.quickTo(auCur, 'x', { duration: 2.4, ease: 'power3.out' });
    const ay = gsap.quickTo(auCur, 'y', { duration: 2.4, ease: 'power3.out' });
    gsap.set(auCur, { xPercent: -50, yPercent: -50 });
    document.addEventListener('mousemove', e => { ax(e.clientX); ay(e.clientY); auCur.classList.add('on'); });
  }
}

/* ── Footer CTA reveal ── */
ScrollTrigger.create({
  trigger: 'footer', start: 'top 82%', once: true,
  onEnter() {
    gsap.from('.ft-cta-head', { yPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out' });
    gsap.from('.ft-ch', { yPercent: 22, opacity: 0, duration: .75, ease: 'expo.out', stagger: .1, delay: .45 });
    gsap.to('.ft-cta-rule', { scaleX: 1, duration: 1.1, ease: 'power3.inOut', delay: .5 });
  },
});

/* ── Generic reveal for project pages and demos: [data-reveal] fades up once ── */
document.querySelectorAll('[data-reveal]').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    y: 36, opacity: 0, duration: .8, ease: 'power3.out',
  });
});

/* ── Re-measure every trigger once web fonts and images have settled ── */
if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
