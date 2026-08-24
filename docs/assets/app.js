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

const skillLogos = {
  php: "https://cdn.simpleicons.org/php/777BB4",
  laravel: "https://cdn.simpleicons.org/laravel/FF2D20",
  livewire: "https://cdn.simpleicons.org/livewire/4E56A6",
  api: "https://cdn.simpleicons.org/swagger/85EA2D",
  mysql: "https://cdn.simpleicons.org/mysql/4479A1",
  postgresql: "https://cdn.simpleicons.org/postgresql/4169E1",
  vue: "https://cdn.simpleicons.org/vuedotjs/4FC08D",
  react: "https://cdn.simpleicons.org/react/61DAFB",
  typescript: "https://cdn.simpleicons.org/typescript/3178C6",
  javascript: "https://cdn.simpleicons.org/javascript/F7DF1E",
  tailwind: "https://cdn.simpleicons.org/tailwindcss/06B6D4",
  bootstrap: "https://cdn.simpleicons.org/bootstrap/7952B3",
  linux: "https://cdn.simpleicons.org/linux/FCC624",
  docker: "https://cdn.simpleicons.org/docker/2496ED",
  nginx: "https://cdn.simpleicons.org/nginx/009639",
  cicd: "https://cdn.simpleicons.org/githubactions/2088FF",
  git: "https://cdn.simpleicons.org/git/F05032",
  github: "https://cdn.simpleicons.org/github/58A6FF",
  cisco: "https://cdn.simpleicons.org/cisco/1BA0D7",
  ospf: "assets/skills/ospf.svg",
  voip: "assets/skills/voip.svg",
  esp32: "https://cdn.simpleicons.org/espressif/E7352C",
  arduino: "https://cdn.simpleicons.org/arduino/00878F",
  packettracer: "assets/skills/packet-tracer.svg",
};

const bindSkillLogos = () => {
  document.querySelectorAll(".skill").forEach((card) => {
    const glow = card.querySelector("[data-skill-logo]");
    const img = glow?.querySelector("img");
    if (!glow || !img) return;

    let hideTimer = 0;
    const showLogo = (skill) => {
      const src = skillLogos[skill];
      if (!src) return;
      window.clearTimeout(hideTimer);
      if (img.src !== new URL(src, window.location.href).href) {
        img.src = src;
      }
      card.classList.add("is-lit");
    };
    const hideLogo = () => {
      hideTimer = window.setTimeout(() => card.classList.remove("is-lit"), 90);
    };

    img.addEventListener("error", () => {
      card.classList.remove("is-lit");
    });

    card.querySelectorAll(".chip[data-skill]").forEach((chip) => {
      chip.addEventListener("mouseenter", () => showLogo(chip.dataset.skill));
      chip.addEventListener("focus", () => showLogo(chip.dataset.skill));
      chip.addEventListener("mouseleave", hideLogo);
      chip.addEventListener("blur", hideLogo);
    });
  });
};

bindSkillLogos();

const FEATURED_LIMIT = 4;
const HOME_COUNT = 5;

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
  const requestUrl = new URL("./data/projectos.json", window.location.href);
  const response = await fetch(requestUrl, { cache: "no-cache" });
  if (!response.ok) throw new Error("json");
  const data = await response.json();
  return data.projectos ?? [];
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
        <div class="project-tags">
          <span class="tag">${escapeHtml(project.categoria || project.tipo)}</span>
          ${project.confidencial ? '<span class="tag tag-private">Privado</span>' : ""}
        </div>
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
    const homeList = all.slice(0, HOME_COUNT);
    const items = mode === "featured" ? homeList : sortProjects(all);

    if (mode === "featured" && homeList.length > FEATURED_LIMIT) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = homeList.map(renderCard).join("");
      const duration = Math.max(22, homeList.length * 6);

      root.classList.add("is-slider");
      root.innerHTML = `
        <div class="project-slider" data-project-slider>
          <div class="project-track is-marquee" data-project-track style="--marquee-duration: ${duration}s">
            <div class="project-marquee-set">${cards}</div>
            <div class="project-marquee-set" aria-hidden="true" inert>${cards}</div>
          </div>
        </div>
      `;

      if (reduceMotion) {
        root.classList.remove("is-slider");
        root.innerHTML = listMarkup(homeList);
      }
    } else {
      root.innerHTML = listMarkup(items);
    }

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
    .join(", ");
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

  const cover = capa
    ? `<div class="detail-cover"><img src="${escapeHtml(capa.ficheiro)}" alt="${escapeHtml(capa.alt || project.nome)}" /></div>`
    : "";

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

    ${cover}

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

    document.title = `${project.nome} | Nzongo Pedro`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", project.subtitulo || project.descricao);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${project.nome} | Nzongo Pedro`);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", project.subtitulo || project.descricao);
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
