const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelectorAll(".nav-links a");

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});

links.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];

const markActive = () => {
  const y = window.scrollY + 120;
  let current = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= y) current = section.id;
  });

  links.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
  });
};

window.addEventListener("scroll", markActive, { passive: true });
markActive();

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
