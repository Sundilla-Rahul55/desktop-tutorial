// Contact details (WhatsApp: country code + number, digits only)
const WHATSAPP_NUMBER = '918367551859';
const CONTACT_EMAIL = 'rshoot.india@gmail.com';

const whatsappLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

// Looping background videos: muted autoplay, paused when off-screen to save data and battery
const videos = document.querySelectorAll('video[data-autoplay]');
const safePlay = (video) => {
  const attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
};

videos.forEach((video) => {
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
});

if (reduceMotion) {
  // Respect reduced-motion: keep the poster frame, no autoplay
  videos.forEach((video) => {
    video.removeAttribute('autoplay');
    video.pause();
  });
} else if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) safePlay(entry.target);
        else entry.target.pause();
      });
    },
    { threshold: 0.25 }
  );
  videos.forEach((video) => videoObserver.observe(video));
} else {
  videos.forEach(safePlay);
}

// Sound toggle on the "Our work" reels (one reel with sound at a time)
const soundButtons = document.querySelectorAll('[data-sound]');
soundButtons.forEach((btn) => {
  const video = btn.closest('.work-video').querySelector('video');
  const title = btn.closest('.work-video').querySelector('.work-meta strong').textContent;

  btn.addEventListener('click', () => {
    const turnOn = btn.getAttribute('aria-pressed') !== 'true';

    soundButtons.forEach((other) => {
      const otherVideo = other.closest('.work-video').querySelector('video');
      otherVideo.muted = true;
      other.setAttribute('aria-pressed', 'false');
      other.setAttribute('aria-label', `Turn sound on: ${other.closest('.work-video').querySelector('.work-meta strong').textContent} reel`);
    });

    if (turnOn) {
      video.muted = false;
      video.currentTime = 0;
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', `Turn sound off: ${title} reel`);
      safePlay(video);
    }
  });
});

// Booking form: sends the request to WhatsApp (or email)
const form = document.getElementById('bookingForm');
if (form) {
  const status = document.getElementById('formStatus');
  const dateInput = form.elements.date;
  const defaultNote = status.textContent;

  // No past dates
  const today = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const setStatus = (text, isError) => {
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(isError));
  };

  const validate = () => {
    let firstInvalid = null;
    Array.from(form.elements).forEach((field) => {
      if (!field.name) return;
      let ok = field.checkValidity();
      if (field.name === 'phone' && ok) {
        ok = field.value.replace(/\D/g, '').length >= 10;
      }
      if (field.name === 'name' || field.name === 'city') {
        ok = ok && field.value.trim().length > 0;
      }
      field.classList.toggle('is-invalid', !ok);
      if (!ok && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) {
      setStatus('Please complete the highlighted fields (a valid 10-digit phone number is needed).', true);
      firstInvalid.focus();
      return false;
    }
    setStatus(defaultNote, false);
    return true;
  };

  const buildLines = () => {
    const data = new FormData(form);
    const rawDate = data.get('date');
    const niceDate = rawDate
      ? new Date(`${rawDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const lines = [
      `Name: ${data.get('name').trim()}`,
      `Phone: ${data.get('phone').trim()}`,
      `City: ${data.get('city').trim()}`,
      `Event date: ${niceDate}`,
      `Package: ${data.get('package')}`,
    ];
    const details = data.get('details').trim();
    if (details) lines.push(`Details: ${details}`);
    return lines.join('\n');
  };

  form.addEventListener('input', (event) => event.target.classList.remove('is-invalid'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) return;
    const url = whatsappLink(`Hi RSHOOT, I'd like to book a shoot.\n${buildLines()}`);
    const win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
    setStatus('Opening WhatsApp. Just press send to confirm your request.', false);
  });

  document.getElementById('emailBtn').addEventListener('click', () => {
    if (!validate()) return;
    const subject = `RSHOOT booking request: ${form.elements.package.value}`;
    const body = `Hi RSHOOT, I'd like to book a shoot.\n\n${buildLines()}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus('Opening your email app with the request filled in.', false);
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
