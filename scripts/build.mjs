import {
  cp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onboarding } from "../src/content/onboarding.mjs";
import { detailedProjects } from "../src/content/projects-detailed.mjs";
import { companies, projects, site } from "../src/content/site.mjs";
import { detailedStories } from "../src/content/stories-detailed.mjs";
import { stories } from "../src/content/stories.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourceMedia = path.join(root, "src/media");
const sourceMarks = path.join(root, "src/company-marks");
const dist = path.join(root, "dist");
const assets = path.join(dist, "assets");
const mediaOut = path.join(assets, "media");
const marksOut = path.join(assets, "company-marks");
const fontsOut = path.join(assets, "fonts");
const downloadsOut = path.join(dist, "downloads");

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const ensurePage = async (route, html) => {
  const pageDir = path.join(dist, route);
  await mkdir(pageDir, { recursive: true });
  await writeFile(path.join(pageDir, "index.html"), html);
};

const lineLink = (href, label, current = false) =>
  `<a class="line-link" href="${href}"${current ? ' aria-current="page"' : ""}>${escapeHtml(label)}</a>`;

const header = (current = "") => `
  <header class="site-header site-shell">
    <a class="brand" href="/">Rory's Portfolio</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open menu">
      <span></span>
      <span></span>
    </button>
    <nav class="nav" id="primary-navigation" aria-label="Primary navigation">
      ${lineLink("/", "Shipped Products", current === "projects")}
      ${lineLink("/new-blog/", "Stories", current === "stories")}
      ${lineLink("/about-me/", "About", current === "about")}
    </nav>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="footer-inner site-shell">
      <div class="footer-social">
        <p class="footer-label">Follow Me</p>
        <a class="linkedin-link" href="${site.linkedin}" aria-label="LinkedIn">in</a>
      </div>
      <div class="footer-links">
        ${lineLink("/", "Shipped Products")}
        ${lineLink("/new-blog/", "Stories")}
        ${lineLink("/about-me/", "About")}
      </div>
      <p class="footer-quote">${escapeHtml(site.quote)}</p>
    </div>
  </footer>`;

