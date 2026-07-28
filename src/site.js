const carousels = document.querySelectorAll("[data-carousel]");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

if (menuToggle && primaryNavigation) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("menu-open");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
    document.body.classList.toggle("menu-open", !isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 520) closeMenu();
  });
}

for (const carousel of carousels) {
  const slides = [...carousel.querySelectorAll(".carousel__slide")];
  const counter = carousel.querySelector(".carousel__counter");
  const caption = carousel.querySelector(".carousel__caption");
  let current = 0;

  const show = (next) => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-current", index === current);
      slide.setAttribute("aria-hidden", index === current ? "false" : "true");
    });
    counter.textContent = `${current + 1} / ${slides.length}`;
    if (caption) caption.textContent = slides[current].dataset.caption || "";
  };

  carousel
    .querySelector("[data-previous]")
    .addEventListener("click", () => show(current - 1));
  carousel
    .querySelector("[data-next]")
    .addEventListener("click", () => show(current + 1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  let startX = null;
  carousel.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
    },
    { passive: true },
  );
  carousel.addEventListener(
    "touchend",
    (event) => {
      if (startX === null) return;
      const distance = event.changedTouches[0].clientX - startX;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
      startX = null;
    },
    { passive: true },
  );
}
