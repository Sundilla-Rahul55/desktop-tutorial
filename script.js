// ================= CONFIG: edit these =================
const WHATSAPP_NUMBER = "91XXXXXXXXXX";  // country code + number, no "+" or spaces (e.g. 919876543210)
const INSTAGRAM_URL   = "https://instagram.com/YOUR_HANDLE";   // TODO
const LINKEDIN_URL    = "https://www.linkedin.com/company/YOUR_PAGE"; // TODO
// ======================================================

const wa = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// 1) Every "Book now" button opens WhatsApp with the package pre-filled
document.querySelectorAll("[data-book]").forEach(btn => {
  const pkg = btn.dataset.pkg || "a reel shoot";
  btn.href = wa(`Hi Rshoot! I'd like to book ${pkg}. Please share the available dates.`);
  btn.target = "_blank";
  btn.rel = "noopener";
});

// 2) Creator application button
document.querySelectorAll("[data-creator]").forEach(btn => {
  btn.href = wa("Hi Rshoot! I'd like to join as a reel creator. Here is my work and my location:");
  btn.target = "_blank";
  btn.rel = "noopener";
});

// 3) Social icons
const ig = document.getElementById("ig"), li = document.getElementById("li");
if (ig) ig.href = INSTAGRAM_URL;
if (li) li.href = LINKEDIN_URL;

// 4) Mobile menu
const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); }
});

// 5) Seamless marquee: duplicate the strip content
const track = document.getElementById("track");
if (track) track.innerHTML += track.innerHTML;

// 6) Footer year
const yr = document.getElementById("yr");
if (yr) yr.textContent = new Date().getFullYear();

// 7) Scroll reveal (skipped when the user prefers reduced motion)
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .15 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add("in"));
}

// 8) Cursor tilt on cards (desktop only)
if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll(".card").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });
}