const document = ({ title, description = "", current = "", body }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="theme-color" content="#ffffff">
    <title>${escapeHtml(title)}</title>
    <link rel="preload" href="/assets/fonts/manrope-latin.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="/assets/styles.css">
  </head>
  <body>
    ${header(current)}
    ${body}
    ${footer()}
    <script src="/assets/site.js" defer></script>
  </body>
</html>`;

const companyChip = (name) => {
  const company = companies[name];
  return `<span class="company-chip">
    <img src="/assets/company-marks/${company.mark}" alt="" aria-hidden="true">
    ${escapeHtml(company.label)}
  </span>`;
};

const renderHome = () => {
  const cards = projects
    .map(
      (project) => `
        <article class="project-card">
          <a class="project-card__media" href="/${project.slug}/" aria-label="${escapeHtml(project.title)}">
            <span class="card-media__clip">
              <img src="/assets/media/${project.cover}" alt="${escapeHtml(project.title)}" loading="lazy">
            </span>
          </a>
          <h2><a href="/${project.slug}/">${escapeHtml(project.title)}</a></h2>
          ${companyChip(project.company)}
        </article>`,
    )
    .join("");

  return document({
    title: "Rory's Portfolio",
    description: "Selected product design work by Rory Hart.",
    current: "projects",
    body: `
      <main class="site-shell">
        <section class="home-intro">
          <h1>Head of Design at <a class="employer line-link" href="https://finance.yahoo.com/" target="_blank" rel="noreferrer">Yahoo Finance</a></h1>
        </section>
        <section class="project-grid" aria-label="Shipped products">
          ${cards}
        </section>
      </main>`,
  });
};

const renderStoriesIndex = () => {
  const cards = stories
    .map(
      (story) => `
        <article class="story-card">
          <a class="story-card__media" href="/${story.slug}/" aria-label="${escapeHtml(story.title)}">
            <span class="card-media__clip">
              <img src="/assets/media/${story.cover}" alt="${escapeHtml(story.title)}" loading="lazy">
            </span>
          </a>
          <h2><a href="/${story.slug}/">${escapeHtml(story.title)}</a></h2>
          <p>${escapeHtml(story.excerpt)}</p>
        </article>`,
    )
    .join("");

  return document({
    title: "Stories — Rory Hart",
    description: "Stories about product design, research, strategy and leadership.",
    current: "stories",
    body: `
      <main class="site-shell">
        <section class="stories-intro">
          <h1>Stories</h1>
          <p>Notes on product design, research, collaboration and building teams.</p>
        </section>
        <section class="story-grid" aria-label="Stories">
          ${cards}
        </section>
      </main>`,
  });
};

const renderAbout = () =>
  document({
    title: "About — Rory Hart",
    description: "About Rory Hart, product design leader.",
    current: "about",
    body: `
      <main class="about-main">
        <h1>About</h1>
        <p class="about-lead">
          Thanks for visiting. Feel free to drop me a line on
          <a class="line-link" href="${site.linkedin}">LinkedIn</a>.
        </p>
        <div class="about-grid">
          <section class="about-card">
            <h2>Professional</h2>
            <p>I am an enthusiastic, highly driven and experienced UX and Product Design leader with a passion for building products. I turn strategy into engaging, meaningful and valuable user experiences, and help multi-disciplinary teams push the boundaries of web, mobile and living room design.</p>
            <a class="resume-link" href="/downloads/Rory-Hart-Resume.pdf" download>Download Resume <span aria-hidden="true">↓</span></a>
          </section>
          <section class="about-card">
            <h2>Personal</h2>
            <p>When I’m not working, I stay active with bike rides, running and football. I’m a foodie with a sweet tooth, a failing techno producer, a frequent live-music attendee and a video-game fan with a pretty mediocre retro collection.</p>
          </section>
        </div>
      </main>`,
  });

const chevron = (direction) =>
  direction === "left"
    ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const normalizeCarouselImage = (image) =>
  typeof image === "string" ? { src: image, caption: "" } : image;

const renderCarousel = (images, label) => {
  const slides = images.map(normalizeCarouselImage);
  const hasCaptions = slides.some((image) => image.caption);

  return `
  <div class="carousel${hasCaptions ? " carousel--captioned" : ""}" data-carousel tabindex="0" aria-label="${escapeHtml(label)}">
    <div class="carousel__viewport">
      ${slides
        .map(
          (image, index) =>
            `<img class="carousel__slide${index === 0 ? " is-current" : ""}" src="/assets/media/${image.src}" alt="${escapeHtml(image.caption || `${label}, image ${index + 1} of ${slides.length}`)}" data-caption="${escapeHtml(image.caption || "")}" aria-hidden="${index === 0 ? "false" : "true"}"${index === 0 ? "" : ' loading="lazy"'}>`,
        )
        .join("")}
    </div>
    <button class="carousel__button carousel__button--prev" type="button" data-previous aria-label="Previous image">${chevron("left")}</button>
    <button class="carousel__button carousel__button--next" type="button" data-next aria-label="Next image">${chevron("right")}</button>
    ${
      hasCaptions
        ? `<div class="carousel__footer" aria-live="polite">
      <span class="carousel__caption">${escapeHtml(slides[0].caption || "")}</span>
      <span class="carousel__counter">1 / ${slides.length}</span>
    </div>`
        : `<span class="carousel__counter" aria-live="polite">1 / ${slides.length}</span>`
    }
  </div>`;
};

const renderSection = (section) => {
  const parts = {
    copy: `
      ${(section.body || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
      ${section.subheading ? `<h3>${escapeHtml(section.subheading)}</h3>` : ""}
      ${section.list ? `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}`,
    gallery: section.gallery ? renderCarousel(section.gallery, section.heading) : "",
    media: section.media
      ? `<figure class="media-card"><img src="/assets/media/${section.media}" alt="${escapeHtml(section.heading)}"></figure>`
      : "",
  };
  const order = section.order || ["copy", "gallery", "media"];

  return `
  <section class="article-section${section.continuation ? " article-section--continuation" : ""}">
    <h2>${escapeHtml(section.heading)}</h2>
    ${order.map((key) => parts[key] || "").join("")}
  </section>`;
};

const renderOnboarding = () => {
  const currentIndex = projects.findIndex((item) => item.slug === onboarding.slug);
  const previous = projects[currentIndex - 1];
  const next = projects[currentIndex + 1];

  return document({
    title: `${onboarding.title} — Rory Hart`,
    description: onboarding.summary,
    current: "projects",
    body: `
      <main class="project-main site-shell">
        <header class="project-hero">
          <div class="project-meta">
            <span class="meta-chip">${escapeHtml(onboarding.date)}</span>
            ${companyChip(onboarding.company)}
          </div>
          <h1 class="project-title">${escapeHtml(onboarding.title)}</h1>
          <div class="summary-card">
            <p>${escapeHtml(onboarding.summary)}</p>
            <div class="skill-list" aria-label="Responsibilities">
              ${onboarding.responsibilities.map((item) => `<span class="skill-chip">${escapeHtml(item)}</span>`).join("")}
            </div>
          </div>
        </header>
        <article class="article">
          ${onboarding.sections.map(renderSection).join("")}
        </article>
      </main>
      <nav class="project-pagination" aria-label="Project navigation">
        <a class="line-link" href="/${previous.slug}/">← ${escapeHtml(previous.title)}</a>
        <a class="line-link" href="/${next.slug}/">${escapeHtml(next.title)} →</a>
      </nav>`,
  });
};

const renderDetailedBlock = (block, sectionHeading) => {
  if (block.type === "paragraph") {
    return `<p>${escapeHtml(block.text)}</p>`;
  }
  if (block.type === "gallery") {
    return renderCarousel(block.images, sectionHeading);
  }
  if (block.type === "image") {
    return `<figure class="media-card"><img src="/assets/media/${block.image}" alt="${escapeHtml(sectionHeading)}" loading="lazy"></figure>`;
  }
  return "";
};

const renderDetailedPage = (project) => {
  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];
  const hasContent = project.sections.some((section) => section.blocks.length);
  const sections = hasContent
    ? project.sections
        .map(
          (section) => `
            <section class="article-section">
              <h2>${escapeHtml(section.heading)}</h2>
              ${section.blocks.map((block) => renderDetailedBlock(block, section.heading)).join("")}
            </section>`,
        )
        .join("")
    : `
      <section class="article-section">
        <figure class="media-card">
          <img src="/assets/media/${project.cover}" alt="${escapeHtml(project.title)}">
        </figure>
      </section>`;

  return document({
    title: `${project.title} — Rory Hart`,
    description: project.summary,
    current: "projects",
    body: `
      <main class="project-main site-shell">
        <header class="project-hero">
          <div class="project-meta">
            ${project.date ? `<span class="meta-chip">${escapeHtml(project.date)}</span>` : ""}
            ${companyChip(project.company)}
          </div>
          <h1 class="project-title">${escapeHtml(project.title)}</h1>
          <div class="summary-card">
            <p>${escapeHtml(project.summary)}</p>
          </div>
        </header>
        <article class="article">${sections}</article>
      </main>
      <nav class="project-pagination" aria-label="Project navigation">
        <a class="line-link" href="/${previous.slug}/">← ${escapeHtml(previous.title)}</a>
        <a class="line-link" href="/${next.slug}/">${escapeHtml(next.title)} →</a>
      </nav>`,
  });
};

const renderStoryPage = (story) => {
  const currentIndex = stories.findIndex((item) => item.slug === story.slug);
  const previous = stories[(currentIndex - 1 + stories.length) % stories.length];
  const next = stories[(currentIndex + 1) % stories.length];
  const sections = story.sections
    .map(
      (section) => `
        <section class="article-section">
          <h2>${escapeHtml(section.heading)}</h2>
          ${section.blocks.map((block) => renderDetailedBlock(block, section.heading)).join("")}
        </section>`,
    )
    .join("");

  return document({
    title: `${story.title} — Rory Hart`,
    description: story.excerpt,
    current: "stories",
    body: `
      <main class="project-main site-shell">
        <header class="project-hero">
          ${story.date ? `<div class="project-meta"><span class="meta-chip">${escapeHtml(story.date)}</span></div>` : ""}
          <h1 class="project-title">${escapeHtml(story.title)}</h1>
          <div class="summary-card">
            <p>${escapeHtml(story.excerpt)}</p>
          </div>
        </header>
        <article class="article">${sections}</article>
      </main>
      <nav class="project-pagination" aria-label="Story navigation">
        <a class="line-link" href="/${previous.slug}/">← ${escapeHtml(previous.title)}</a>
        <a class="line-link" href="/${next.slug}/">${escapeHtml(next.title)} →</a>
      </nav>`,
  });
};

const build = async () => {
  await rm(dist, { recursive: true, force: true });
  await mkdir(mediaOut, { recursive: true });
  await mkdir(marksOut, { recursive: true });
  await mkdir(fontsOut, { recursive: true });
  await mkdir(downloadsOut, { recursive: true });

  const css = await readFile(path.join(root, "src/styles.css"), "utf8");
  const js = await readFile(path.join(root, "src/site.js"), "utf8");
  await writeFile(path.join(assets, "styles.css"), css);
  await writeFile(path.join(assets, "site.js"), js);
  await writeFile(path.join(dist, ".nojekyll"), "");
  await cp(path.join(root, "src/fonts"), fontsOut, { recursive: true });
  await cp(
    path.join(root, "src/downloads/Rory-Hart-Resume.pdf"),
    path.join(downloadsOut, "Rory-Hart-Resume.pdf"),
  );

  for (const company of Object.values(companies)) {
    await cp(path.join(sourceMarks, company.mark), path.join(marksOut, company.mark));
  }

  const media = new Set(projects.map((project) => project.cover));
  for (const section of onboarding.sections) {
    if (section.media) media.add(section.media);
    for (const image of section.gallery || []) {
      media.add(normalizeCarouselImage(image).src);
    }
  }
  for (const project of detailedProjects) {
    for (const section of project.sections) {
      for (const block of section.blocks) {
        if (block.type === "image") media.add(block.image);
        for (const image of block.images || []) {
          media.add(normalizeCarouselImage(image).src);
        }
      }
    }
  }
  for (const story of detailedStories) {
    media.add(story.cover);
    for (const section of story.sections) {
      for (const block of section.blocks) {
        if (block.type === "image") media.add(block.image);
        for (const image of block.images || []) {
          media.add(normalizeCarouselImage(image).src);
        }
      }
    }
  }
  for (const image of media) {
    await cp(path.join(sourceMedia, image), path.join(mediaOut, image));
  }

  const home = renderHome();
  await writeFile(path.join(dist, "index.html"), home);
  await ensurePage("home", home);
  await ensurePage("new-blog", renderStoriesIndex());
  await ensurePage("about-me", renderAbout());

  for (const project of projects) {
    const details = detailedProjects.find((item) => item.slug === project.slug);
    const page =
      project.slug === onboarding.slug
        ? renderOnboarding()
        : renderDetailedPage(details);
    await ensurePage(project.slug, page);
  }
  for (const story of detailedStories) {
    await ensurePage(story.slug, renderStoryPage(story));
  }

  console.log(
    `Built ${projects.length} project routes and ${stories.length} story routes in ${dist}`,
  );
};

await build();
