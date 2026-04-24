/* ============================================
   GOOD TAXI 45 — Script commun
   - Menu mobile (hamburger)
   - Scroll smooth (ancres internes)
   - Mise en évidence du lien actif dans la nav
   ============================================ */

(function () {
  "use strict";

  /* ---------- 1. MENU MOBILE ---------- */
  function initMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const isOpen = nav.classList.toggle("is-open");
      toggle.classList.toggle("is-active", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      // Empêche le scroll du body lorsque le menu est ouvert
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Ferme le menu lorsqu'on clique sur un lien
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Ferme le menu si on repasse en desktop
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 960) {
        nav.classList.remove("is-open");
        toggle.classList.remove("is-active");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  /* ---------- 2. SCROLL SMOOTH (ancres internes) ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const headerHeight =
          document.querySelector(".site-header")?.offsetHeight || 0;
        const targetTop =
          target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });
      });
    });
  }

  /* ---------- 3. LIEN ACTIF DANS LA NAV ---------- */
  function initActiveNavLink() {
    const links = document.querySelectorAll(".main-nav a");
    if (!links.length) return;

    // Récupère le nom du fichier courant (ex: "particuliers.html")
    let currentPage = window.location.pathname.split("/").pop();
    if (!currentPage || currentPage === "") currentPage = "index.html";

    links.forEach(function (link) {
      const href = link.getAttribute("href");
      if (!href) return;

      const linkPage = href.split("/").pop().split("#")[0];

      if (linkPage === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  /* ---------- 4. REVEAL ON SCROLL ---------- */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- 5. YEAR ---------- */
  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- INITIALISATION ---------- */
  function init() {
    initMobileMenu();
    initSmoothScroll();
    initActiveNavLink();
    initReveal();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
