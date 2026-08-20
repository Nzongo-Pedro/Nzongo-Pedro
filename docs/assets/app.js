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
  if (!sections.length) return;
  const y = window.scrollY + 120;
  let current = sections[0]?.id;

  sections.forEach((section) => {
    if (section.offsetTop <= y) current = section.id;
  });

  links.forEach((link) => {
    const href = link.getAttribute("href") ?? "";
    const hash = href.includes("#") ? `#${href.split("#").pop()}` : href;
    link.classList.toggle(
      "is-active",
      hash === `#${current}` || (href.endsWith("projetos.html") && current === "projetos")
    );
  });
};

window.addEventListener("scroll", markActive, { passive: true });
markActive();

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const FEATURED_LIMIT = 3;

const estadoLabel = {
  "em-producao": "Em produ\u00e7\u00e3o",
  "codigo-aberto": "C\u00f3digo aberto",
  privado: "Privado",
  "estudo-de-caso": "Estudo de caso",
  "em-curso": "Em curso",
};

const linkLabel = {
  site: "Ver site",
  github: "GitHub",
  demo: "Demo",
  documentacao: "Documenta\u00e7\u00e3o",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const projectHref = (id) => `projeto.html?id=${encodeURIComponent(id)}`;

const sortProjects = (list) =>
  [...list].sort((a, b) => Number(b.destaque) - Number(a.destaque) || (b.ano ?? 0) - (a.ano ?? 0));

const loadProjects = async () => {
  const response = await fetch("data/projectos.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("json");
  const data = await response.json();
  return sortProjects(data.projectos ?? []);
};

const renderCard = (project) => {
  const capa = project.imagens?.capa;
  const stack = (project.tecnologias ?? [])
    .slice(0, 4)
    .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
    .join("");

  return `
    <a class="card project" href="${projectHref(project.id)}">
      <div class="project-media">
        <img src="${escapeHtml(capa?.ficheiro)}" alt="${escapeHtml(capa?.alt || project.nome)}" />
      </div>
      <div class="project-body">
        <span class="tag">${escapeHtml(project.categoria || project.tipo)}</span>
        <h3>${escapeHtml(project.nome)}</h3>
        <p class="project-tagline">${escapeHtml(project.subtitulo || "")}</p>
        <p>${escapeHtml(project.descricao)}</p>
        <div class="chips project-stack">${stack}</div>
        <span class="project-link">Ver detalhes</span>
      </div>
    </a>
  `;
};

const loadError =
  '<p class="project-empty">N\u00e3o foi poss\u00edvel carregar os projectos. Abre o site por HTTP (GitHub Pages ou um servidor local).</p>';

const listMarkup = (items) =>
  items.map(renderCard).join("") || '<p class="project-empty">Ainda n\u00e3o h\u00e1 projectos no JSON.</p>';

const mountProjectList = async () => {
  const root = document.querySelector("[data-projectos]");
  if (!root) return;

  const mode = root.dataset.projectos || "all";
  const more = document.querySelector("[data-ver-mais]");

  try {
    const all = await loadProjects();
    const featured = all.filter((item) => item.destaque);
    const homeList = (featured.length ? featured : all).slice(0, FEATURED_LIMIT);
    const items = mode === "featured" ? homeList : all;
    root.innerHTML = listMarkup(items);

    if (more) {
      const hidden = all.length - items.length;
      more.hidden = mode !== "featured" || hidden <= 0;
      const label = more.querySelector("[data-ver-mais-label]");
      if (label) {
        label.textContent = hidden > 0 ? `Ver mais (${all.length} projectos)` : "Ver mais";
      }
    }
  } catch {
    root.innerHTML = loadError;
    if (more) more.hidden = true;
  }
};

const listItems = (items, className = "") =>
  `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

const renderLinks = (linksMap) =>
  Object.entries(linksMap ?? {})
    .filter(([, href]) => Boolean(href))
    .map(([key, href]) => {
      const variant = key === "site" || key === "demo" ? "btn-primary" : "btn-ghost";
      return `<a class="btn ${variant}" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${linkLabel[key] ?? key}</a>`;
    })
    .join("");

const galleryImages = (project) => {
  const seen = new Set();
  return [project.imagens?.capa, ...(project.imagens?.galeria ?? [])].filter((image) => {
    if (!image?.ficheiro || seen.has(image.ficheiro)) return false;
    seen.add(image.ficheiro);
    return true;
  });
};

const renderDetail = (project, all) => {
  const index = all.findIndex((item) => item.id === project.id);
  const prev = all[index - 1];
  const next = all[index + 1];
  const capa = project.imagens?.capa;
  const cliente = [project.cliente?.nome, project.cliente?.sector, project.cliente?.localizacao]
    .filter(Boolean)
    .join(" \u00b7 ");
  const gallery = galleryImages(project)
    .map(
      (image) => `
        <figure>
          <button type="button" class="gallery-shot" data-full="${escapeHtml(image.ficheiro)}" data-alt="${escapeHtml(image.alt || project.nome)}">
            <img src="${escapeHtml(image.ficheiro)}" alt="${escapeHtml(image.alt || project.nome)}" />
          </button>
          ${image.legenda ? `<figcaption>${escapeHtml(image.legenda)}</figcaption>` : ""}
        </figure>`
    )
    .join("");

  return `
    <header class="detail-hero">
      <p class="kicker"><a href="projetos.html">Projectos</a> / ${escapeHtml(project.categoria)}</p>
      <h1>${escapeHtml(project.nome)}</h1>
      <p class="lede">${escapeHtml(project.subtitulo || project.descricao)}</p>
      <div class="detail-facts">
        <p><strong>Tipo</strong> ${escapeHtml(project.tipo)}</p>
        <p><strong>Estado</strong> ${escapeHtml(estadoLabel[project.estado] || project.estado)}</p>
        ${project.ano ? `<p><strong>Ano</strong> ${escapeHtml(project.ano)}</p>` : ""}
        ${project.papel ? `<p><strong>Papel</strong> ${escapeHtml(project.papel)}</p>` : ""}
        ${project.duracao ? `<p><strong>Dura\u00e7\u00e3o</strong> ${escapeHtml(project.duracao)}</p>` : ""}
        ${cliente ? `<p><strong>Cliente</strong> ${escapeHtml(cliente)}</p>` : ""}
      </div>
      <div class="actions">${renderLinks(project.links)}</div>
    </header>

    ${capa ? `<div class="detail-cover"><img src="${escapeHtml(capa.ficheiro)}" alt="${escapeHtml(capa.alt || project.nome)}" /></div>` : ""}

    <section class="detail-copy">
      <p>${escapeHtml(project.descricao)}</p>
    </section>

    <div class="detail-split">
      ${project.problema ? `<article class="card"><h2>Problema</h2><p>${escapeHtml(project.problema)}</p></article>` : ""}
      ${project.solucao ? `<article class="card"><h2>Solu\u00e7\u00e3o</h2><p>${escapeHtml(project.solucao)}</p></article>` : ""}
    </div>

    ${project.impacto?.length ? `<section class="card detail-block"><h2>Impacto</h2>${listItems(project.impacto, "detail-list")}</section>` : ""}
    ${project.funcionalidades?.length ? `<section class="card detail-block"><h2>Funcionalidades</h2>${listItems(project.funcionalidades, "detail-list")}</section>` : ""}
    ${project.desafios?.length ? `<section class="card detail-block"><h2>Desafios</h2>${listItems(project.desafios, "detail-list")}</section>` : ""}

    ${project.tecnologias?.length ? `<section class="detail-block"><h2>Stack</h2><div class="chips">${project.tecnologias.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join("")}</div></section>` : ""}

    ${gallery ? `<section class="detail-block"><h2>Capturas</h2><div class="gallery">${gallery}</div></section>` : ""}

    <nav class="detail-nav">
      ${prev ? `<a href="${projectHref(prev.id)}">\u2190 ${escapeHtml(prev.nome)}</a>` : "<span></span>"}
      <a href="projetos.html">Todos os projectos</a>
      ${next ? `<a href="${projectHref(next.id)}">${escapeHtml(next.nome)} \u2192</a>` : "<span></span>"}
    </nav>
  `;
};

const mountProjectDetail = async () => {
  const root = document.querySelector("[data-projecto-detalhe]");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");

  try {
    const all = await loadProjects();
    const project = all.find((item) => item.id === id);
    if (!project) {
      root.innerHTML =
        '<p class="project-empty">Projecto n\u00e3o encontrado. <a class="project-link" href="projetos.html">Ver todos</a></p>';
      return;
    }

    document.title = `${project.nome} \u2014 Nzongo Pedro`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", project.subtitulo || project.descricao);
    root.innerHTML = renderDetail(project, all);

    const lightbox = document.querySelector("[data-lightbox]");
    const lightboxImg = lightbox?.querySelector("img");
    root.querySelectorAll(".gallery-shot").forEach((button) => {
      button.addEventListener("click", () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = button.dataset.full;
        lightboxImg.alt = button.dataset.alt ?? "";
        lightbox.showModal();
      });
    });
  } catch {
    root.innerHTML = loadError;
  }
};

mountProjectList();
mountProjectDetail();
