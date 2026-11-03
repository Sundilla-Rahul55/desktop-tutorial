/* =====================================================================
   R⚡HOOT teardown showcase (vanilla JS, no libraries)
   Scroll sets --p (0 to 1). The cursor tilts the assembly (--rx / --ry).
   When the teardown completes, the orange macaw flies in and lands on the phone.
   ===================================================================== */
const WHATSAPP_NUMBER = "91XXXXXXXXXX";   // TODO: country code + number, no "+" or spaces
const TEARDOWN = {
  lerp: 0.08,        // scroll smoothing (higher = snappier)
  tiltX: 7, tiltY: 12, drift: 1.2,   // cursor tilt and idle sway, in degrees
  hold: 0.22,        // share of the pinned scroll kept AFTER the teardown completes (time to watch the macaw land)
  landAt: 0.985,     // progress at which the macaw takes off
  leaveAt: 0.9,      // scrolling back above this resets the macaw
  flyMs: 3400        // fly-in duration (keep in sync with --fly in CSS if you change it)
};

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

  /* 2) Top tabs highlight the section in view */
  const links = $$(".top nav a");
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(l => { const s = $(l.getAttribute("href")); if (s) io.observe(s); });

  /* 2b) Wedding showcase video: click to load and play; shows a note if the file is missing */
  const vf = $("#vframe"), vid = $("#wvideo"), playBtn = $("#wplay");
  playBtn.addEventListener("click", () => {
    if (!vid.getAttribute("src")) vid.src = vid.dataset.src;
    vid.controls = true;
    vid.play().then(() => vf.classList.add("playing")).catch(() => {});
  });
  vid.addEventListener("error", () => { vf.classList.remove("playing"); vf.classList.add("missing"); });
  vid.addEventListener("ended", () => { vf.classList.remove("playing"); vid.controls = false; });

  /* 3) Teardown */
  const sec = $("#optics"), pin = $(".pin"), hint = $("#hint");
  const plates = $$("[data-part]").sort((a, b) => a.dataset.part - b.dataset.part);   // 0 display, 1 camera plateau, 2 frame, 3 shell
  const parts = $$(".part"), N = parts.length;
  const bird = $("#macaw"), perch = $("#perch");
  let target = 0, p = 0, tx = 0, ty = 0, rx = 0, ry = 0, cur = -1, manual = -1, run = false, raf = 0;
  let state = "away", bx = 0, by = 0;

  // Photo scale: the single photo is 428px tall, so --k sizes every plate
  const setK = () => {
    const h = innerWidth <= 900 ? Math.min(innerHeight * .36, 330) : Math.min(innerHeight * .5, 440);
    sec.style.setProperty("--k", (h / 428).toFixed(4));
  };
  const setHot = k => {
    if (k === cur) return;
    cur = k;
    parts.forEach((c, j) => c.classList.toggle("on", j === k));
    plates.forEach((pl, j) => pl.classList.toggle("hot", j === k));
  };
  const measure = () => {
    const max = sec.offsetHeight - innerHeight;
    target = max > 0 ? clamp(-sec.getBoundingClientRect().top / (max * (1 - TEARDOWN.hold)), 0, 1) : 1;
  };
  parts.forEach((c, k) => {
    ["mouseenter", "focus"].forEach(ev => c.addEventListener(ev, () => { manual = k; if (RM) setHot(k); }));
    ["mouseleave", "blur"].forEach(ev => c.addEventListener(ev, () => { manual = -1; }));
  });

  /* Macaw: CSS keyframes (@keyframes fly) fly it in; afterwards it tracks the perch point on the phone */
  const perchPos = () => {
    const a = perch.getBoundingClientRect(), b = pin.getBoundingClientRect();
    return [a.left - b.left, a.top - b.top];
  };
  const fly = () => {
    const [lx, ly] = perchPos();
    bird.style.transform = "";
    bird.style.setProperty("--lx", lx + "px");
    bird.style.setProperty("--ly", ly + "px");
    bird.style.setProperty("--sx", (pin.clientWidth + 160) + "px");   // start: off-screen, top-right corner
    bird.style.setProperty("--sy", "-160px");
    bird.style.setProperty("--fly", TEARDOWN.flyMs + "ms");
    bird.classList.remove("perched");
    void bird.offsetWidth;                                           // restart the animation
    bird.classList.add("flying");
    bx = lx; by = ly; state = "flying";
  };
  bird.addEventListener("animationend", e => {
    if (e.animationName !== "fly") return;
    bird.style.transform = `translate(${bx}px,${by}px)`;            // hold the landing spot, then drop the animation
    bird.classList.remove("flying");
    bird.classList.add("perched");
    state = "perched";
  });
  const leave = () => {
    state = "away";
    bird.classList.remove("flying", "perched");
    bird.style.transform = "";
  };

  setK();
  addEventListener("resize", () => { setK(); measure(); if (RM) placeStatic(); });

  /* Reduced motion: static exploded view, macaw already perched, no tilt or scrubbing */
  function placeStatic() {
    const [x, y] = perchPos();
    bird.style.transform = `translate(${x}px,${y}px)`;
  }
  if (RM) {
    setHot(1);
    bird.classList.add("perched");
    addEventListener("load", placeStatic);
    placeStatic();
    return;
  }

  addEventListener("scroll", measure, { passive: true });
  addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
  });

  const frame = t => {
    raf = 0;
    if (!run) return;
    p += (target - p) * TEARDOWN.lerp;
    if (Math.abs(target - p) < .0005) p = target;
    rx += ((-ty * TEARDOWN.tiltX + Math.sin(t / 1800) * TEARDOWN.drift) - rx) * .07;
    ry += ((tx * TEARDOWN.tiltY + Math.cos(t / 2300) * TEARDOWN.drift) - ry) * .07;
    sec.style.setProperty("--p", p.toFixed(4));
    sec.style.setProperty("--rx", rx.toFixed(2) + "deg");
    sec.style.setProperty("--ry", ry.toFixed(2) + "deg");
    setHot(manual >= 0 ? manual : Math.min(N - 1, Math.floor(p * N * 1.02)));
    hint.style.opacity = p < .04 ? 1 : 0;

    if (state === "away" && p >= TEARDOWN.landAt) fly();
    else if (state !== "away" && p < TEARDOWN.leaveAt) leave();
    else if (state === "perched") {                                  // stay glued to the phone while it tilts
      const [x, y] = perchPos();
      bx += (x - bx) * .2; by += (y - by) * .2;
      bird.style.transform = `translate(${bx.toFixed(1)}px,${by.toFixed(1)}px)`;
    }
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
