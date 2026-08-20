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

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const linkLabel = {
  site: "Ver site",
  github: "GitHub",
  demo: "Demo",
  documentacao: "Documentação",
};

const renderProject = (project) => {
  const capa = project.imagens?.capa;
  const links = Object.entries(project.links ?? {})
    .filter(([, href]) => Boolean(href))
    .map(
      ([key, href]) =>
        `<a class="project-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${linkLabel[key] ?? key}</a>`
    )
    .join("");

  const stack = (project.tecnologias ?? [])
    .slice(0, 4)
    .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
    .join("");

  return `
    <article class="card project">
      <div class="project-media">
        <img src="${escapeHtml(capa?.ficheiro)}" alt="${escapeHtml(capa?.alt || project.nome)}" />
      </div>
      <div class="project-body">
        <span class="tag">${escapeHtml(project.categoria || project.tipo)}</span>
        <h3>${escapeHtml(project.nome)}</h3>
        <p class="project-tagline">${escapeHtml(project.subtitulo || "")}</p>
        <p>${escapeHtml(project.descricao)}</p>
        <div class="chips project-stack">${stack}</div>
        ${links ? `<div class="project-links">${links}</div>` : ""}
      </div>
    </article>
  `;
};

const mountProjects = async () => {
  const root = document.querySelector("[data-projectos]");
  if (!root) return;

  try {
    const response = await fetch("data/projectos.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Falha a ler o JSON");
    const data = await response.json();
    const list = [...(data.projectos ?? [])].sort((a, b) => Number(b.destaque) - Number(a.destaque));
    root.innerHTML = list.map(renderProject).join("") || `<p class="project-empty">Ainda não há projectos no JSON.</p>`;
  } catch {
    root.innerHTML = `<p class="project-empty">Não foi possível carregar <code>data/projectos.json</code>. Abre o site por HTTP (GitHub Pages ou um servidor local).</p>`;
  }
};

mountProjects();
