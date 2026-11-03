/* =====================================================================
   RSHOOT: iPhone-camera style animation (GSAP + ScrollTrigger, vanilla JS)
   EDIT THE VARIABLES BELOW to change timings, easings or phone models.
   ===================================================================== */
const WHATSAPP_NUMBER = "91XXXXXXXXXX";   // TODO: country code + number, no "+" or spaces
const CYCLE_MS = 3800;                    // auto-cycle speed of the model switcher
const TIMELINE_SECONDS = 3599;            // scroll maps to 00:00:00 -> 00:59:59 in the corner widget
const STEP_AT = [0.02, 0.45, 0.85];       // scroll progress at which each "How it works" step lights up
const EASE = { out: "power3.out", soft: "expo.out", inOut: "power2.inOut" };
const DUR = { reveal: 0.9, card: 0.8, stagger: 0.12, flashMs: 180 };   // flashMs must stay under 300

/* Add or rename models here. lenses: 2 or 3. scale/bezel/radius morph the frame. aperture: show f-number control. */
const MODELS = [
  { name: "iPhone 15 Plus",     lenses: 2, scale: 1,    bezel: 12, radius: 44, aperture: false },
  { name: "iPhone 16 Plus",     lenses: 2, scale: 1,    bezel: 11, radius: 45, aperture: false },
  { name: "iPhone 17 Pro Max",  lenses: 3, scale: 1.05, bezel: 9,  radius: 46, aperture: false },
  { name: "iPhone 18 Pro Max",  lenses: 3, scale: 1.06, bezel: 8,  radius: 47, aperture: true  }
];

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SMALL = matchMedia("(max-width: 480px)").matches;
  const pad = n => String(n).padStart(2, "0");
  const tc = s => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  /* ---------- 1. WhatsApp links (package name pre-filled) ---------- */
  $$("[data-book]").forEach(a => {
    const text = `Hi Rshoot! I'd like to book ${a.dataset.pkg || "a reel shoot"}. Please share the available dates.`;
    a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- 2. Mobile menu ---------- */
  const menu = $("#menu"), nav = $("#nav");
  const setMenu = open => { nav.classList.toggle("open", open); menu.setAttribute("aria-expanded", open); menu.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", e => { if (e.target.tagName === "A") setMenu(false); });

  /* ---------- 3. Phone: model switcher, modes, zoom, REC timer ---------- */
  const phone = $("#phone"), module = $("#module"), sw = $("#switch");
  let cur = 0, cycle = null;
  const btns = MODELS.map((m, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = m.name; b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => { stopCycle(); applyModel(i); });
    sw.appendChild(b);
    return b;
  });
  function applyModel(i) {
    cur = i; const m = MODELS[i];
    phone.style.setProperty("--s", m.scale);
    phone.style.setProperty("--bz", m.bezel + "px");
    phone.style.setProperty("--r", m.radius + "px");
    phone.dataset.ap = m.aperture ? "1" : "0";
    module.dataset.lenses = m.lenses;
    btns.forEach((b, j) => b.setAttribute("aria-pressed", j === i));
  }
  function startCycle() { if (!RM && !SMALL) cycle = setInterval(() => { if (!document.hidden) applyModel((cur + 1) % MODELS.length); }, CYCLE_MS); }
  function stopCycle() { clearInterval(cycle); cycle = null; }
  sw.addEventListener("keydown", e => {
    const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!k) return;
    e.preventDefault(); stopCycle();
    const n = (cur + k + MODELS.length) % MODELS.length;
    applyModel(n); btns[n].focus();
  });
  applyModel(0); startCycle();

  // Zoom pills and mode carousel (decorative, mouse/touch only)
  $$(".zoom span").forEach(s => s.addEventListener("click", () => {
    $$(".zoom span").forEach(x => x.classList.toggle("on", x === s));
    $("#scene").dataset.zoom = parseFloat(s.textContent);
  }));
  $$(".modes span").forEach(s => s.addEventListener("click", () => {
    $$(".modes span").forEach(x => x.classList.toggle("on", x === s));
    phone.dataset.mode = s.textContent.toLowerCase();
  }));
  let recSec = 15;
  setInterval(() => { if (phone.dataset.mode === "video" && !document.hidden) $("#recTime").textContent = tc(++recSec); }, 1000);

  /* ---------- 4. Hero headline: split into words (text unchanged) ---------- */
  const h1 = $("#h1");
  h1.setAttribute("aria-label", h1.textContent.trim());
  h1.innerHTML = h1.textContent.trim().split(/\s+/).map(w => `<span class="w"><span>${w}</span></span>`).join(" ");

  if (!hasGSAP || RM) { try { sessionStorage.setItem("rshoot-intro", "1"); } catch (e) {} return; }

  /* ---------- 5. GSAP animations ---------- */
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("anim");

  // Intro: black screen, bolt flash, iris-like open (once per session)
  function intro(done) {
    try { sessionStorage.setItem("rshoot-intro", "1"); } catch (e) {}
    gsap.timeline({ onComplete: () => { $(".intro").style.display = "none"; done(); } })
      .fromTo("#introBolt", { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .15 })
      .to("#introBolt", { opacity: .15, duration: .12 })
      .to("#introBolt", { opacity: 1, scale: 1.15, duration: .2 })
      .to("#introBolt", { scale: 16, opacity: 0, duration: .7, ease: "power3.in" }, "+=.1")
      .to(".intro", { opacity: 0, duration: .35 }, "-=.35");
  }

  // Hero reveal: word-by-word focus pull
  function heroIn() {
    gsap.timeline({ defaults: { ease: EASE.out } })
      .from("[data-hero]", { y: 24, opacity: 0, duration: .8, stagger: .08 }, 0)
      .from("#h1 .w > span", { yPercent: 110, opacity: 0, filter: "blur(14px)", duration: 1, stagger: .07 }, .05)
      .from(".phone-in", { y: 80, scale: .9, opacity: 0, duration: 1.1 }, .1)
      .from(".chip-f", { opacity: 0, scale: .8, duration: .6, stagger: .15 }, .8);
  }
  if (document.documentElement.classList.contains("intro-on")) intro(heroIn); else heroIn();

  // Phone floats; focus square pulses; focus pull on the scene
  gsap.to(".phone-float", { y: -12, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.timeline({ repeat: -1, repeatDelay: 1.6, delay: 1.8 })
    .set(["#focus", ".expo"], { opacity: 0 }).set("#focus", { scale: 1.7 }).set("#scene", { filter: "blur(7px)" })
    .to("#focus", { opacity: 1, scale: 1, duration: .55, ease: "power3.out" })
    .to(".expo", { opacity: 1, y: -6, duration: .35 }, "<.2")
    .to("#scene", { filter: "blur(0px)", duration: .9, ease: "power2.out" }, "<.1")
    .to("#focus", { scale: .88, duration: .25, yoyo: true, repeat: 1 }, ">-.3")
    .to(["#focus", ".expo"], { opacity: 0, duration: .5 }, "+=1.2");

  // Scroll progress bar
  gsap.to("#progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .2 } });

  // Phone shrinks into a corner widget; timecode follows scroll
  gsap.fromTo("#phoneWrap", { scale: 1, opacity: 1, y: 0 }, { scale: .4, opacity: 0, y: 60, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 30%", scrub: true } });
  gsap.fromTo("#widget", { opacity: 0, scale: .5, y: 30 }, { opacity: 1, scale: 1, y: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "60% top", end: "bottom top", scrub: true } });
  let last = -1;
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: s => {
    const t = Math.floor(s.progress * TIMELINE_SECONDS);
    if (t !== last) { last = t; $("#wTime").textContent = tc(t); }
  } });

  // Section transitions: rack focus (blur to sharp, small scale), headings slide up
  $$("[data-rack]").forEach(el => {
    gsap.from(el, { opacity: 0, filter: "blur(10px)", scale: .97, duration: DUR.reveal, ease: EASE.out, clearProps: "all",
      scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    gsap.from($("h2", el), { y: 50, duration: DUR.reveal + .2, ease: EASE.soft, clearProps: "all",
      scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
  gsap.from(".why li", { y: 40, opacity: 0, filter: "blur(8px)", duration: DUR.card, stagger: DUR.stagger, ease: EASE.out, clearProps: "all",
    scrollTrigger: { trigger: ".why", start: "top 85%", once: true } });

  // How it works: steps light up like switching modes, with a progress line
  const steps = $$(".step"), fill = $(".line-fill");
  steps[0].classList.add("on");
  ScrollTrigger.create({ trigger: ".steps", start: "top 75%", end: "bottom 55%", scrub: true, onUpdate: s => {
    fill.style.setProperty("--p", s.progress);
    steps.forEach((el, i) => el.classList.toggle("on", s.progress >= STEP_AT[i]));
  } });
  fill.style.setProperty("--p", 0);

  // Package and wedding cards stagger in
  $$(".cards").forEach(g => gsap.from(g.children, { y: 60, opacity: 0, duration: DUR.card, stagger: DUR.stagger, ease: EASE.out, clearProps: "transform,opacity",
    scrollTrigger: { trigger: g, start: "top 85%", once: true } }));

  // Final CTA: aperture iris opens
  gsap.fromTo(".iris", { scale: 0 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".final", start: "top 85%", end: "top 25%", scrub: true } });

  // FAQ: smooth open/close
  $$("#faq details").forEach(d => {
    const p = $("p", d);
    $("summary", d).addEventListener("click", e => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-open");
        gsap.to(p, { height: 0, paddingBottom: 0, opacity: 0, overflow: "hidden", duration: .3, ease: EASE.inOut, onComplete: () => { d.open = false; gsap.set(p, { clearProps: "all" }); } });
      } else {
        d.open = true; d.classList.add("is-open");
        gsap.fromTo(p, { height: 0, paddingBottom: 0, opacity: 0, overflow: "hidden" }, { height: "auto", paddingBottom: 22, opacity: 1, duration: .35, ease: EASE.out, onComplete: () => gsap.set(p, { clearProps: "all" }) });
      }
    });
  });

  // Shutter flash on every "Book now" (under 300ms, then WhatsApp opens)
  $$("[data-book]").forEach(a => a.addEventListener("click", e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const href = a.href;
    gsap.timeline().to("#flash", { opacity: .95, duration: .05 }).to("#flash", { opacity: 0, duration: .12 });
    gsap.fromTo("#shutterIcon", { scale: .4, opacity: 1 }, { scale: 1.4, opacity: 0, duration: .16 });
    setTimeout(() => { if (!window.open(href, "_blank", "noopener")) location.href = href; }, DUR.flashMs);
  }));
})();
