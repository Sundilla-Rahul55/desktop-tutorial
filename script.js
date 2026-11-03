/* =====================================================================
   R⚡HOOT exploded-view showcase (vanilla JS, no libraries)
   Scroll sets --p (0 to 1). The cursor tilts the assembly (--rx / --ry).
   ===================================================================== */
const WHATSAPP_NUMBER = "91XXXXXXXXXX";                          // TODO: country code + number, no "+" or spaces
const EXPLODE = { lerp: 0.08, tiltX: 7, tiltY: 12, drift: 1.4 };  // scroll smoothing, tilt in degrees, idle sway in degrees

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1) Book now buttons open WhatsApp with the package name pre-filled */
  $$("[data-book]").forEach(a => {
    const text = `Hi Rshoot! I'd like to book ${a.dataset.pkg || "a reel shoot"}. Please share the available dates.`;
    a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* 2) Top tabs: highlight the section in view */
  const links = $$(".top nav a");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(l => { const s = $(l.getAttribute("href")); if (s) io.observe(s); });

  /* 3) Exploded view */
  const sec = $("#optics"), layers = $$(".layer"), calls = $$(".callout");
  const pct = $("#pct"), hint = $("#hint");
  const N = layers.length;                       // callout k controls layer N-1-k (front layer = first callout)
  let target = 0, p = 0, tx = 0, ty = 0, rx = 0, ry = 0, cur = -1, manual = -1, run = false, raf = 0;

  const setHot = k => {
    if (k === cur) return;
    cur = k;
    calls.forEach((c, j) => c.classList.toggle("on", j === k));
    layers.forEach((l, i) => l.classList.toggle("hot", i === N - 1 - k));
  };
  const measure = () => {
    const max = sec.offsetHeight - innerHeight;
    target = max > 0 ? clamp(-sec.getBoundingClientRect().top / max, 0, 1) : 1;
  };

  // Hovering or focusing a callout highlights its layer
  calls.forEach((c, k) => {
    ["mouseenter", "focus"].forEach(ev => c.addEventListener(ev, () => { manual = k; if (RM) setHot(k); }));
    ["mouseleave", "blur"].forEach(ev => c.addEventListener(ev, () => { manual = -1; }));
  });

  if (RM) { setHot(1); return; }                  // reduced motion: static exploded view, no tilt, no scroll scrubbing

  addEventListener("scroll", measure, { passive: true });
  addEventListener("resize", measure);
  addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  });

  const frame = t => {
    raf = 0;
    if (!run) return;
    p += (target - p) * EXPLODE.lerp;
    if (Math.abs(target - p) < .0005) p = target;
    rx += ((-ty * EXPLODE.tiltX + Math.sin(t / 1800) * EXPLODE.drift) - rx) * .07;
    ry += ((tx * EXPLODE.tiltY + Math.cos(t / 2300) * EXPLODE.drift) - ry) * .07;
    sec.style.setProperty("--p", p.toFixed(4));
    sec.style.setProperty("--rx", rx.toFixed(2) + "deg");
    sec.style.setProperty("--ry", ry.toFixed(2) + "deg");
    setHot(manual >= 0 ? manual : Math.min(N - 1, Math.floor(p * N * 1.05)));
    pct.textContent = String(Math.round(p * 100)).padStart(2, "0") + "%";
    hint.style.opacity = p < .04 ? 1 : 0;
    raf = requestAnimationFrame(frame);
  };
  // Only animate while the section is on screen
  new IntersectionObserver(([e]) => {
    run = e.isIntersecting;
    if (run) { measure(); if (!raf) raf = requestAnimationFrame(frame); }
  }).observe(sec);

  setHot(0);
  measure();
})();
