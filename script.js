// ================= CONFIG: edit these =================
const WHATSAPP_NUMBER = "91XXXXXXXXXX"; // TODO: country code + number, no "+" or spaces (e.g. 919876543210)
// ======================================================

// 1) Every "Book now" button opens WhatsApp with the package name pre-filled
document.querySelectorAll("[data-book]").forEach(btn => {
  const pkg = btn.dataset.pkg || "a reel shoot";
  const text = `Hi Rshoot! I'd like to book ${pkg}. Please share the available dates.`;
  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  btn.target = "_blank";
  btn.rel = "noopener";
});

// 2) Mobile menu
const menu = document.getElementById("menu");
const nav = document.getElementById("nav");
menu.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menu.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", e => {
  if (e.target.tagName === "A") { nav.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); }
});

// 3) Scroll reveal (skipped when the user prefers reduced motion)
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: .15 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add("in"));
}
