/* =========================================================
   Rshoot landing page script (vanilla JS, no dependencies)
   ========================================================= */
(function () {
  'use strict';

  /* PLACEHOLDER: your WhatsApp number, country code first, digits only (e.g. 919876543210) */
  var WHATSAPP_NUMBER = '91XXXXXXXXXX';

  /* 1. WhatsApp booking links with the package name pre-filled */
  function buildMessage(pkg) {
    if (!pkg || pkg === 'General enquiry') {
      return 'Hi Rshoot! I would like to book a reel-maker. Please share the available packages and dates.';
    }
    return 'Hi Rshoot! I would like to book the ' + pkg + ' package.\n\nDate: \nTime: \nLocation: ';
  }

  document.querySelectorAll('[data-book]').forEach(function (link) {
    var pkg = link.getAttribute('data-book');
    link.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage(pkg)));
  });

  /* 2. Mobile menu toggle */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function closeMenu() {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Open menu';
    nav.classList.remove('is-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) { closeMenu(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.sr-only').textContent = 'Close menu';
      nav.classList.add('is-open');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
    });
  }

  /* 3. Header shadow on scroll and the sticky mobile Book now bar */
  var header = document.querySelector('.site-header');
  var mobileBook = document.querySelector('.mobile-book');
  var hero = document.querySelector('.hero');
  var cta = document.querySelector('.cta');

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (mobileBook && hero) {
      var pastHero = y > hero.offsetHeight - 120;
      // Hide the bar while the final CTA is on screen, so there aren't two buttons
      var ctaRect = cta ? cta.getBoundingClientRect() : null;
      var ctaVisible = ctaRect ? ctaRect.top < window.innerHeight && ctaRect.bottom > 0 : false;
      mobileBook.classList.toggle('is-visible', pastHero && !ctaVisible);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 4. Scroll-reveal animations (CSS turns these off for reduced motion) */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 5. Footer year */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
