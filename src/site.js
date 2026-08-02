const carousels = document.querySelectorAll("[data-carousel]");

const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const navRocket = document.querySelector("[data-nav-rocket]");

if (navRocket && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const rocketStateKey = "nav-rocket-thrust";
  const shippedProductsLink = navRocket.parentElement?.querySelector('a[href="/"]');
  let pointerX = -1000;
  let pointerY = -1000;
  let frame = null;
  let currentThrust = 0;

  const applyThrust = (thrust) => {
    currentThrust = Math.max(0, Math.min(1, thrust));
    navRocket.style.setProperty("--flame-scale", (0.62 + currentThrust * 1.9).toFixed(3));
    navRocket.style.setProperty("--flame-glow", `${(2 + currentThrust * 7).toFixed(2)}px`);
    navRocket.style.setProperty("--flame-flicker-duration", `${Math.round(390 - currentThrust * 210)}ms`);
    navRocket.style.setProperty("--flame-inner-duration", `${Math.round(270 - currentThrust * 125)}ms`);
    navRocket.style.setProperty("--shake", `${(currentThrust * 1.35).toFixed(2)}px`);
    navRocket.style.setProperty("--shake-duration", `${Math.round(680 - currentThrust * 590)}ms`);
  };

  try {
    const savedState = JSON.parse(sessionStorage.getItem(rocketStateKey));
    if (
      Number.isFinite(savedState?.thrust)
      && Date.now() - savedState.savedAt < 3000
    ) {
      applyThrust(savedState.thrust);
    }
    sessionStorage.removeItem(rocketStateKey);
  } catch {
    // Continue with the idle state when session storage is unavailable.
  }

  const updateRocket = () => {
    const rect = navRocket.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(pointerX - centerX, pointerY - centerY);
    const thrust = Math.max(0, Math.min(1, 1 - distance / 260));

    applyThrust(thrust);
    frame = null;
  };

  shippedProductsLink?.addEventListener("click", () => {
    try {
      sessionStorage.setItem(rocketStateKey, JSON.stringify({
        thrust: currentThrust,
        savedAt: Date.now(),
      }));
    } catch {
      // The animation can still reset safely when session storage is unavailable.
    }
  });

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(updateRocket);
  }, { passive: true });

  document.documentElement.addEventListener("pointerleave", () => {
    pointerX = -1000;
    pointerY = -1000;
    if (!frame) frame = requestAnimationFrame(updateRocket);
  });
}

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
    if (window.innerWidth > 760) closeMenu();
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
