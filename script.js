// Replace with your WhatsApp number: country code + number, digits only (e.g. 919876543210)
const WHATSAPP_NUMBER = '91XXXXXXXXXX';

const whatsappLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Book now buttons on packages open a prefilled booking message
document.querySelectorAll('[data-book]').forEach((btn) => {
  const plan = btn.dataset.book;
  btn.href = whatsappLink(`Hi RSHOOT, I'd like to book the ${plan} package. My date and location:`);
  btn.target = '_blank';
  btn.rel = 'noopener noreferrer';
  btn.setAttribute('aria-label', `Book now: ${plan} package`);
});

document.querySelectorAll('[data-wa]').forEach((link) => {
  link.href = whatsappLink(link.dataset.wa);
});

// Header shadow once the page scrolls
const header = document.getElementById('siteHeader');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Only one FAQ open at a time
const faqs = document.querySelectorAll('.faq');
faqs.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqs.forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// Reveal-on-scroll
const reveals = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
}

document.getElementById('year').textContent = new Date().getFullYear();
