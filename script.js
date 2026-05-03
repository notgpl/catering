/* ============================================================
   CANA CATERS & EVENTS — script.js
   ============================================================ */

'use strict';

/* ── Config ── */
const SLIDER_INTERVAL = 3500;
const CARDS_VISIBLE   = 3;

/* ── Preloader ── */
function hidePreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) preloader.classList.add('hide');
}

window.addEventListener('load', hidePreloader);
// Fallback for slow networks
setTimeout(hidePreloader, 2000);


/* ================================================================
   1. HEADER — scroll effect + hamburger menu
   ================================================================ */
(function initHeader() {
  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (!header || !hamburger || !mobileNav) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
})();


/* ================================================================
   2. WHY-CHOOSE-US — auto-sliding carousel with dots + drag
   ================================================================ */
(function initWhySlider() {
  const track        = document.getElementById('whyTrack');
  const dotsContainer = document.getElementById('whyDots');

  if (!track || !dotsContainer) return;

  const wrapper = track.closest('.why-slider__wrapper');
  if (wrapper) {
    wrapper.style.overflow = 'hidden';
    wrapper.style.padding  = '8px 0 24px';
  }

  const cards = Array.from(track.children);
  const total = cards.length;

  function getVisible() {
    if (window.innerWidth < 768)  return 1;
    if (window.innerWidth < 1024) return 2;
    return CARDS_VISIBLE;
  }

  let current   = 0;
  let autoTimer;
  let isDragging = false, startX = 0, dragDelta = 0;

  function buildDots() {
    dotsContainer.innerHTML = '';
    const vis   = getVisible();
    const count = total - vis + 1;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('button');
      dot.className = 'why-slider__dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goTo(index) {
    const vis = getVisible();
    const max = total - vis;
    current   = Math.max(0, Math.min(index, max));

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap       = 24;
    const offset    = current * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    dotsContainer.querySelectorAll('.why-slider__dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      const vis = getVisible();
      goTo(current >= total - vis ? 0 : current + 1);
    }, SLIDER_INTERVAL);
  }

  function stopAuto() { clearInterval(autoTimer); }

  track.addEventListener('pointerdown', e => {
    isDragging = true;
    startX     = e.clientX;
    dragDelta  = 0;
    track.setPointerCapture(e.pointerId);
    stopAuto();
  });

  track.addEventListener('pointermove', e => {
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
  });

  track.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragDelta < -50)       goTo(current + 1);
    else if (dragDelta > 50)   goTo(current - 1);
    startAuto();
  });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  document.addEventListener('keydown', e => {
    const section = document.getElementById('why-us');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const vis = getVisible();
      const gap = 24;
      cards.forEach(c => {
        c.style.flex = `0 0 calc((100% - ${gap * (vis - 1)}px) / ${vis})`;
      });
      buildDots();
      goTo(0);
    }, 100);
  }, { passive: true });

  function init() {
    const vis = getVisible();
    const gap = 24;
    cards.forEach(c => {
      c.style.flex = `0 0 calc((100% - ${gap * (vis - 1)}px) / ${vis})`;
    });
    buildDots();
    goTo(0);
    startAuto();
  }

  init();
})();


/* ================================================================
   3. COUNTER ANIMATION — about section stats
   ================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const end   = parseInt(el.dataset.count, 10);
      const dur   = 2000;
      const step  = 16;
      const steps = dur / step;
      const inc   = end / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += inc;
        el.textContent = Math.min(Math.floor(current), end);
        if (current >= end) {
          el.textContent = end;
          clearInterval(timer);
        }
      }, step);

      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ================================================================
   4. ACTIVE NAV — highlight current section
   ================================================================ */
(function initActiveNav() {
  const links    = document.querySelectorAll('.nav__link');
  const sections = document.querySelectorAll('section[id]');

  function update() {
    const scrollY = window.scrollY;
    let current = 'hero';

    sections.forEach(sec => {
      const offset = sec.offsetTop - 140;
      if (scrollY >= offset) current = sec.id;
    });

    links.forEach(link => {
      const href    = link.getAttribute('href');
      const matches = href === `#${current}` ||
        (href === '#hero' && current === 'hero') ||
        (href === '#'     && current === 'hero');
      link.classList.toggle('active', matches);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ================================================================
   5. FORM SUBMISSION — basic validation + feedback
   ================================================================ */
function submitForm() {
  const name    = document.getElementById('fullName');
  const phone   = document.getElementById('phone');
  const service = document.getElementById('service');
  const vision  = document.getElementById('vision');

  const fields = [name, phone, service, vision];
  let valid = true;

  fields.forEach(f => {
    f.style.borderColor = '';
    if (!f.value.trim()) {
      f.style.borderColor = '#e05050';
      valid = false;
    }
  });

  if (!valid) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  showToast('✓ Inquiry submitted! We\'ll reach out within 24 hours.', 'success');
  fields.forEach(f => f.value = '');
}


/* ================================================================
   6. TOAST NOTIFICATION
   ================================================================ */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '90px',
    right:        '28px',
    zIndex:       '9999',
    background:   type === 'success' ? 'linear-gradient(135deg,#C9A94B,#a08530)' : '#e05050',
    color:        type === 'success' ? '#0a0a08' : '#fff',
    padding:      '14px 22px',
    borderRadius: '10px',
    fontFamily:   "'Jost', sans-serif",
    fontSize:     '0.88rem',
    fontWeight:   '500',
    boxShadow:    '0 8px 30px rgba(0,0,0,0.4)',
    transform:    'translateY(20px)',
    opacity:      '0',
    transition:   'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
    maxWidth:     '320px',
    lineHeight:   '1.5',
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity   = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}


/* ================================================================
   7. FOOTER YEAR
   ================================================================ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ================================================================
   8. AOS — Animate On Scroll
   ================================================================ */
AOS.init({
  duration : 800,
  once     : true,
  offset   : 80,
  easing   : 'ease-out-cubic',
});


/* ================================================================
   9. HERO SLIDER — 3-slide auto-advance with arrows & dots
   ================================================================ */
(function initHeroSlider() {
  const slides      = document.querySelectorAll('.hero-slide');
  const dots        = document.querySelectorAll('.hero-dot');
  const prevBtn     = document.getElementById('heroPrev');
  const nextBtn     = document.getElementById('heroNext');
  const totalSlides = slides.length;

  if (!totalSlides) return;

  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + totalSlides) % totalSlides;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.slide));
      startAuto();
    });
  });

  // Touch / swipe support
  let touchStartX = 0;
  const slider = document.getElementById('heroSlider');
  if (slider) {
    slider.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (delta < -50)      { next(); startAuto(); }
      else if (delta > 50)  { prev(); startAuto(); }
    }, { passive: true });
  }

  startAuto();
})();


/* ================================================================
   10. SCROLL TO TOP
   ================================================================ */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
